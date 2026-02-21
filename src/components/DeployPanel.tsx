import { useState } from 'react';
import {
  X, Package, Globe, ExternalLink, Copy, Check,
  Rocket, FileArchive, Loader, AlertCircle, Terminal,
  CloudUpload,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useLang } from '../context/LanguageContext';
import {
  exportAsZip,
  buildAndDownload,
  exportToStackBlitz,
  copyProjectAsText,
} from '../services/exportService';

interface DeployPanelProps {
  onClose: () => void;
}

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DeployPanel({ onClose }: DeployPanelProps) {
  const { lang } = useLang();
  const { files, projectName, isBooted, addTerminalOutput } = useProjectStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fileCount = Object.keys(files).length;
  const hasFiles = fileCount > 0;

  const addLog = (line: string) => {
    setLogs(prev => [...prev, line]);
    addTerminalOutput(line);
  };

  const runAction = async (id: string, fn: () => Promise<void>) => {
    setActiveAction(id);
    setStatus('loading');
    setLogs([]);
    try {
      await fn();
      setStatus('success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addLog(`❌ Error: ${msg}`);
      setStatus('error');
    } finally {
      setActiveAction(null);
    }
  };

  const copyWithFeedback = async (id: string, fn: () => Promise<void>) => {
    await fn();
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const t = {
    title: lang === 'ru' ? 'Деплой и экспорт' : 'Deploy & Export',
    subtitle: lang === 'ru' ? 'Скачай или задеплой проект' : 'Download or deploy your project',
    noFiles: lang === 'ru' ? 'Нет файлов для экспорта' : 'No files to export',
    noFilesDesc: lang === 'ru' ? 'Сначала создайте проект через AI чат' : 'Generate a project with AI chat first',
    logs: lang === 'ru' ? 'Журнал' : 'Logs',
    noLogs: lang === 'ru' ? 'Нет активности...' : 'No activity yet...',
  };

  const ACTIONS = [
    {
      id: 'zip-source',
      group: lang === 'ru' ? '📦 Скачать' : '📦 Download',
      icon: FileArchive,
      label: lang === 'ru' ? 'Скачать исходники (ZIP)' : 'Download Source (ZIP)',
      desc: lang === 'ru'
        ? 'Все исходные файлы проекта в ZIP архиве'
        : 'All project source files as a ZIP archive',
      badge: null,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20',
      action: () => runAction('zip-source', async () => {
        addLog('📦 Creating ZIP archive...');
        await exportAsZip(files, projectName);
        addLog(`✅ Downloaded ${projectName}.zip (${fileCount} files)`);
      }),
    },
    {
      id: 'build-dist',
      group: lang === 'ru' ? '📦 Скачать' : '📦 Download',
      icon: Package,
      label: lang === 'ru' ? 'Собрать и скачать (dist)' : 'Build & Download (dist)',
      desc: lang === 'ru'
        ? 'Запустить npm run build и скачать готовый dist/'
        : 'Run npm run build and download the production dist/',
      badge: isBooted ? null : (lang === 'ru' ? 'Нужен WebContainer' : 'Needs WebContainer'),
      color: 'text-cyan',
      bg: 'bg-cyan/10',
      border: 'border-cyan/20',
      disabled: !isBooted,
      action: () => runAction('build-dist', async () => {
        await buildAndDownload(projectName, addLog);
      }),
    },
    {
      id: 'stackblitz',
      group: lang === 'ru' ? '🌐 Открыть онлайн' : '🌐 Open Online',
      icon: Globe,
      label: 'Open in StackBlitz',
      desc: lang === 'ru'
        ? 'Открыть проект в бесплатном онлайн IDE StackBlitz'
        : 'Open your project in the free StackBlitz online IDE',
      badge: lang === 'ru' ? 'Бесплатно' : 'Free',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      action: () => runAction('stackblitz', async () => {
        addLog('🚀 Opening in StackBlitz...');
        await exportToStackBlitz(files, addLog);
      }),
    },
    {
      id: 'netlify',
      group: lang === 'ru' ? '🌐 Открыть онлайн' : '🌐 Open Online',
      icon: CloudUpload,
      label: 'Deploy to Netlify Drop',
      desc: lang === 'ru'
        ? 'Собрать проект и задеплоить через Netlify Drop (перетащи ZIP)'
        : 'Build the project then drag & drop the ZIP to Netlify Drop',
      badge: lang === 'ru' ? 'Бесплатно' : 'Free',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      disabled: !isBooted,
      action: async () => {
        await runAction('netlify', async () => {
          await buildAndDownload(projectName, addLog);
          addLog('🌐 Now go to: https://app.netlify.com/drop');
          addLog('📁 Drag and drop the downloaded ZIP file there');
        });
        // Open Netlify Drop
        window.open('https://app.netlify.com/drop', '_blank');
      },
    },
    {
      id: 'copy-code',
      group: lang === 'ru' ? '📋 Другое' : '📋 Other',
      icon: Copy,
      label: lang === 'ru' ? 'Скопировать весь код' : 'Copy All Code',
      desc: lang === 'ru'
        ? 'Скопировать все файлы проекта в буфер обмена'
        : 'Copy all project files to clipboard as text',
      badge: null,
      color: 'text-text-1',
      bg: 'bg-surface-3/50',
      border: 'border-border',
      action: () => copyWithFeedback('copy-code', async () => {
        await copyProjectAsText(files, addLog);
      }),
    },
  ];

  // Group actions
  const groups = ACTIONS.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {} as Record<string, typeof ACTIONS>);

  const FREE_HOSTS = [
    { name: 'Vercel', url: 'https://vercel.com', desc: lang === 'ru' ? 'Лучший для React/Next.js' : 'Best for React/Next.js', color: 'text-text-0' },
    { name: 'Netlify', url: 'https://netlify.com', desc: lang === 'ru' ? 'Drag & drop деплой' : 'Drag & drop deploy', color: 'text-teal-400' },
    { name: 'GitHub Pages', url: 'https://pages.github.com', desc: lang === 'ru' ? 'Бесплатный хостинг GitHub' : 'Free GitHub hosting', color: 'text-text-0' },
    { name: 'Cloudflare Pages', url: 'https://pages.cloudflare.com', desc: lang === 'ru' ? 'Быстрый CDN по всему миру' : 'Fast global CDN', color: 'text-orange' },
    { name: 'Railway', url: 'https://railway.app', desc: lang === 'ru' ? 'Для backend/fullstack' : 'For backend/fullstack', color: 'text-purple-400' },
    { name: 'Render', url: 'https://render.com', desc: lang === 'ru' ? 'Бесплатный tier для всего' : 'Free tier for everything', color: 'text-green' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-surface-1 border border-border
                    rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col
                    animate-fade-up shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Rocket size={17} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-0">{t.title}</h2>
              <p className="text-[11px] text-text-3 font-mono">{fileCount} files · {projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
          >
            <X size={15} className="text-text-2" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto touch-scroll">

          {!hasFiles ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
                <Package size={28} className="text-text-3" />
              </div>
              <p className="text-text-1 font-medium mb-1">{t.noFiles}</p>
              <p className="text-sm text-text-3 max-w-xs">{t.noFilesDesc}</p>
            </div>
          ) : (
            <div className="p-4 space-y-5">

              {/* Action groups */}
              {Object.entries(groups).map(([groupName, actions]) => (
                <div key={groupName}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono text-text-3 uppercase tracking-wider">{groupName}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-2">
                    {actions.map(action => {
                      const Icon = action.icon;
                      const isLoading = activeAction === action.id;
                      const isCopied = copiedText === action.id;
                      const isDisabled = action.disabled || (status === 'loading' && activeAction !== action.id);

                      return (
                        <button
                          key={action.id}
                          onClick={action.action}
                          disabled={isDisabled}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all
                            ${action.border} ${action.bg}
                            hover:opacity-90 active:scale-[0.99]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${isLoading ? 'ring-1 ring-accent/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-surface-1 flex items-center justify-center shrink-0 ${action.color}`}>
                              {isLoading
                                ? <Loader size={16} className="animate-spin" />
                                : isCopied
                                ? <Check size={16} className="text-green" />
                                : <Icon size={16} />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${action.color}`}>{action.label}</span>
                                {action.badge && (
                                  <span className="px-1.5 py-px rounded bg-green/10 text-green text-[9px] font-bold uppercase">
                                    {action.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-3 mt-0.5 leading-relaxed">{action.desc}</p>
                            </div>
                            {!isLoading && !isCopied && (
                              <ExternalLink size={13} className="text-text-3 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Local development guide */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono text-text-3 uppercase tracking-wider">
                    {lang === 'ru' ? '💻 Локальный запуск' : '💻 Local Development'}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="p-4 rounded-xl bg-surface-0 border border-border font-mono text-[12px] space-y-1.5">
                  <div className="text-text-3 text-[10px] uppercase tracking-wider mb-2">
                    {lang === 'ru' ? '# После скачивания ZIP:' : '# After downloading ZIP:'}
                  </div>
                  {[
                    { cmd: 'unzip project.zip && cd project', color: 'text-text-2' },
                    { cmd: 'npm install', color: 'text-accent' },
                    { cmd: 'npm run dev', color: 'text-green' },
                  ].map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-text-3">$</span>
                      <span className={line.color}>{line.cmd}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border mt-2 text-text-3 text-[10px]">
                    {lang === 'ru'
                      ? '→ Откроется на http://localhost:5173'
                      : '→ Opens at http://localhost:5173'}
                  </div>
                </div>
              </div>

              {/* Free hosting platforms */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono text-text-3 uppercase tracking-wider">
                    {lang === 'ru' ? '🚀 Бесплатный хостинг' : '🚀 Free Hosting'}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FREE_HOSTS.map(host => (
                    <a
                      key={host.name}
                      href={host.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-border
                               bg-surface-0 hover:border-border-hover hover:bg-surface-2
                               transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-surface-2 border border-border
                                    flex items-center justify-center shrink-0 font-mono text-[10px]
                                    font-bold text-text-2 group-hover:border-border-hover">
                        {host.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${host.color}`}>{host.name}</div>
                        <div className="text-[10px] text-text-3 mt-0.5 leading-snug">{host.desc}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Logs */}
              {logs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={11} className="text-text-3" />
                    <span className="text-[11px] font-mono text-text-3 uppercase tracking-wider">{t.logs}</span>
                    {status === 'success' && <Check size={11} className="text-green ml-auto" />}
                    {status === 'error' && <AlertCircle size={11} className="text-red ml-auto" />}
                    {status === 'loading' && <Loader size={11} className="text-accent ml-auto animate-spin" />}
                  </div>
                  <div className="p-3 rounded-xl bg-surface-0 border border-border font-mono text-[11px] space-y-0.5 max-h-40 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.startsWith('✅') ? 'text-green' :
                          log.startsWith('❌') ? 'text-red' :
                          log.startsWith('⚠️') ? 'text-orange' :
                          log.startsWith('🚀') || log.startsWith('📦') || log.startsWith('🔨') ? 'text-cyan' :
                          'text-text-2'
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
