import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getWebContainer, runCommand } from './webcontainer';
import { useProjectStore } from '../store/projectStore';

// ─── ZIP EXPORT ───────────────────────────────────────────────────────────────

export async function exportAsZip(
  files: Record<string, string>,
  projectName: string = 'nexus-project'
): Promise<void> {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  // Add README if not present
  if (!files['README.md']) {
    zip.file('README.md', generateReadme(projectName, files));
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  saveAs(blob, `${sanitizeName(projectName)}.zip`);
}

// ─── BUILD & DOWNLOAD DIST ────────────────────────────────────────────────────

export async function buildAndDownload(
  projectName: string = 'nexus-project',
  onLog?: (line: string) => void
): Promise<void> {
  const store = useProjectStore.getState();

  if (!store.isBooted) {
    throw new Error('WebContainer is not ready');
  }

  onLog?.('🔨 Building project (npm run build)...');

  // Run build
  const exitCode = await runCommand('npm', ['run', 'build'], {
    onOutput: (data) => {
      data.split('\n').forEach(line => {
        if (line.trim()) onLog?.(line.trim());
      });
    },
    onError: (data) => {
      onLog?.(`❌ ${data}`);
    },
  });

  if (exitCode !== 0) {
    throw new Error('Build failed. Check the terminal for errors.');
  }

  onLog?.('📦 Build complete! Collecting dist files...');

  // Read dist folder from WebContainer
  const wc = await getWebContainer();
  const distFiles: Record<string, string | Uint8Array> = {};

  async function readDir(dir: string) {
    try {
      const entries = await wc.fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else {
          try {
            // Try as text first
            const content = await wc.fs.readFile(fullPath, 'utf-8');
            distFiles[fullPath] = content;
          } catch {
            // Binary file
            const content = await wc.fs.readFile(fullPath);
            distFiles[fullPath] = content;
          }
        }
      }
    } catch {
      // Dir doesn't exist or can't read
    }
  }

  await readDir('dist');

  if (Object.keys(distFiles).length === 0) {
    throw new Error('No dist files found. Build may have failed.');
  }

  onLog?.(`📁 Found ${Object.keys(distFiles).length} files in dist/`);

  // Create ZIP of dist
  const zip = new JSZip();
  for (const [path, content] of Object.entries(distFiles)) {
    const relativePath = path.replace('dist/', '');
    if (typeof content === 'string') {
      zip.file(relativePath, content);
    } else {
      zip.file(relativePath, content);
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  saveAs(blob, `${sanitizeName(projectName)}-dist.zip`);
  onLog?.(`✅ Downloaded ${sanitizeName(projectName)}-dist.zip`);
}

// ─── SINGLE HTML EXPORT ───────────────────────────────────────────────────────

export async function exportAsSingleHtml(
  files: Record<string, string>,
  projectName: string = 'nexus-project',
  onLog?: (line: string) => void
): Promise<void> {
  const store = useProjectStore.getState();

  if (store.isBooted && files['package.json']) {
    // Try to build first and use dist/index.html
    try {
      onLog?.('🔨 Building for single-file export...');
      await buildAndDownload(projectName, onLog);
      return;
    } catch (e) {
      onLog?.('⚠️ Build failed, falling back to source export...');
    }
  }

  // Fallback: export source HTML with inline scripts
  onLog?.('📄 Generating single HTML file...');
  const html = generateInlineHtml(files, projectName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${sanitizeName(projectName)}.html`);
  onLog?.('✅ Downloaded single HTML file');
}

// ─── NETLIFY DROP EXPORT ──────────────────────────────────────────────────────

export async function exportForNetlify(
  projectName: string = 'nexus-project',
  onLog?: (line: string) => void
): Promise<void> {
  onLog?.('🔨 Building for Netlify...');

  try {
    await buildAndDownload(projectName, onLog);
    onLog?.('✅ Upload the downloaded zip to Netlify Drop: https://app.netlify.com/drop');
  } catch (e) {
    throw e;
  }
}

// ─── COPY SHARE LINK ─────────────────────────────────────────────────────────

export async function exportToCodeSandbox(
  files: Record<string, string>,
  onLog?: (line: string) => void
): Promise<string> {
  onLog?.('🚀 Opening in CodeSandbox...');

  // CodeSandbox define API
  const sandboxFiles: Record<string, { content: string }> = {};
  for (const [path, content] of Object.entries(files)) {
    sandboxFiles[path] = { content };
  }

  // Use StackBlitz instead which has a simpler API
  return exportToStackBlitz(files, onLog);
}

export async function exportToStackBlitz(
  files: Record<string, string>,
  onLog?: (line: string) => void
): Promise<string> {
  onLog?.('🚀 Opening in StackBlitz...');

  // Build StackBlitz project URL using their API
  const pkg = files['package.json'] ? JSON.parse(files['package.json']) : {};

  const projectData = {
    title: pkg.name || 'NEXUS Project',
    description: 'Created with NEXUS AI IDE',
    template: 'node',
    files: Object.fromEntries(
      Object.entries(files).filter(([path]) => !path.includes('node_modules'))
    ),
  };

  // Use StackBlitz SDK approach via form POST
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://stackblitz.com/run';
  form.target = '_blank';

  const addField = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField('project[title]', projectData.title);
  addField('project[description]', projectData.description);
  addField('project[template]', 'node');

  for (const [path, content] of Object.entries(projectData.files)) {
    addField(`project[files][${path}]`, content);
  }

  // Add startCommand
  const startCmd = files['package.json']
    ? (JSON.parse(files['package.json']).scripts?.dev || 'npm run dev')
    : 'npm run dev';
  addField('project[settings][compile][trigger]', 'auto');
  addField('project[settings][startCommand]', startCmd);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  onLog?.('✅ Opened in StackBlitz!');
  return 'https://stackblitz.com';
}

// ─── GITHUB GIST EXPORT ───────────────────────────────────────────────────────

export async function copyProjectAsText(
  files: Record<string, string>,
  onLog?: (line: string) => void
): Promise<void> {
  const text = Object.entries(files)
    .map(([path, content]) => `// ===== ${path} =====\n${content}`)
    .join('\n\n');

  await navigator.clipboard.writeText(text);
  onLog?.('✅ Project copied to clipboard!');
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'project';
}

function generateReadme(projectName: string, files: Record<string, string>): string {
  const pkg = files['package.json'] ? JSON.parse(files['package.json']) : {};
  const deps = pkg.dependencies ? Object.keys(pkg.dependencies).join(', ') : 'none';
  const fileList = Object.keys(files).join('\n- ');

  return `# ${projectName}

Created with **NEXUS AI IDE** 🚀

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack

${deps}

## Files

- ${fileList}

---
*Generated by NEXUS AI Development Platform*
`;
}

function generateInlineHtml(files: Record<string, string>, projectName: string): string {
  const cssFiles = Object.entries(files)
    .filter(([p]) => p.endsWith('.css'))
    .map(([, content]) => `<style>${content}</style>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  ${cssFiles}
</head>
<body>
  <div style="font-family: monospace; padding: 2rem; text-align: center; color: #888;">
    <h2>📦 ${projectName}</h2>
    <p>This project requires a build step to run.</p>
    <p>Extract the ZIP file and run: <code>npm install && npm run dev</code></p>
    <hr/>
    <p>Or open in <a href="https://stackblitz.com" target="_blank">StackBlitz</a> online.</p>
  </div>
</body>
</html>`;
}
