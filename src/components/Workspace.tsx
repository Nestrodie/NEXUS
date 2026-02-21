import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, FolderTree, Wrench, Settings,
  Undo2, Redo2, Play, Rocket, X, Maximize2, Minimize2,
  RefreshCw, ExternalLink, Trash2, ChevronDown, PanelBottom,
} from 'lucide-react';
import ChatPanel from './workspace/ChatPanel';
import FileTree from './workspace/FileTree';
import CodeEditor from './workspace/CodeEditor';
import PreviewPanel from './workspace/PreviewPanel';
import TerminalPanel from './workspace/TerminalPanel';
import CodeActions from './workspace/CodeActions';
import ToolsPanel from './workspace/ToolsPanel';
import AISettings from './AISettings';
import DeployPanel from './DeployPanel';
import { useProjectStore } from '../store/projectStore';
import { bootWebContainer } from '../services/projectController';
import { useLang } from '../context/LanguageContext';

type MobileTab = 'chat' | 'code' | 'preview' | 'files' | 'terminal';
type LeftTab = 'chat' | 'files' | 'tools';
type BottomTab = 'terminal' | 'output';

export default function Workspace() {
  const { lang } = useLang();

  /* ── panel state ── */
  const [leftTab, setLeftTab]       = useState<LeftTab>('chat');
  const [leftOpen, setLeftOpen]     = useState(true);
  const [leftWidth, setLeftWidth]   = useState(340);

  const [rightOpen, setRightOpen]   = useState(true);
  const [rightMax, setRightMax]     = useState(true);   // ← Preview maximized by default
  const [rightWidth, setRightWidth] = useState(480);

  const [bottomOpen, setBottomOpen]     = useState(false);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [bottomTab, setBottomTab]       = useState<BottomTab>('terminal');
  const [bottomMax, setBottomMax]       = useState(false);

  const [mobileTab, setMobileTab]   = useState<MobileTab>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);

  /* ── drag refs ── */
  const dragging  = useRef<'left' | 'right' | 'bottom' | null>(null);
  const dragStart = useRef({ pos: 0, size: 0 });

  const {
    isBooting, isInstalling, isGenerating, isBooted,
    apiKey, files, selectedCode, previewUrl, terminalOutput,
    undo, redo, canUndo, canRedo, clearTerminal,
  } = useProjectStore();

  const fileCount = Object.keys(files).length;

  /* ── boot ── */
  useEffect(() => { bootWebContainer().catch(console.error); }, []);
  useEffect(() => {
    if (!apiKey) {
      const t = setTimeout(() => setShowSettings(true), 600);
      return () => clearTimeout(t);
    }
  }, [apiKey]);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (canUndo()) undo(); }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); if (canRedo()) redo(); }
      if (mod && e.key === '`') { e.preventDefault(); setBottomOpen(p => !p); }
      if (mod && e.key === 'b') { e.preventDefault(); setLeftOpen(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, canUndo, canRedo]);

  /* ── drag logic ── */
  const startDrag = useCallback((type: 'left' | 'right' | 'bottom') => (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = type;
    const isVert = type === 'bottom';
    const size = type === 'left' ? leftWidth : type === 'right' ? rightWidth : bottomHeight;
    dragStart.current = { pos: isVert ? e.clientY : e.clientX, size };
    document.body.style.cursor  = isVert ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftWidth, rightWidth, bottomHeight]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragging.current;
      if (!d) return;
      const isVert = d === 'bottom';
      const delta = (isVert ? e.clientY : e.clientX) - dragStart.current.pos;
      if (d === 'left')   setLeftWidth(Math.max(240, Math.min(560, dragStart.current.size + delta)));
      if (d === 'right')  setRightWidth(Math.max(280, Math.min(760, dragStart.current.size - delta)));
      if (d === 'bottom') setBottomHeight(Math.max(80, Math.min(500, dragStart.current.size - delta)));
    };
    const onUp = () => {
      dragging.current = null;
      document.body.style.cursor    = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  /* ── status ── */
  const statusLabel =
    isBooting    ? (lang === 'ru' ? 'Загрузка...'  : 'Booting...')   :
    isInstalling ? (lang === 'ru' ? 'Установка...' : 'Installing...') :
    isGenerating ? (lang === 'ru' ? 'Генерация...' : 'Generating...') :
    isBooted     ? (lang === 'ru' ? 'Готово'       : 'Ready')         : 'Standby';

  const statusColor = isBooting ? 'bg-orange' : isInstalling ? 'bg-cyan' :
    isGenerating ? 'bg-accent' : isBooted ? 'bg-green' : 'bg-surface-4';
  const isActive = isBooting || isInstalling || isGenerating;

  /* ── mobile tabs ── */
  const mobileTabs: { id: MobileTab; icon: typeof MessageSquare; label: string }[] = [
    { id: 'chat',     icon: MessageSquare, label: 'Chat' },
    { id: 'code',     icon: Undo2,         label: 'Code' },
    { id: 'preview',  icon: Maximize2,     label: lang === 'ru' ? 'Превью' : 'Preview' },
    { id: 'files',    icon: FolderTree,    label: lang === 'ru' ? 'Файлы'  : 'Files' },
    { id: 'terminal', icon: PanelBottom,   label: 'Term' },
  ];

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-0">

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="flex flex-col flex-1 md:hidden overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'chat'     && <ChatPanel />}
          {mobileTab === 'code'     && <CodeEditor />}
          {mobileTab === 'preview'  && <PreviewPanel />}
          {mobileTab === 'files'    && <div className="h-full overflow-auto touch-scroll"><FileTree /></div>}
          {mobileTab === 'terminal' && <div className="h-full"><TerminalPanel embedded /></div>}
        </div>
        {/* Mobile Bottom Nav */}
        <div className="bg-surface-1 border-t border-border safe-b shrink-0">
          <div className="flex h-[54px]">
            {mobileTabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMobileTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${mobileTab === id ? 'text-accent' : 'text-text-3 active:text-text-1'}`}
              >
                <Icon size={19} strokeWidth={mobileTab === id ? 2.2 : 1.6} />
                <span className="font-mono text-[9px] uppercase tracking-wide">{label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowSettings(true)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5
                ${!apiKey ? 'text-orange' : 'text-text-3 active:text-text-1'}`}
            >
              <Settings size={19} strokeWidth={1.6} />
              <span className="font-mono text-[9px] uppercase tracking-wide">AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">

        {/* ── TOOLBAR ─────────────────────────────────────────── */}
        <div className="h-10 flex items-center gap-0 shrink-0 bg-surface-1 border-b border-border select-none">

          {/* LEFT: three panel tabs */}
          <div className="flex items-stretch h-full border-r border-border shrink-0">
            {([
              { id: 'chat'  as LeftTab, icon: MessageSquare, label: lang === 'ru' ? 'Чат'           : 'AI Chat' },
              { id: 'files' as LeftTab, icon: FolderTree,    label: lang === 'ru' ? 'Файлы'         : 'Files',   badge: fileCount },
              { id: 'tools' as LeftTab, icon: Wrench,        label: lang === 'ru' ? 'Инструменты'  : 'Tools' },
            ] as { id: LeftTab; icon: typeof MessageSquare; label: string; badge?: number }[]).map(({ id, icon: Icon, label, badge }) => {
              const active = leftOpen && leftTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setLeftOpen(true); setLeftTab(id); }}
                  className={`relative flex items-center gap-1.5 h-full px-4 text-[12px] font-mono border-r border-border transition-colors
                    ${active
                      ? 'bg-surface-0 text-text-0 border-b-2 border-b-accent -mb-px'
                      : 'text-text-2 hover:text-text-1 hover:bg-surface-2'}`}
                >
                  <Icon size={13} className={active ? 'text-accent' : ''} />
                  <span>{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="px-1.5 py-px rounded-full bg-surface-3 text-[10px] font-bold text-text-2">{badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CENTER: actions + status */}
          <div className="flex items-center gap-2 px-3">
            <button onClick={() => undo()} disabled={!canUndo()}
              className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 disabled:opacity-25 transition-colors"
              title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
            <button onClick={() => redo()} disabled={!canRedo()}
              className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 disabled:opacity-25 transition-colors"
              title="Redo (Ctrl+Y)"><Redo2 size={14} /></button>
            <div className="w-px h-5 bg-border" />
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-green/10 text-green text-[12px] font-bold border border-green/20 hover:bg-green/20 transition-colors">
              <Play size={11} fill="currentColor" />
              {lang === 'ru' ? 'Запуск' : 'Run'}
            </button>
          </div>

          {/* STATUS PILL — center */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 h-6 rounded-full bg-surface-2 border border-border">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor} ${isActive ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-[11px] text-text-2">{statusLabel}</span>
            </div>
          </div>

          {/* RIGHT: toggles + settings + deploy */}
          <div className="flex items-center gap-1 px-2 shrink-0 border-l border-border">
            {/* Preview toggle */}
            <button
              onClick={() => {
                if (rightMax) { setRightMax(false); setRightOpen(true); }
                else if (rightOpen) { setRightOpen(false); }
                else { setRightOpen(true); }
              }}
              title="Toggle Preview"
              className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-mono transition-all
                ${rightOpen ? 'bg-surface-0 text-text-0 border border-border' : 'text-text-3 hover:text-text-1 hover:bg-surface-2'}`}
            >
              <Maximize2 size={12} />
              <span>{lang === 'ru' ? 'Превью' : 'Preview'}</span>
              {previewUrl && <span className="w-1.5 h-1.5 rounded-full bg-green" />}
            </button>

            {/* Terminal toggle */}
            <button
              onClick={() => setBottomOpen(p => !p)}
              title="Toggle Terminal (Ctrl+`)"
              className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-mono transition-all
                ${bottomOpen ? 'bg-surface-0 text-text-0 border border-border' : 'text-text-3 hover:text-text-1 hover:bg-surface-2'}`}
            >
              <PanelBottom size={12} />
              <span>{lang === 'ru' ? 'Терминал' : 'Terminal'}</span>
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-md transition-colors
                ${!apiKey ? 'text-orange bg-orange/10' : 'text-text-3 hover:text-text-1 hover:bg-surface-2'}`}
              title="AI Settings"
            >
              <Settings size={14} />
            </button>

            <button
              onClick={() => setShowDeploy(true)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-accent text-surface-0 text-[12px] font-bold hover:opacity-90 transition-opacity">
              <Rocket size={11} />
              {lang === 'ru' ? 'Деплой' : 'Deploy'}
            </button>
          </div>
        </div>

        {/* ── MAIN AREA ──────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT PANEL */}
          {leftOpen && (
            <>
              <div
                className="flex flex-col bg-surface-0 border-r border-border overflow-hidden shrink-0"
                style={{ width: leftWidth }}
              >
                {/* Panel header with close button only */}
                <div className="h-8 flex items-center justify-end bg-surface-1 border-b border-border shrink-0 px-2">
                  <button
                    onClick={() => setLeftOpen(false)}
                    className="px-2 py-1 text-text-3 hover:text-text-1 hover:bg-surface-2 rounded transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  {leftTab === 'chat'  && <ChatPanel />}
                  {leftTab === 'files' && <div className="h-full overflow-auto"><FileTree /></div>}
                  {leftTab === 'tools' && <ToolsPanel onClose={() => setLeftOpen(false)} />}
                </div>
              </div>

              {/* Left resize handle */}
              <div
                onMouseDown={startDrag('left')}
                className="w-1 shrink-0 bg-transparent hover:bg-accent/60 cursor-col-resize transition-colors z-10"
              />
            </>
          )}

          {/* CENTER + BOTTOM */}
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* Code Editor — hidden when preview is maximized */}
              {!rightMax && (
                <div className="flex-1 overflow-hidden min-w-0">
                  <CodeEditor />
                </div>
              )}

              {/* RIGHT PANEL — Preview */}
              {rightOpen && (
                <>
                  {/* Right resize handle (only when not maximized) */}
                  {!rightMax && (
                    <div
                      onMouseDown={startDrag('right')}
                      className="w-1 shrink-0 bg-transparent hover:bg-accent/60 cursor-col-resize transition-colors z-10"
                    />
                  )}

                  <div
                    className={`flex flex-col border-l border-border bg-surface-0 overflow-hidden shrink-0 ${rightMax ? 'flex-1' : ''}`}
                    style={rightMax ? {} : { width: rightWidth }}
                  >
                    {/* Preview header */}
                    <div className="h-9 flex items-center gap-2 px-3 border-b border-border shrink-0 bg-surface-1">
                      {/* URL bar */}
                      <div className="flex-1 min-w-0">
                        {previewUrl ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-0 border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0 animate-pulse" />
                            <span className="font-mono text-[10px] text-text-2 truncate">{previewUrl}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-0 border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-surface-4 shrink-0" />
                            <span className="font-mono text-[10px] text-text-3">
                              {lang === 'ru' ? 'Ожидание сервера...' : 'Waiting for server...'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {previewUrl && (
                          <>
                            <button
                              onClick={() => {
                                const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
                                if (iframe) { const s = iframe.src; iframe.src = ''; iframe.src = s; }
                              }}
                              className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                              title="Refresh"
                            ><RefreshCw size={12} /></button>
                            <a
                              href={previewUrl} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                              title="Open external"
                            ><ExternalLink size={12} /></a>
                          </>
                        )}
                        {/* Maximize/Restore */}
                        <button
                          onClick={() => setRightMax(p => !p)}
                          className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                          title={rightMax ? 'Restore' : 'Maximize'}
                        >
                          {rightMax ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        </button>
                        <button
                          onClick={() => { setRightOpen(false); setRightMax(false); }}
                          className="p-1.5 rounded-md text-text-3 hover:text-red hover:bg-surface-2 transition-colors"
                          title="Close Preview"
                        ><X size={12} /></button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <PreviewPanel />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* BOTTOM PANEL — Terminal */}
            {bottomOpen && (
              <>
                <div
                  onMouseDown={startDrag('bottom')}
                  className="h-1 shrink-0 bg-transparent hover:bg-accent/60 cursor-row-resize transition-colors z-10"
                />
                <div
                  className={`flex flex-col border-t border-border bg-surface-0 overflow-hidden shrink-0 ${bottomMax ? 'flex-1' : ''}`}
                  style={bottomMax ? {} : { height: bottomHeight }}
                >
                  {/* Terminal tab bar */}
                  <div className="flex items-stretch h-9 bg-surface-1 border-b border-border shrink-0">
                    {(['terminal', 'output'] as BottomTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setBottomTab(tab)}
                        className={`flex items-center gap-1.5 px-4 text-[11px] font-mono border-r border-border transition-colors
                          ${bottomTab === tab
                            ? 'bg-surface-0 text-text-0 border-b-2 border-b-accent -mb-px'
                            : 'text-text-3 hover:text-text-1 hover:bg-surface-2'}`}
                      >
                        {tab === 'terminal' ? (lang === 'ru' ? 'Терминал' : 'Terminal') : 'Output'}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {terminalOutput.length > 0 && (
                      <span className="flex items-center px-3 font-mono text-[10px] text-text-3 border-l border-border">
                        {terminalOutput.length} {lang === 'ru' ? 'строк' : 'lines'}
                      </span>
                    )}
                    <button onClick={() => setBottomMax(p => !p)}
                      className="px-2.5 text-text-3 hover:text-text-1 border-l border-border transition-colors">
                      {bottomMax ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                    <button onClick={() => clearTerminal()}
                      className="px-2.5 text-text-3 hover:text-text-1 border-l border-border transition-colors">
                      <Trash2 size={12} />
                    </button>
                    <button onClick={() => setBottomOpen(false)}
                      className="px-2.5 text-text-3 hover:text-red border-l border-border transition-colors">
                      <X size={12} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {bottomTab === 'terminal' && <TerminalPanel />}
                    {bottomTab === 'output' && (
                      <div className="h-full overflow-auto p-3 font-mono text-[12px] text-text-2 leading-relaxed">
                        {terminalOutput.length === 0
                          ? <span className="text-text-3">{lang === 'ru' ? 'Нет вывода' : 'No output yet'}</span>
                          : terminalOutput.map((line, i) => <div key={i}>{line || '\u00A0'}</div>)
                        }
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── STATUS BAR ─────────────────────────────────────── */}
        <div className="h-6 flex items-center px-3 gap-3 bg-surface-1 border-t border-border shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isBooted ? 'bg-green' : isBooting ? 'bg-orange animate-pulse' : 'bg-surface-4'}`} />
            <span className="font-mono text-[10px] text-text-3">
              {isBooted ? 'WebContainer Ready' : isBooting ? 'Booting...' : 'Standby'}
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <button
            onClick={() => { setLeftOpen(true); setLeftTab('files'); }}
            className="font-mono text-[10px] text-text-3 hover:text-text-1 transition-colors"
          >
            {fileCount} {lang === 'ru' ? 'файлов' : 'files'}
          </button>
          {previewUrl && (
            <>
              <div className="w-px h-3 bg-border" />
              <a
                href={previewUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] text-green hover:opacity-80 truncate max-w-[240px]"
              >
                {previewUrl}
              </a>
            </>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setBottomOpen(p => !p)}
            className="font-mono text-[10px] text-text-3 hover:text-text-1 transition-colors flex items-center gap-1"
          >
            <ChevronDown size={10} />
            {lang === 'ru' ? 'Терминал' : 'Terminal'}
          </button>
          <div className="w-px h-3 bg-border" />
          <span className="font-mono text-[10px] text-text-3">NEXUS v1.0</span>
        </div>
      </div>

      {selectedCode && <CodeActions />}
      {showSettings && <AISettings onClose={() => setShowSettings(false)} />}
      {showDeploy && <DeployPanel onClose={() => setShowDeploy(false)} />}
    </div>
  );
}
