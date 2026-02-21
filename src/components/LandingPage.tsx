import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronDown, Zap, Check, Layers, Clock } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { AI_PROVIDERS } from '../services/ai';
import { useProjectStore } from '../store/projectStore';
import { getAllProjects, timeAgo, type SavedProject } from '../services/projectStorage';
import {
  GroqIcon, GoogleIcon, OpenRouterIcon, CerebrasIcon, TogetherIcon, SambaNovaIcon,
  getModelIcon,
} from './ProviderIcons';

function ProviderIcon({ id, size = 16 }: { id: string; size?: number }) {
  switch (id) {
    case 'groq': return <GroqIcon size={size} />;
    case 'google': return <GoogleIcon size={size} />;
    case 'openrouter': return <OpenRouterIcon size={size} />;
    case 'cerebras': return <CerebrasIcon size={size} />;
    case 'together': return <TogetherIcon size={size} />;
    case 'sambanova': return <SambaNovaIcon size={size} />;
    default: return <span className="font-mono text-[9px] font-bold text-text-1">{id.slice(0,2).toUpperCase()}</span>;
  }
}

interface LandingPageProps {
  onStartProject: (prompt: string) => void;
  onOpenProjects: () => void;
}

export default function LandingPage({ onStartProject, onOpenProjects }: LandingPageProps) {
  const [prompt, setPrompt] = useState('');
  const [showProviders, setShowProviders] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>([]);
  const { t, lang } = useLang();

  const { providerId, modelId, setProvider, setModel } = useProjectStore();

  useEffect(() => {
    setRecentProjects(getAllProjects().slice(0, 4));
  }, []);

  const currentProvider = AI_PROVIDERS.find(p => p.id === providerId) || AI_PROVIDERS[0];
  const currentModel = currentProvider.models.find(m => m.id === modelId) || currentProvider.models[0];

  const handleSubmit = () => {
    if (prompt.trim()) onStartProject(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleProviderSelect = (id: string) => {
    setProvider(id);
    const p = AI_PROVIDERS.find(p => p.id === id);
    if (p) setModel(p.models[0].id);
    setShowProviders(false);
  };

  return (
    <div
      className="h-full overflow-auto touch-scroll safe-b"
      onClick={() => { setShowProviders(false); setShowModels(false); }}
    >
      {/* Desktop: side panel + center */}
      <div className="h-full flex">

        {/* ── LEFT SIDEBAR (desktop only) ── */}
        <div className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-border bg-surface-1 p-4 gap-3">

          {/* Projects nav item */}
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-0 border border-border
                     hover:border-border-hover hover:bg-surface-2 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0
                          group-hover:bg-surface-3 transition-colors">
              <Layers size={16} className="text-text-2" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-0">{t.project}s</div>
              <div className="text-[11px] text-text-3 font-mono">Saved projects</div>
            </div>
          </button>

          {/* Recent label */}
          {recentProjects.length > 0 && (
            <div className="px-2 pt-2">
              <span className="font-mono text-[10px] text-text-3 uppercase tracking-wider">
                {lang === 'ru' ? 'Недавние' : 'Recent'}
              </span>
            </div>
          )}

          {/* Real recent projects from localStorage */}
          {recentProjects.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[11px] text-text-3">
                {lang === 'ru' ? 'Нет проектов' : 'No projects yet'}
              </p>
            </div>
          ) : (
            recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={onOpenProjects}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-2 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 font-mono text-[9px] font-bold text-text-3">
                  {(project.providerId || 'AI').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-1 truncate">{project.name}</div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-text-3 mt-0.5">
                    <Clock size={9} />
                    {timeAgo(project.updatedAt || project.createdAt, lang)}
                  </div>
                </div>
              </button>
            ))
          )}

          <div className="flex-1" />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 overflow-auto touch-scroll" onClick={e => e.stopPropagation()}>
          <div className="max-w-2xl mx-auto px-5 pt-10 pb-16 md:pt-16 md:pb-24">

            {/* Hero */}
            <div className="mb-10 md:mb-12 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-glow" />
                <span className="font-mono text-[11px] text-text-2 uppercase tracking-wider">{t.tagline}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
                {t.heroTitle1}
                <br />
                <span className="text-accent">{t.heroTitle2}</span>
              </h1>

              <p className="text-base md:text-lg text-text-1 leading-relaxed max-w-md">
                {t.heroDesc}
              </p>
            </div>

            {/* Main prompt card */}
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div
                className="bg-surface-1 border-2 border-border rounded-2xl focus-within:border-accent/40 transition-colors overflow-visible relative"
                onClick={e => e.stopPropagation()}
              >

                {/* Textarea */}
                <div className="flex items-start gap-3 p-5 pb-3">
                  <Sparkles size={20} className="text-accent mt-0.5 flex-shrink-0" />
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    className="w-full bg-transparent text-text-0 font-sans text-[15px]
                             resize-none placeholder:text-text-3 leading-relaxed min-h-[100px]"
                    rows={4}
                    autoFocus
                  />
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-surface-2/40">

                  {/* Left: Provider + Model selectors */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Provider selector */}
                    <div className="relative">
                      <button
                        onClick={() => { setShowProviders(p => !p); setShowModels(false); }}
                        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[11px] font-mono
                                   transition-all
                                   ${showProviders
                                     ? 'border-accent/50 bg-accent/5 text-accent'
                                     : 'border-border bg-surface-1 text-text-2 hover:text-text-1 hover:border-border-hover'}`}
                      >
                        <span className="w-4 h-4 rounded overflow-hidden flex items-center justify-center shrink-0">
                          <ProviderIcon id={currentProvider.id} size={16} />
                        </span>
                        {currentProvider.name}
                        <ChevronDown size={11} className={`transition-transform ${showProviders ? 'rotate-180' : ''}`} />
                      </button>

                      {showProviders && (
                        <div className="absolute bottom-full mb-2 left-0 z-50 w-56 bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-up">
                          {AI_PROVIDERS.map((p, i) => (
                            <button
                              key={p.id}
                              onClick={() => handleProviderSelect(p.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                                         ${p.id === providerId ? 'bg-accent/5 text-accent' : 'hover:bg-surface-2 text-text-1'}`}
                            >
                              <span className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
                                <ProviderIcon id={p.id} size={20} />
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] font-medium">{p.name}</span>
                                  {i === 0 && (
                                    <span className="px-1 py-px rounded bg-accent/15 text-accent text-[9px] font-bold">REC</span>
                                  )}
                                </div>
                                {p.freeNote && (
                                  <div className="text-[10px] text-text-3 truncate">{p.freeNote}</div>
                                )}
                              </div>
                              {p.id === providerId && <Check size={13} className="text-accent shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Model selector */}
                    <div className="relative">
                      <button
                        onClick={() => { setShowModels(p => !p); setShowProviders(false); }}
                        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[11px] font-mono
                                   transition-all
                                   ${showModels
                                     ? 'border-accent/50 bg-accent/5 text-accent'
                                     : 'border-border bg-surface-1 text-text-2 hover:text-text-1 hover:border-border-hover'}`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          {getModelIcon(currentModel.id, 14) || (currentModel.fast && <Zap size={10} className="text-cyan" />)}
                        </span>
                        <span className="max-w-[120px] truncate">{currentModel.name}</span>
                        <ChevronDown size={11} className={`transition-transform ${showModels ? 'rotate-180' : ''}`} />
                      </button>

                      {showModels && (
                        <div className="absolute bottom-full mb-2 left-0 z-50 w-52 bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-up">
                          {currentProvider.models.map(m => {
                            const icon = getModelIcon(m.id, 14);
                            return (
                              <button
                                key={m.id}
                                onClick={() => { setModel(m.id); setShowModels(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors
                                           ${m.id === modelId ? 'bg-accent/5 text-accent' : 'hover:bg-surface-2 text-text-1'}`}
                              >
                                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                                  {icon || (m.fast && <Zap size={11} className="text-cyan" />)}
                                </span>
                                <span className="text-[12px] font-mono flex-1 truncate">{m.name}</span>
                                {m.fast && !icon && <Zap size={10} className="text-cyan shrink-0" />}
                                {m.id === modelId && <Check size={13} className="text-accent shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: char count + submit */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[10px] text-text-3 hidden sm:block">
                      {prompt.length}/2000
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={!prompt.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-surface-0
                               font-semibold text-sm rounded-xl
                               active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                               hover:opacity-90"
                    >
                      {t.generate}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p className="text-center font-mono text-[11px] text-text-3 mt-4">
                Enter ↵ {' · '} {currentProvider.name} {' · '} {currentModel.name}
              </p>

              {/* Mobile: projects button */}
              <div className="md:hidden mt-6">
                <button
                  onClick={onOpenProjects}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                           bg-surface-1 border border-border text-text-1 text-sm font-medium
                           hover:border-border-hover active:bg-surface-2 transition-all"
                >
                  <Layers size={16} />
                  {t.project}s
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
