import { useProjectStore } from '../store/projectStore';
import {
  sendMessage,
  parseAIResponse,
  type AIMessage,
  generateFixPrompt,
  generateAgentPrompt,
} from './ai';
import { getWebContainer, writeFiles, startDevServer, runCommand } from './webcontainer';

const MAX_AUTO_FIX_ATTEMPTS = 3;
const MAX_AGENT_ITERATIONS = 5;

// ─── MAIN CHAT HANDLER ────────────────────────────────────────────────────────

export async function handleUserPrompt(userMessage: string, agentMode = false) {
  const store = useProjectStore.getState();
  const { providerId, modelId, apiKey } = store;

  if (!apiKey) {
    store.addChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '⚙️ Please configure your API key in **Settings** first.\n\nClick the settings icon in the toolbar to add your free API key.',
      timestamp: Date.now(),
    });
    return;
  }

  // Add user message
  const userMsg = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: userMessage,
    timestamp: Date.now(),
  };
  store.addChatMessage(userMsg);

  // Create streaming assistant message
  const assistantId = crypto.randomUUID();
  store.addChatMessage({
    id: assistantId,
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    isStreaming: true,
  });

  store.setGenerating(true);

  try {
    // Build smart context-aware messages
    const messages = buildContextMessages(store);
    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    let streamedContent = '';

    const fullResponse = await sendMessage(
      messages as AIMessage[],
      providerId,
      modelId,
      apiKey,
      {
        agentMode,
        onChunk: (chunk) => {
          streamedContent += chunk;
          store.updateChatMessage(assistantId, { content: streamedContent });
        },
      }
    );

    const parsed = parseAIResponse(fullResponse);

    // Show agent plan in terminal
    if (agentMode && parsed.plan && parsed.plan.length > 0) {
      store.addTerminalOutput('\n📋 Agent Plan:');
      parsed.plan.forEach((step, i) => {
        store.addTerminalOutput(`  ${i + 1}. ${step}`);
      });
      if (parsed.currentStep) {
        store.addTerminalOutput(`\n▶ Executing step ${parsed.currentStep}/${parsed.totalSteps || parsed.plan.length}...`);
      }
    }

    // Update message with final content
    store.updateChatMessage(assistantId, {
      content: parsed.textResponse || fullResponse,
      isStreaming: false,
      files: parsed.files || undefined,
      description: parsed.description || undefined,
    });

    // Apply generated files
    if (parsed.files && Object.keys(parsed.files).length > 0) {
      await applyGeneratedFiles(parsed.files, parsed.commands);
    }

    // Agent mode: continue if needed
    if (agentMode && parsed.nextAction === 'continue') {
      const currentStep = (parsed.currentStep || 1);
      const totalSteps = parsed.totalSteps || MAX_AGENT_ITERATIONS;

      if (currentStep < totalSteps && currentStep < MAX_AGENT_ITERATIONS) {
        store.addTerminalOutput(`\n🤖 Agent: step ${currentStep + 1}/${totalSteps}...`);
        const verifyNote = parsed.verification ? ` Verify: ${parsed.verification}.` : '';
        await handleUserPrompt(
          `Continue with step ${currentStep + 1} of ${totalSteps}.${verifyNote} Previous step completed: ${parsed.description}`,
          true
        );
      } else {
        store.addTerminalOutput('\n✅ Agent task completed!');
      }
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Better error messages
    let userFriendlyError = message;
    if (message.includes('401') || message.includes('Unauthorized')) {
      userFriendlyError = 'Invalid API key. Please check your API key in Settings.';
    } else if (message.includes('429') || message.includes('rate limit')) {
      userFriendlyError = 'Rate limit reached. Please wait a moment and try again.';
    } else if (message.includes('quota')) {
      userFriendlyError = 'API quota exceeded. Try a different provider or check your quota.';
    } else if (message.includes('model')) {
      userFriendlyError = `Model error: ${message}. Try selecting a different model.`;
    }

    store.updateChatMessage(assistantId, {
      content: `❌ **Error:** ${userFriendlyError}\n\nTip: Check your API key in Settings or try a different provider.`,
      isStreaming: false,
    });
    store.addTerminalOutput(`❌ AI Error: ${message}`);
  } finally {
    store.setGenerating(false);
  }
}

