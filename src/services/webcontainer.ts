import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) return webcontainerInstance;
  if (bootPromise) return bootPromise;

  bootPromise = WebContainer.boot().then((instance) => {
    webcontainerInstance = instance;
    return instance;
  });

  return bootPromise;
}

export async function writeFile(path: string, content: string) {
  const wc = await getWebContainer();
  const parts = path.split('/');
  if (parts.length > 1) {
    const dir = parts.slice(0, -1).join('/');
    await wc.fs.mkdir(dir, { recursive: true });
  }
  await wc.fs.writeFile(path, content);
}

export async function readFile(path: string): Promise<string> {
  const wc = await getWebContainer();
  const content = await wc.fs.readFile(path, 'utf-8');
  return content;
}

export async function deleteFile(path: string) {
  const wc = await getWebContainer();
  await wc.fs.rm(path, { recursive: true });
}

export async function listDir(path: string): Promise<{ name: string; isDirectory: boolean }[]> {
  const wc = await getWebContainer();
  try {
    const entries = await wc.fs.readdir(path, { withFileTypes: true });
    return entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
    }));
  } catch {
    return [];
  }
}

export async function readDirRecursive(
  basePath: string = '.'
): Promise<{ path: string; content: string }[]> {
  const wc = await getWebContainer();
  const results: { path: string; content: string }[] = [];

  async function walk(dir: string) {
    const entries = await wc.fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') continue;
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        try {
          const content = await wc.fs.readFile(fullPath, 'utf-8');
          results.push({ path: fullPath, content });
        } catch {
          // skip binary files
        }
      }
    }
  }

  await walk(basePath);
  return results;
}

export interface RunProcessOptions {
  onOutput?: (data: string) => void;
  onError?: (data: string) => void;
}

export async function runCommand(
  command: string,
  args: string[] = [],
  options?: RunProcessOptions
) {
  const wc = await getWebContainer();
  const process = await wc.spawn(command, args);

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        options?.onOutput?.(data);
      },
    })
  );

  const exitCode = await process.exit;
  return exitCode;
}

export async function startDevServer(
  options?: RunProcessOptions & { onUrl?: (url: string) => void }
) {
  const wc = await getWebContainer();

  wc.on('server-ready', (_port, url) => {
    options?.onUrl?.(url);
  });

  // Install dependencies first
  options?.onOutput?.('📦 Installing dependencies...\n');
  const installExit = await runCommand('npm', ['install'], options);
  if (installExit !== 0) {
    options?.onError?.('Failed to install dependencies\n');
    return;
  }

  options?.onOutput?.('🚀 Starting dev server...\n');
  const process = await wc.spawn('npm', ['run', 'dev']);

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        options?.onOutput?.(data);
      },
    })
  );

  return process;
}

export async function writeFiles(files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    await writeFile(path, content);
  }
}
