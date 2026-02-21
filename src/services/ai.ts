export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  baseUrl: string;
  needsKey: boolean;
  freeNote?: string;
}

export interface AIModel {
  id: string;
  name: string;
  fast?: boolean;
  contextWindow?: number;
  description?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', fast: true, contextWindow: 128000, description: 'Best for complex tasks' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', fast: true, contextWindow: 131072, description: 'Ultra fast responses' },
      { id: 'llama3-70b-8192', name: 'Llama 3 70B', contextWindow: 8192, description: 'Balanced performance' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', fast: true, contextWindow: 32768, description: 'Great for coding' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', fast: true, contextWindow: 8192, description: 'Google model' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', contextWindow: 128000, description: 'Reasoning model' },
    ],
    baseUrl: 'https://api.groq.com/openai/v1',
    needsKey: true,
    freeNote: 'Free: 30 req/min, fastest inference',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', fast: true, contextWindow: 128000, description: 'Ultra fast inference' },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', fast: true, contextWindow: 128000, description: 'Fastest small model' },
      { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', fast: true, contextWindow: 128000, description: 'Latest Llama 4' },
    ],
    baseUrl: 'https://api.cerebras.ai/v1',
    needsKey: true,
    freeNote: 'Free: ultra-fast chip inference',
  },
  {
    id: 'google',
    name: 'Google AI',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', fast: true, contextWindow: 1048576, description: 'Latest, 1M context' },
      { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', fast: true, contextWindow: 1048576, description: 'Best Gemini model' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', fast: true, contextWindow: 1048576, description: '1M context window' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2097152, description: '2M context, best quality' },
      { id: 'gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Thinking', contextWindow: 32767, description: 'Reasoning model' },
    ],
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    needsKey: true,
    freeNote: 'Free: 15 req/min, huge context',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', contextWindow: 131072, description: 'Free tier' },
      { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen3 235B', contextWindow: 40960, description: 'Huge model, free' },
      { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1', contextWindow: 163840, description: 'Best reasoning, free' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', fast: true, contextWindow: 1048576, description: 'Free tier' },
      { id: 'microsoft/phi-4:free', name: 'Phi-4', fast: true, contextWindow: 16384, description: 'Microsoft model' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', fast: true, contextWindow: 32768, description: 'Fast & free' },
      { id: 'qwen/qwq-32b:free', name: 'QwQ 32B', contextWindow: 32768, description: 'Reasoning model' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', contextWindow: 131072, description: 'NVIDIA tuned' },
    ],
    baseUrl: 'https://openrouter.ai/api/v1',
    needsKey: true,
    freeNote: 'Many free models, aggregator',
  },
  {
    id: 'together',
    name: 'Together AI',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', fast: true, contextWindow: 131072 },
      { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B Turbo', fast: true, contextWindow: 131072 },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', fast: true, contextWindow: 32768 },
      { id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', name: 'DeepSeek R1 70B', contextWindow: 32768 },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', fast: true, contextWindow: 32768 },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B', contextWindow: 32768, description: 'Best for coding' },
    ],
    baseUrl: 'https://api.together.xyz/v1',
    needsKey: true,
    freeNote: 'Free $5 credit on signup',
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    models: [
      { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', fast: true, contextWindow: 128000 },
      { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', fast: true, contextWindow: 16384 },
      { id: 'DeepSeek-R1-Distill-Llama-70B', name: 'DeepSeek R1 70B', contextWindow: 32768 },
      { id: 'Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', contextWindow: 32768 },
      { id: 'Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B', contextWindow: 32768, description: 'Best for coding' },
    ],
    baseUrl: 'https://api.sambanova.ai/v1',
    needsKey: true,
    freeNote: 'Free: very fast inference',
  },
];

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are NEXUS, an elite full-stack AI developer. You run inside a browser-based WebContainer IDE and create complete, production-ready applications that work perfectly.

## YOUR CAPABILITIES
- Create full React/Vue/Vanilla JS apps with Vite
- Write Node.js backend code
- Design beautiful UIs with Tailwind CSS
- Fix bugs and errors automatically
- Refactor and improve existing code
- Add features to existing projects

## CRITICAL: RESPONSE FORMAT
When creating or modifying code, ALWAYS respond with exactly this JSON format:

\`\`\`json
{
  "thinking": "Brief analysis of the task",
  "files": {
    "package.json": "complete file content here",
    "vite.config.js": "complete file content here",
    "index.html": "complete file content here",
    "src/main.jsx": "complete file content here",
    "src/App.jsx": "complete file content here",
    "src/index.css": "complete file content here"
  },
  "commands": [],
  "description": "What was created/changed"
}
\`\`\`

## ABSOLUTE RULES - NEVER BREAK THESE:
1. **ALWAYS complete files** — Never truncate, never use "..." or "// existing code" or "rest of code"
2. **ALL required files** — Include every file needed to run the app from scratch
3. **WORKING CODE ONLY** — Must compile and run without errors
4. **VALID JSON** — Properly escape: newlines→\\n, quotes→\\", backslashes→\\\\
5. **NO PLACEHOLDERS** — Write every single line of code

## REQUIRED FILE STRUCTURE FOR REACT+VITE+TAILWIND:

### package.json (ALWAYS include):
\`\`\`
{
  "name": "project",
  "private": true,
  "type": "module",
  "scripts": {"dev": "vite --host", "build": "vite build", "preview": "vite preview"},
  "dependencies": {"react": "^18.3.1", "react-dom": "^18.3.1"},
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.8"
  }
}
\`\`\`

### vite.config.js (ALWAYS include):
\`\`\`
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
\`\`\`

### tailwind.config.js (ALWAYS include):
\`\`\`
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: []
}
\`\`\`

### postcss.config.js (ALWAYS include):
\`\`\`
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
\`\`\`

### index.html (ALWAYS include):
\`\`\`
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
\`\`\`

### src/main.jsx (ALWAYS include):
\`\`\`
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
\`\`\`

### src/index.css (ALWAYS include):
\`\`\`
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

## DESIGN REQUIREMENTS
- **Beautiful, modern UI** — professional quality, not basic/ugly
- **Tailwind CSS** for all styling — utility classes only
- **Mobile responsive** — works on all screen sizes  
- **Real content** — proper text, not "Lorem ipsum"
- **Smooth animations** — transitions, hover effects
- **Good color scheme** — don't just use gray
- **Proper spacing** — padding, margins, gaps
- **Typography hierarchy** — headings, body, captions

## CODING STANDARDS
- Functional React components with hooks
- useState, useEffect, useCallback, useMemo where appropriate
- Proper error boundaries and error handling
- Clean readable code with meaningful names
- Semantic HTML5 elements
- Accessibility: ARIA labels, alt text, keyboard navigation
- Performance: React.memo, useMemo for expensive computations

## WHEN MODIFYING EXISTING CODE
- Read all provided file context carefully
- Preserve existing functionality
- Only modify what's necessary
- Return ALL files including unchanged ones that import changed files
- Maintain existing code style and conventions

## WHEN FIXING ERRORS
1. Carefully read the error message
2. Identify the root cause (not just symptoms)
3. Fix the actual problem
4. Return ALL affected files completely
5. Explain what was wrong and why

## CONVERSATIONAL MODE
For questions, explanations, or discussions — respond naturally without JSON.
Use markdown formatting for clarity.
Be concise but thorough.`;

export const AGENT_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

## AGENT MODE — AUTONOMOUS EXECUTION
You are an autonomous agent. Execute the task completely and independently.

Plan your work, execute step by step, verify results.

Always respond with:
\`\`\`json
{
  "plan": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "currentStep": 1,
  "totalSteps": 3,
  "thinking": "What I'm doing and why",
  "files": { ... all files ... },
  "commands": [],
  "verification": "How to verify this works",
  "nextAction": "continue",
  "description": "What was accomplished in this step"
}
\`\`\`

"nextAction" values:
- "continue" — more steps remaining
- "complete" — task fully finished
- "error" — unrecoverable problem`;

// ─── API CALLERS ──────────────────────────────────────────────────────────────

async function callOpenAICompatible(
  messages: AIMessage[],
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'NEXUS AI IDE',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 32768,
      temperature: 0.1,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `API error ${response.status}: ${response.statusText}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errJson.message || errMsg;
    } catch {
      if (errText) errMsg = errText.slice(0, 300);
    }
    throw new Error(errMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk?.(content);
        }
      } catch {
        // skip invalid chunks
      }
    }
  }

  return fullText;
}

async function callGemini(
  messages: AIMessage[],
  apiKey: string,
  model: string,
  systemPrompt: string,
  onChunk?: (text: string) => void
): Promise<string> {
  // Build conversation turns — ensure alternating user/model
  const rawMessages = messages.filter(m => m.role !== 'system');
  const contents: { role: string; parts: { text: string }[] }[] = [];
  
  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i];
    const role = msg.role === 'assistant' ? 'model' : 'user';
    
    // Merge consecutive same-role messages
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n' + msg.content;
    } else {
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }

  // Ensure starts with user
  if (contents.length === 0 || contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 32768,
          topP: 0.95,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Gemini error ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errMsg;
    } catch {
      if (errText) errMsg = errText.slice(0, 300);
    }
    throw new Error(errMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullText += text;
          onChunk?.(text);
        }
      } catch {
        // skip
      }
    }
  }

  return fullText;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export interface SendMessageOptions {
  agentMode?: boolean;
  onChunk?: (text: string) => void;
}

export async function sendMessage(
  messages: AIMessage[],
  providerId: string,
  model: string,
  apiKey: string,
  options: SendMessageOptions = {}
): Promise<string> {
  const { agentMode = false, onChunk } = options;
  const systemPrompt = agentMode ? AGENT_SYSTEM_PROMPT : SYSTEM_PROMPT;

  if (providerId === 'google') {
    return callGemini(messages, apiKey, model, systemPrompt, onChunk);
  }

  const provider = AI_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  return callOpenAICompatible(messages, apiKey, provider.baseUrl, model, systemPrompt, onChunk);
}

// ─── RESPONSE PARSING ─────────────────────────────────────────────────────────

export interface ParsedResponse {
  files: Record<string, string> | null;
  commands: string[];
  description: string;
  textResponse: string;
  plan?: string[];
  thinking?: string;
  nextAction?: 'continue' | 'complete' | 'error';
  verification?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function parseAIResponse(text: string): ParsedResponse {
  // Strategy 1: Find ```json ... ``` block
  const jsonBlockMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonBlockMatch) {
    const result = tryParseJSON(jsonBlockMatch[1].trim(), text, jsonBlockMatch[0]);
    if (result) return result;
  }

  // Strategy 2: Find raw JSON with "files" key
  const rawJsonMatch = text.match(/(\{[\s\S]*?"files"\s*:\s*\{[\s\S]*?\}\s*\})/);
  if (rawJsonMatch) {
    const result = tryParseJSON(rawJsonMatch[1], text, rawJsonMatch[0]);
    if (result) return result;
  }

  // Strategy 3: Extract file blocks from markdown
  const fileBlocks = extractFileBlocks(text);
  if (Object.keys(fileBlocks).length > 0) {
    return {
      files: fileBlocks,
      commands: [],
      description: 'Files extracted from response',
      textResponse: text,
    };
  }

  // Pure text response
  return {
    files: null,
    commands: [],
    description: '',
    textResponse: text,
  };
}

function tryParseJSON(jsonStr: string, fullText: string, matchedBlock: string): ParsedResponse | null {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Try cleaning
    try {
      const cleaned = jsonStr
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      parsed = JSON.parse(cleaned);
    } catch {
      // Try extracting just files
      try {
        const filesMatch = jsonStr.match(/"files"\s*:\s*(\{[\s\S]*?\})\s*(?:,|\})/);
        if (filesMatch) {
          const files = JSON.parse(filesMatch[1]);
          return {
            files: processFiles(files),
            commands: [],
            description: 'Files extracted (JSON was malformed)',
            textResponse: fullText,
          };
        }
      } catch {
        return null;
      }
      return null;
    }
  }

  if (!parsed.files || typeof parsed.files !== 'object') return null;

  const files = processFiles(parsed.files as Record<string, unknown>);
  const textBefore = fullText.slice(0, fullText.indexOf(matchedBlock)).trim();
  const textAfter = fullText.slice(fullText.indexOf(matchedBlock) + matchedBlock.length).trim();
  const description = (parsed.description as string) || '';
  const textResponse = [textBefore, description, textAfter].filter(Boolean).join('\n\n') || 'Done!';

  return {
    files,
    commands: (parsed.commands as string[]) || [],
    description,
    textResponse,
    plan: parsed.plan as string[] | undefined,
    thinking: parsed.thinking as string | undefined,
    nextAction: parsed.nextAction as 'continue' | 'complete' | 'error' | undefined,
    verification: parsed.verification as string | undefined,
    currentStep: parsed.currentStep as number | undefined,
    totalSteps: parsed.totalSteps as number | undefined,
  };
}

function processFiles(raw: Record<string, unknown>): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(raw)) {
    if (typeof content === 'string') {
      files[path] = content
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }
  return files;
}

function extractFileBlocks(text: string): Record<string, string> {
  const files: Record<string, string> = {};
  const patterns = [
    /\/\/\s*FILE:\s*([a-zA-Z0-9_.\/\-]+)\s*\n```(?:\w+)?\n([\s\S]*?)```/g,
    /###\s+`?([a-zA-Z0-9_.\/\-]+\.[a-z]+)`?\s*\n```(?:\w+)?\n([\s\S]*?)```/g,
    /\*\*([a-zA-Z0-9_.\/\-]+\.[a-z]+)\*\*\s*\n```(?:\w+)?\n([\s\S]*?)```/g,
    /`([a-zA-Z0-9_.\/\-]+\.[a-z]+)`\s*\n```(?:\w+)?\n([\s\S]*?)```/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const path = match[1].trim();
      const content = match[2].trim();
      if (path && content && !path.includes(' ') && path.includes('.')) {
        files[path] = content;
      }
    }
  }

  return files;
}

// ─── PROMPT GENERATORS ────────────────────────────────────────────────────────

export function generateExplainPrompt(code: string, filePath: string): string {
  return `Explain this code from "${filePath}" clearly and in detail:\n\n\`\`\`\n${code}\n\`\`\`\n\nCover: what it does, how it works, any potential issues, and improvement suggestions.`;
}

export function generateRefactorPrompt(code: string, filePath: string, fullFile: string): string {
  return `Refactor and improve this code from "${filePath}" for better readability, performance, and maintainability:\n\nSelected code:\n\`\`\`\n${code}\n\`\`\`\n\nFull file context:\n\`\`\`\n${fullFile}\n\`\`\`\n\nReturn the complete improved file with the refactored code integrated. Explain the improvements made.`;
}

export function generateTestPrompt(code: string, filePath: string): string {
  return `Generate comprehensive unit tests for this code from "${filePath}":\n\n\`\`\`\n${code}\n\`\`\`\n\nUse Vitest + React Testing Library. Cover happy paths, edge cases, and error cases. Return complete test file.`;
}

export function generateFixPrompt(
  error: string,
  files: Record<string, string>,
  activeFile?: string,
  terminalOutput?: string[]
): string {
  let prompt = `Fix this error in my project:\n\n\`\`\`\n${error}\n\`\`\`\n\n`;

  if (terminalOutput && terminalOutput.length > 0) {
    const recent = terminalOutput.slice(-20).join('\n');
    prompt += `Recent terminal output:\n\`\`\`\n${recent}\n\`\`\`\n\n`;
  }

  if (activeFile && files[activeFile]) {
    const content = files[activeFile];
    const truncated = content.length > 6000 ? content.slice(0, 6000) + '\n// ...(truncated)' : content;
    prompt += `Active file "${activeFile}":\n\`\`\`\n${truncated}\n\`\`\`\n\n`;
  }

  const relatedFiles = Object.keys(files)
    .filter(f => f !== activeFile && !f.includes('node_modules') && !f.includes('.lock') && !f.includes('dist/'))
    .slice(0, 5);

  if (relatedFiles.length > 0) {
    prompt += 'Other project files:\n';
    for (const f of relatedFiles) {
      const content = files[f];
      const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n// ...' : content;
      prompt += `\n--- ${f} ---\n\`\`\`\n${truncated}\n\`\`\`\n`;
    }
  }

  prompt += '\nIdentify the root cause and provide the complete fixed file(s). Explain what was wrong.';
  return prompt;
}

export function generateAgentPrompt(task: string, context: string): string {
  return `[AUTONOMOUS AGENT TASK]\n\n${task}\n\nCurrent project context:\n${context}\n\nAnalyze the task, create a plan, and execute it completely. Create all necessary files for a working application.`;
}

export function generateImprovePrompt(content: string, filePath: string): string {
  return `Improve this file "${filePath}" — enhance performance, readability, UI quality, and user experience:\n\n\`\`\`\n${content}\n\`\`\`\n\nReturn the complete improved version with detailed explanation of changes.`;
}

export function generateDocumentationPrompt(files: Record<string, string>): string {
  const fileList = Object.keys(files).filter(f => !f.includes('node_modules')).join(', ');
  return `Generate comprehensive documentation (README.md) for this project.\n\nFiles: ${fileList}\n\nInclude: overview, features, installation, usage, tech stack, project structure. Make it professional.`;
}

// ─── PROJECT TEMPLATES ────────────────────────────────────────────────────────

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  tags: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-app',
    name: 'React App',
    description: 'Modern React with Vite & Tailwind',
    icon: 'RX',
    tags: ['react', 'vite', 'tailwind'],
    prompt: 'Create a beautiful modern React landing page with: hero section with gradient background, animated stats counter, features grid with icons, testimonials section, pricing cards with hover effects, and a footer. Use Tailwind CSS for styling. Make it look professional and polished.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Admin dashboard with charts',
    icon: 'DB',
    tags: ['react', 'charts', 'admin'],
    prompt: 'Create a comprehensive admin dashboard with: collapsible sidebar, top KPI cards with trend indicators, a beautiful line chart for revenue (pure SVG, no external chart library), a bar chart for monthly comparisons, a data table with sorting and filtering, user activity feed, and dark mode. Professional design.',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio with animations',
    icon: 'PF',
    tags: ['portfolio', 'animations'],
    prompt: 'Create a stunning developer portfolio with: animated hero with typing effect, smooth scroll navigation, about section with skills and progress bars, projects showcase with filter tabs, work experience timeline, contact form with validation, and scroll-triggered animations.',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Product store with cart',
    icon: 'EC',
    tags: ['shop', 'cart', 'products'],
    prompt: 'Create a complete e-commerce store with: product grid with filter sidebar (category, price range, rating), product detail modal with image gallery, add to cart with quantity, cart drawer with order summary, wishlist with heart toggle, search with live results, and mobile-responsive design.',
  },
  {
    id: 'todo-app',
    name: 'Task Manager',
    description: 'Full-featured kanban board',
    icon: 'TD',
    tags: ['react', 'state', 'crud'],
    prompt: 'Create a beautiful kanban board task manager with: multiple columns (Todo, In Progress, Done), drag-and-drop between columns, task creation with priority, due date, and labels, filter and search, progress indicators, and localStorage persistence.',
  },
  {
    id: 'chat-app',
    name: 'Chat UI',
    description: 'Modern chat interface',
    icon: 'CH',
    tags: ['chat', 'realtime', 'ui'],
    prompt: 'Create a beautiful chat app UI with: contact list sidebar with search, message bubbles with timestamps and status, typing indicator animation, emoji reactions, file attachment UI, image preview, voice message UI placeholder, group chat indicators, and online/offline status.',
  },
  {
    id: 'game',
    name: 'Browser Game',
    description: 'Snake game with canvas',
    icon: 'GM',
    tags: ['game', 'canvas', 'animation'],
    prompt: 'Create a modern Snake game with: smooth canvas animation at 60fps, increasing speed as score grows, particle effects on food collection, high score saved to localStorage, game over screen with best score, mobile touch swipe controls, and beautiful neon/cyberpunk visual style.',
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    description: 'Complete SaaS product page',
    icon: 'SL',
    tags: ['landing', 'saas', 'marketing'],
    prompt: 'Create a complete SaaS product landing page with: animated navbar with scroll effect, hero section with product mockup, social proof logos bar, feature comparison table, interactive demo section, customer testimonials with avatars, FAQ accordion, pricing plans with toggle (monthly/yearly), and a CTA footer.',
  },
];