// ─── SMART CONTEXT BUILDER ────────────────────────────────────────────────────

function buildContextMessages(store: ReturnType<typeof useProjectStore.getState>): AIMessage[] {
  const { chatMessages, files } = store;
  const msgs: AIMessage[] = [];

  // Add file context if project exists
  const projectFiles = Object.keys(files).filter(f =>
    !f.includes('node_modules') &&
    !f.includes('.lock') &&
    !f.endsWith('.svg') &&
    !f.endsWith('.png') &&
    !f.endsWith('.ico') &&
    !f.startsWith('dist/')
  );

  if (projectFiles.length > 0) {
    // Prioritize important files for context
    const priority = [
      'package.json', 'vite.config.js', 'vite.config.ts',
      'src/App.jsx', 'src/App.tsx', 'src/main.jsx', 'src/main.tsx',
      'src/index.css', 'index.html', 'tailwind.config.js',
    ];

    const sortedFiles = [
      ...priority.filter(f => files[f]),
      ...projectFiles.filter(f => !priority.includes(f)),
    ].slice(0, 12);

    const fileContextParts = sortedFiles.map(f => {
      const content = files[f] || '';
      const maxLen = f === 'package.json' ? 1000 : 4000;
      const truncated = content.length > maxLen
        ? content.slice(0, maxLen) + '\n// ...(truncated for context)'
        : content;
      return `=== ${f} ===\n${truncated}`;
    });

    const fileContext = fileContextParts.join('\n\n');
    const totalFiles = Object.keys(files).length;
    const shownFiles = sortedFiles.length;

    msgs.push({
      role: 'user',
      content: `Current project has ${totalFiles} files. Showing ${shownFiles} key files:\n\n${fileContext}`,
    });
    msgs.push({
      role: 'assistant',
      content: `I can see your project with ${totalFiles} files. Ready to help!`,
    });
  }

  // Add recent chat history (last 16 messages to keep context manageable)
  const recentMessages = chatMessages.slice(-16);
  for (const msg of recentMessages) {
    if (msg.isStreaming) continue; // Skip incomplete messages
    msgs.push({
      role: msg.role,
      content: msg.content.slice(0, 8000), // Truncate very long messages
    });
  }

  return msgs;
}

// ─── FILE APPLICATION ─────────────────────────────────────────────────────────

