import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIMessage } from '../services/ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: Record<string, string>;
  description?: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface FileSnapshot {
  files: Record<string, string>;
  timestamp: number;
}

interface ProjectState {
  // AI Config
  providerId: string;
  modelId: string;
  apiKey: string;
  setProvider: (id: string) => void;
  setModel: (id: string) => void;
  setApiKey: (key: string) => void;

  // Project
  projectName: string;
  setProjectName: (name: string) => void;

  // Files
  files: Record<string, string>;
  setFiles: (files: Record<string, string>) => void;
  updateFile: (path: string, content: string) => void;
  deleteFileFromStore: (path: string) => void;
  createFile: (path: string, content: string) => void;
  activeFile: string | null;
  setActiveFile: (path: string | null) => void;
  openFiles: string[];
  openFile: (path: string) => void;
  closeFile: (path: string) => void;

  // File History (Undo/Redo)
  fileHistory: FileSnapshot[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  getAIMessages: () => AIMessage[];
  getProjectContext: () => string;

  // Preview
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;

  // Terminal
  terminalOutput: string[];
  addTerminalOutput: (line: string) => void;
  clearTerminal: () => void;

  // Error handling
  lastError: string | null;
  setLastError: (error: string | null) => void;
  autoFixAttempts: number;
  incrementAutoFixAttempts: () => void;
  resetAutoFixAttempts: () => void;

  // UI State
  isBooting: boolean;
  setBooting: (b: boolean) => void;
  isBooted: boolean;
  setBooted: (b: boolean) => void;
  isInstalling: boolean;
  setInstalling: (b: boolean) => void;
  isGenerating: boolean;
  setGenerating: (b: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;

  // Code Actions
  selectedCode: { code: string; filePath: string } | null;
  setSelectedCode: (selection: { code: string; filePath: string } | null) => void;
}

const MAX_HISTORY = 50;
const MAX_TERMINAL_LINES = 500;
const MAX_CONTEXT_FILES = 10;
const MAX_FILE_SIZE = 5000;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // AI Config
      providerId: 'groq',
      modelId: 'llama-3.3-70b-versatile',
      apiKey: '',
      setProvider: (id) => set({ providerId: id }),
      setModel: (id) => set({ modelId: id }),
      setApiKey: (key) => set({ apiKey: key }),

      // Project
      projectName: 'untitled',
      setProjectName: (name) => set({ projectName: name }),

      // Files
      files: {},
      setFiles: (files) => {
        const state = get();
        if (Object.keys(state.files).length > 0) {
          state.pushHistory();
        }
        set({ files });
      },
      updateFile: (path, content) =>
        set((s) => ({ files: { ...s.files, [path]: content } })),
      deleteFileFromStore: (path) =>
        set((s) => {
          const files = { ...s.files };
          delete files[path];
          const openFiles = s.openFiles.filter((f) => f !== path);
          const activeFile = s.activeFile === path ? (openFiles[0] || null) : s.activeFile;
          return { files, openFiles, activeFile };
        }),
      createFile: (path, content) =>
        set((s) => {
          const files = { ...s.files, [path]: content };
          const openFiles = [...s.openFiles, path];
          return { files, openFiles, activeFile: path };
        }),
      activeFile: null,
      setActiveFile: (path) => set({ activeFile: path }),
      openFiles: [],
      openFile: (path) =>
        set((s) => {
          const openFiles = s.openFiles.includes(path) ? s.openFiles : [...s.openFiles, path];
          return { openFiles, activeFile: path };
        }),
      closeFile: (path) =>
        set((s) => {
          const openFiles = s.openFiles.filter((f) => f !== path);
          const activeFile = s.activeFile === path ? (openFiles[openFiles.length - 1] || null) : s.activeFile;
          return { openFiles, activeFile };
        }),

      // File History
      fileHistory: [],
      historyIndex: -1,
      pushHistory: () =>
        set((s) => {
          const snapshot: FileSnapshot = {
            files: { ...s.files },
            timestamp: Date.now(),
          };
          const newHistory = s.fileHistory.slice(0, s.historyIndex + 1);
          newHistory.push(snapshot);
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
          }
          return {
            fileHistory: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const snapshot = state.fileHistory[newIndex];
          set({
            files: snapshot.files,
            historyIndex: newIndex,
          });
        }
      },
      redo: () => {
        const state = get();
        if (state.historyIndex < state.fileHistory.length - 1) {
          const newIndex = state.historyIndex + 1;
          const snapshot = state.fileHistory[newIndex];
          set({
            files: snapshot.files,
            historyIndex: newIndex,
          });
        }
      },
      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().fileHistory.length - 1,

      // Chat
      chatMessages: [],
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      updateChatMessage: (id, updates) =>
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      clearChat: () => set({ chatMessages: [] }),
      
      getAIMessages: () => {
        const { chatMessages, files } = get();
        const msgs: AIMessage[] = [];

        // Add file context
        const fileList = Object.keys(files).filter(f => 
          !f.includes('node_modules') &&
          !f.includes('.lock') &&
          !f.endsWith('.svg') &&
          !f.endsWith('.png') &&
          !f.endsWith('.ico')
        );
        
        if (fileList.length > 0) {
          const contextFiles = fileList.slice(0, MAX_CONTEXT_FILES);
          const fileContext = contextFiles
            .map((f) => {
              const content = files[f];
              const truncated = content.length > MAX_FILE_SIZE 
                ? content.slice(0, MAX_FILE_SIZE) + '\n// ... (truncated)'
                : content;
              return `--- ${f} ---\n${truncated}`;
            })
            .join('\n\n');
          
          msgs.push({
            role: 'user',
            content: `Current project files:\n${fileContext}`,
          });
          msgs.push({
            role: 'assistant',
            content: 'I can see your project. How can I help?',
          });
        }

        // Add recent chat history
        const recentMessages = chatMessages.slice(-20);
        for (const msg of recentMessages) {
          msgs.push({ role: msg.role, content: msg.content });
        }

        return msgs;
      },

      getProjectContext: () => {
        const { files, terminalOutput, lastError } = get();
        
        const fileList = Object.keys(files).filter(f => 
          !f.includes('node_modules') && !f.includes('.lock')
        );
        
        let context = `Files: ${fileList.join(', ')}\n\n`;
        
        // Add key files content
        const keyFiles = ['package.json', 'src/App.jsx', 'src/App.tsx', 'src/main.jsx', 'src/main.tsx'];
        for (const f of keyFiles) {
          if (files[f]) {
            const content = files[f].length > 2000 ? files[f].slice(0, 2000) + '\n...' : files[f];
            context += `--- ${f} ---\n${content}\n\n`;
          }
        }
        
        // Add recent terminal output
        if (terminalOutput.length > 0) {
          const recent = terminalOutput.slice(-20).join('\n');
          context += `Recent terminal output:\n${recent}\n\n`;
        }
        
        // Add error if present
        if (lastError) {
          context += `Current error:\n${lastError}\n`;
        }
        
        return context;
      },

      // Preview
      previewUrl: null,
      setPreviewUrl: (url) => set({ previewUrl: url }),

      // Terminal
      terminalOutput: [],
      addTerminalOutput: (line) =>
        set((s) => {
          const output = [...s.terminalOutput, line];
          return { terminalOutput: output.slice(-MAX_TERMINAL_LINES) };
        }),
      clearTerminal: () => set({ terminalOutput: [] }),

      // Error handling
      lastError: null,
      setLastError: (error) => set({ lastError: error }),
      autoFixAttempts: 0,
      incrementAutoFixAttempts: () =>
        set((s) => ({ autoFixAttempts: s.autoFixAttempts + 1 })),
      resetAutoFixAttempts: () => set({ autoFixAttempts: 0 }),

      // UI State
      isBooting: false,
      setBooting: (b) => set({ isBooting: b }),
      isBooted: false,
      setBooted: (b) => set({ isBooted: b }),
      isInstalling: false,
      setInstalling: (b) => set({ isInstalling: b }),
      isGenerating: false,
      setGenerating: (b) => set({ isGenerating: b }),
      showTerminal: false,
      setShowTerminal: (show) => set({ showTerminal: show }),

      // Code Actions
      selectedCode: null,
      setSelectedCode: (selection) => set({ selectedCode: selection }),
    }),
    {
      name: 'nexus-project',
      partialize: (state) => ({
        providerId: state.providerId,
        modelId: state.modelId,
        apiKey: state.apiKey,
      }),
    }
  )
);
