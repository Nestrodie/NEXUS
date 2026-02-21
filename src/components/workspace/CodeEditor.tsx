import { useCallback, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useLang } from '../../context/LanguageContext';
import { X, Undo2, Redo2, Save } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';
import { writeFile } from '../../services/webcontainer';
import type { editor } from 'monaco-editor';

function getLanguage(path: string): string {
  if (path.endsWith('.tsx')) return 'typescript';
  if (path.endsWith('.ts')) return 'typescript';
  if (path.endsWith('.jsx')) return 'javascript';
  if (path.endsWith('.js')) return 'javascript';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.md')) return 'markdown';
  return 'plaintext';
}

export default function CodeEditor() {
  const { } = useLang();
  const { isDark } = useTheme();
  const { 
    files, 
    activeFile, 
    openFiles, 
    openFile, 
    closeFile, 
    updateFile,
    setSelectedCode,
    undo,
    redo,
    canUndo,
    canRedo,
    isBooted,
  } = useProjectStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const content = activeFile ? files[activeFile] || '' : '';

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Add keyboard shortcuts
    editor.addCommand(2048 + 83, () => { // Ctrl+S
      handleSave();
    });

    // Add context menu action for code selection
    editor.addAction({
      id: 'ai-action',
      label: 'AI Actions...',
      keybindings: [2048 + 75], // Ctrl+K
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: () => {
        const selection = editor.getSelection();
        if (selection && activeFile) {
          const selectedText = editor.getModel()?.getValueInRange(selection);
          if (selectedText && selectedText.trim()) {
            setSelectedCode({
              code: selectedText,
              filePath: activeFile,
            });
          }
        }
      },
    });

    // Listen for selection changes
    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      if (selection && !selection.isEmpty() && activeFile) {
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (selectedText && selectedText.trim().length > 10) {
          // Only show actions for meaningful selections
          setSelectedCode({
            code: selectedText,
            filePath: activeFile,
          });
        }
      }
    });
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile, value);
    }
  }, [activeFile, updateFile]);

  const handleSave = async () => {
    if (activeFile && isBooted) {
      try {
        await writeFile(activeFile, content);
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }
  };

  if (openFiles.length === 0) {
    return (
      <div className="h-full bg-surface-1" />
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface-1">
      {/* Tabs with Undo/Redo */}
      <div className="h-10 flex items-center justify-between px-2 bg-surface-0 border-b border-border">
        <div className="flex items-center gap-0.5 overflow-x-auto flex-1">
          {openFiles.map((filePath) => {
            const fileName = filePath.split('/').pop() || filePath;
            const isActive = activeFile === filePath;
            return (
              <div
                key={filePath}
                onClick={() => openFile(filePath)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-mono shrink-0 transition-colors ${
                  isActive
                    ? 'bg-surface-1 text-text-0 border border-border'
                    : 'text-text-2 hover:text-text-1'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green' : 'bg-surface-3'}`} />
                {fileName}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(filePath);
                  }}
                  className="p-0.5 hover:text-red transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={handleSave}
            disabled={!isBooted}
            className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-accent/10 
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Save (Ctrl+S)"
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage(activeFile || '')}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={isDark ? 'vs-dark' : 'light'}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderWhitespace: 'none',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-7 px-4 flex items-center justify-between bg-surface-0 border-t border-border font-mono text-[11px] text-text-3">
        <div className="flex items-center gap-4">
          <span>{getLanguage(activeFile || '').toUpperCase()}</span>
          <span>UTF-8</span>
          <span className="text-text-2">Ctrl+K for AI</span>
        </div>
        <span className="truncate max-w-[200px]">{activeFile}</span>
      </div>
    </div>
  );
}