export async function applyGeneratedFiles(
  files: Record<string, string>,
  commands: string[] = []
) {
  const store = useProjectStore.getState();
  const fileCount = Object.keys(files).length;

  store.addTerminalOutput(`\n📁 Applying ${fileCount} file${fileCount !== 1 ? 's' : ''}...`);

  // Save history snapshot before applying
  store.pushHistory();

  // Merge with existing files (new files override old)
  const currentFiles = store.files;
  const mergedFiles = { ...currentFiles, ...files };
  store.setFiles(mergedFiles);

  // Write to WebContainer
  try {
    await writeFiles(files);

    // Log each file with size
    for (const [path, content] of Object.entries(files)) {
      const size = formatSize(content.length);
      const lang = getFileLanguage(path);
      store.addTerminalOutput(`  ✓ ${path} [${lang}] (${size})`);
    }

    // Open best file in editor
    const filePriority = [
      (f: string) => f === 'src/App.jsx' || f === 'src/App.tsx',
      (f: string) => f.startsWith('src/') && (f.endsWith('.jsx') || f.endsWith('.tsx')),
      (f: string) => f.endsWith('.jsx') || f.endsWith('.tsx'),
      (f: string) => f.endsWith('.js') || f.endsWith('.ts'),
      (f: string) => f.endsWith('.css'),
      (_f: string) => true,
    ];

    for (const check of filePriority) {
      const found = Object.keys(files).find(check);
      if (found) {
        store.openFile(found);
        break;
      }
    }

    // Run additional commands (e.g., npm install new-package)
    for (const cmd of commands) {
      if (!cmd.trim()) continue;
      const cleanCmd = cmd.replace(/^\$\s*/, '').trim();
      store.addTerminalOutput(`\n$ ${cleanCmd}`);
      const parts = cleanCmd.split(/\s+/);
      try {
        const exitCode = await runCommand(parts[0], parts.slice(1), {
          onOutput: (data) => {
            data.split('\n').forEach(line => {
              if (line.trim()) store.addTerminalOutput(line);
            });
          },
        });
        if (exitCode !== 0) {
          store.addTerminalOutput(`⚠️ Command exited with code ${exitCode}`);
        }
      } catch (err) {
        store.addTerminalOutput(`⚠️ Command failed: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Start dev server if package.json was written
    if (files['package.json']) {
      store.addTerminalOutput('\n🚀 Starting development server...');
      await startProject();
    }

    store.addTerminalOutput(`\n✅ ${fileCount} file${fileCount !== 1 ? 's' : ''} applied successfully!`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    store.addTerminalOutput(`❌ File write error: ${message}`);
    store.setLastError(message);
  }
}

// ─── DEV SERVER ───────────────────────────────────────────────────────────────

let devServerProcess: { kill?: () => void } | null = null;

export async function startProject() {
  const store = useProjectStore.getState();

  store.setInstalling(true);
  store.addTerminalOutput('📦 Installing dependencies (npm install)...');

  let errorLines: string[] = [];
  let hasServerStarted = false;

  try {
    await startDevServer({
      onOutput: (data) => {
        const lines = data.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          store.addTerminalOutput(trimmed);

          // Track errors
          const isError = (
            trimmed.toLowerCase().includes('error') ||
            trimmed.includes('ERR!') ||
            trimmed.includes('Cannot find') ||
            trimmed.includes('Module not found') ||
            trimmed.includes('SyntaxError') ||
            trimmed.includes('TypeError') ||
            trimmed.includes('ReferenceError')
          );

          const isSuccess = (
            trimmed.includes('localhost') ||
            trimmed.includes('Local:') ||
            trimmed.includes('ready in') ||
            trimmed.toLowerCase().includes('vite') ||
            trimmed.includes('➜')
          );

          if (isSuccess) {
            // Clear errors when server starts successfully
            errorLines = [];
            store.setLastError(null);
          } else if (isError && !hasServerStarted) {
            errorLines.push(trimmed);
          }
        }
      },
      onError: (data) => {
        store.addTerminalOutput(`❌ ${data}`);
        errorLines.push(data);
      },
      onUrl: (url) => {
        hasServerStarted = true;
        store.setPreviewUrl(url);
        store.addTerminalOutput(`\n✅ Dev server ready: ${url}`);
        store.setInstalling(false);
        store.setLastError(null);
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    store.addTerminalOutput(`❌ Server start failed: ${message}`);

    if (!hasServerStarted) {
      const fullError = errorLines.length > 0
        ? errorLines.join('\n')
        : message;

      store.setLastError(fullError.slice(0, 1000));
      store.setInstalling(false);

      // Auto-fix if under attempt limit
      const currentAttempts = store.autoFixAttempts;
      if (currentAttempts < MAX_AUTO_FIX_ATTEMPTS) {
        store.addTerminalOutput(`\n🔧 Auto-fixing errors (attempt ${currentAttempts + 1}/${MAX_AUTO_FIX_ATTEMPTS})...`);
        setTimeout(() => fixErrorWithAI(true), 1500);
      }
    }
  }
}

// ─── WEBCONTAINER BOOT ────────────────────────────────────────────────────────

export async function bootWebContainer() {
  const store = useProjectStore.getState();

  if (store.isBooted) return;
  if (store.isBooting) return;

  store.setBooting(true);
  store.addTerminalOutput('⚡ Booting WebContainer...');

  try {
    await getWebContainer();
    store.addTerminalOutput('✅ WebContainer ready\n');
    store.setBooting(false);
    store.setBooted(true);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    store.addTerminalOutput(`❌ Boot failed: ${message}`);
    
    if (message.includes('SharedArrayBuffer') || message.includes('cross-origin')) {
      store.addTerminalOutput('\n⚠️ WebContainer requires specific browser headers.');
      store.addTerminalOutput('The preview feature requires a server with proper CORS headers.');
    }
    
    store.setBooting(false);
    throw error;
  }
}

// ─── ERROR AUTO-FIX ───────────────────────────────────────────────────────────

export async function fixErrorWithAI(autoRetry = false) {
  const store = useProjectStore.getState();
  const { lastError, activeFile, files, autoFixAttempts, terminalOutput } = store;

  if (!lastError) return;
  if (!store.apiKey) return;

  if (autoRetry && autoFixAttempts >= MAX_AUTO_FIX_ATTEMPTS) {
    store.addChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `⚠️ **Auto-fix limit reached** (${MAX_AUTO_FIX_ATTEMPTS} attempts without success).\n\nPlease describe the issue and I'll try a different approach.`,
      timestamp: Date.now(),
    });
    store.resetAutoFixAttempts();
    return;
  }

  if (autoRetry) store.incrementAutoFixAttempts();

  const prompt = generateFixPrompt(
    lastError,
    files,
    activeFile || undefined,
    terminalOutput.slice(-25)
  );

  store.setLastError(null);
  await handleUserPrompt(prompt);
}

// ─── AGENT MODE ───────────────────────────────────────────────────────────────

export async function runAgentTask(task: string) {
  const store = useProjectStore.getState();
  const context = store.getProjectContext();
  const prompt = generateAgentPrompt(task, context);
  await handleUserPrompt(prompt, true);
}

// ─── PROJECT OPERATIONS ───────────────────────────────────────────────────────

export async function regenerateProject() {
  const store = useProjectStore.getState();
  const firstUserMessage = store.chatMessages.find(m => m.role === 'user');
  if (!firstUserMessage) return;

  const originalPrompt = firstUserMessage.content;

  store.clearChat();
  store.setFiles({});
  store.clearTerminal();
  store.setPreviewUrl(null);
  store.resetAutoFixAttempts();
  store.setLastError(null);

  store.addTerminalOutput('♻️ Regenerating project...');
  await handleUserPrompt(originalPrompt);
}

export async function improveCurrentFile() {
  const store = useProjectStore.getState();
  const { activeFile, files } = store;
  if (!activeFile || !files[activeFile]) return;

  const prompt = `Improve this file "${activeFile}" — make it cleaner, more efficient, better designed:\n\n\`\`\`\n${files[activeFile]}\n\`\`\`\n\nReturn the complete improved version with explanations.`;
  await handleUserPrompt(prompt);
}

export async function generateDocumentation() {
  const store = useProjectStore.getState();
  const { files } = store;
  const fileList = Object.keys(files).filter(f => !f.includes('node_modules')).join(', ');

  const prompt = `Generate a comprehensive README.md for this project.\n\nProject files: ${fileList}\n\nPackage.json: ${files['package.json'] || 'not found'}\n\nCreate a professional README with: project overview, features, installation, usage, tech stack, and project structure.`;
  await handleUserPrompt(prompt);
}

export async function explainProject() {
  const store = useProjectStore.getState();
  const { files } = store;
  const fileList = Object.keys(files).filter(f => !f.includes('node_modules'));

  const keyFiles = ['src/App.jsx', 'src/App.tsx', 'package.json'].filter(f => files[f]);
  const context = keyFiles.map(f => `${f}:\n${files[f]?.slice(0, 2000)}`).join('\n\n');

  const prompt = `Explain this project to me:\n\nFiles: ${fileList.join(', ')}\n\nKey files:\n${context}\n\nExplain: what it does, how it works, key components, and how to extend it.`;
  await handleUserPrompt(prompt);
}

export async function executeTerminalCommand(command: string) {
  const store = useProjectStore.getState();
  store.addTerminalOutput(`\n$ ${command}`);

  const parts = command.trim().split(/\s+/);
  if (parts.length === 0) return;

  try {
    const exitCode = await runCommand(parts[0], parts.slice(1), {
      onOutput: (data) => {
        data.split('\n').forEach(line => {
          if (line.trim()) store.addTerminalOutput(line);
        });
      },
      onError: (data) => {
        store.addTerminalOutput(data);
        store.setLastError(data);
      },
    });

    if (exitCode !== 0) {
      store.addTerminalOutput(`Process exited with code ${exitCode}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Command failed';
    store.addTerminalOutput(`❌ ${message}`);
  }
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const langs: Record<string, string> = {
    tsx: 'TSX', ts: 'TS', jsx: 'JSX', js: 'JS',
    css: 'CSS', html: 'HTML', json: 'JSON',
    md: 'MD', svg: 'SVG', sh: 'SH',
  };
  return langs[ext] || ext.toUpperCase() || 'FILE';
}

export { devServerProcess };
