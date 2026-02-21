export interface SavedProject {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  fileCount: number;
  createdAt: number;
  updatedAt: number;
  previewUrl?: string;
  providerId?: string;
  modelId?: string;
}

const STORAGE_KEY = 'nexus-saved-projects';
const MAX_PROJECTS = 20;

export function getAllProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProject[];
  } catch {
    return [];
  }
}

export function saveProject(project: SavedProject): void {
  try {
    const projects = getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);

    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }

    // Limit total storage — trim large file contents if needed
    const trimmed = projects.slice(0, MAX_PROJECTS).map(p => ({
      ...p,
      // Keep files but truncate large ones to save space
      files: Object.fromEntries(
        Object.entries(p.files).map(([k, v]) => [k, v.length > 50000 ? v.slice(0, 50000) : v])
      ),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getAllProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    //
  }
}

export function updateProject(id: string, updates: Partial<SavedProject>): void {
  try {
    const projects = getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index >= 0) {
      projects[index] = { ...projects[index], ...updates, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  } catch {
    //
  }
}

export function createProjectFromState(
  prompt: string,
  files: Record<string, string>,
  providerId: string,
  modelId: string,
  previewUrl?: string | null
): SavedProject {
  const name = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;
  return {
    id: crypto.randomUUID(),
    name,
    description: prompt,
    files,
    fileCount: Object.keys(files).length,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    previewUrl: previewUrl || undefined,
    providerId,
    modelId,
  };
}

export function timeAgo(ts: number, lang: 'en' | 'ru' = 'en'): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (lang === 'ru') {
    if (d > 0) return `${d} дн. назад`;
    if (h > 0) return `${h} ч. назад`;
    if (m > 0) return `${m} мин. назад`;
    return 'только что';
  }

  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}
