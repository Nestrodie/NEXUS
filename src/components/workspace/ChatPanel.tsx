import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, AlertCircle, Wand2, RotateCcw,
  Zap, Copy, Check, ChevronRight, X, Layers,
  Code2, Plus, MessageSquare, BookOpen, FileText,
  ChevronDown, Lightbulb,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import {
  handleUserPrompt,
  fixErrorWithAI,
  regenerateProject,
  runAgentTask,
  generateDocumentation,
  explainProject,
} from '../../services/projectController';
import { PROJECT_TEMPLATES } from '../../services/ai';
import { useLang } from '../../context/LanguageContext';

const QUICK_ACTIONS = {
  en: [
    { label: 'Add dark mode', prompt: 'Add a dark mode toggle with smooth transition' },
    { label: 'Make responsive', prompt: 'Make the layout fully mobile responsive' },
    { label: 'Add animations', prompt: 'Add smooth loading and hover animations' },
    { label: 'Improve UI', prompt: 'Improve the overall UI design and color scheme' },
    { label: 'Add form', prompt: 'Add a contact form with validation' },
    { label: 'Add navbar', prompt: 'Add a responsive navigation bar with mobile menu' },
    { label: 'Add search', prompt: 'Add a search functionality' },
    { label: 'Fix performance', prompt: 'Optimize the code for better performance' },
  ],
  ru: [
    { label: 'Тёмная тема', prompt: 'Добавь переключатель тёмной темы с плавным переходом' },
    { label: 'Адаптивность', prompt: 'Сделай дизайн полностью адаптивным для мобильных' },
    { label: 'Анимации', prompt: 'Добавь плавные анимации загрузки и при наведении' },
    { label: 'Улучши UI', prompt: 'Улучши общий дизайн интерфейса и цветовую схему' },
    { label: 'Форма', prompt: 'Добавь контактную форму с валидацией' },
    { label: 'Навбар', prompt: 'Добавь адаптивную навигационную панель с мобильным меню' },
    { label: 'Поиск', prompt: 'Добавь функционал поиска' },
    { label: 'Оптимизация', prompt: 'Оптимизируй код для лучшей производительности' },
  ],
};

export default function ChatPanel() {
  const { lang } = useLang();
  const {
    chatMessages,
    isGenerating,
    apiKey,
    lastError,
    files,
    autoFixAttempts,
    clearChat,
  } = useProjectStore();

  const [input, setInput] = useState('');
  const [agentMode, setAgentMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasFiles = Object.keys(files).length > 0;
  const hasMessages = chatMessages.length > 0;
  const quickActions = lang === 'ru' ? QUICK_ACTIONS.ru : QUICK_ACTIONS.en;

  const t = {
    placeholder: lang === 'ru' ? 'Опишите что нужно сделать...' : 'Describe what you need...',
    noKey: lang === 'ru' ? 'Настройте API ключ в Настройках' : 'Configure API key in Settings',
    filesGenerated: lang === 'ru' ? 'файлов создано' : 'files generated',
    welcome: lang === 'ru' ? 'Готов создать что угодно' : 'Ready to build anything',
    welcomeSub: lang === 'ru'
      ? 'Опишите проект или выберите шаблон'
      : 'Describe your project or pick a template',
    fixError: lang === 'ru' ? 'Исправить' : 'Fix error',
    regenerate: lang === 'ru' ? 'Перегенерировать' : 'Regenerate',
    agent: 'Agent',
    send: lang === 'ru' ? 'Отправить' : 'Send',
    templates: lang === 'ru' ? 'Шаблоны' : 'Templates',
    newChat: lang === 'ru' ? 'Новый чат' : 'New chat',
    tryingFix: lang === 'ru'
      ? `Попытка ${autoFixAttempts}/3...`
      : `Attempt ${autoFixAttempts}/3...`,
    quickAdd: lang === 'ru' ? 'Быстрые действия' : 'Quick actions',
    docs: lang === 'ru' ? 'Документация' : 'Docs',
    explain: lang === 'ru' ? 'Объяснить' : 'Explain',
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, []);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating || !apiKey) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setShowTemplates(false);
    setShowQuickActions(false);
    if (agentMode) {
      await runAgentTask(trimmed);
    } else {
      await handleUserPrompt(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
    setShowTemplates(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      resizeTextarea();
    }, 50);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setShowQuickActions(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── Render message content ──
  const renderContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const firstLine = lines[0]?.trim() || '';
        const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 20;
        const language = hasLang ? firstLine : '';
        const code = hasLang ? lines.slice(1).join('\n').trim() : lines.join('\n').trim();
        const blockId = `${msgId}-${i}`;

        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-border/60 bg-surface-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 bg-surface-1">
              <div className="flex items-center gap-2">
                <Code2 size={11} className="text-text-3" />
                <span className="text-[10px] font-mono text-text-3 uppercase tracking-wide">
                  {language || 'code'}
                </span>
              </div>
              <button
                onClick={() => copyCode(code, blockId)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-2
                         text-text-3 hover:text-text-1 transition-all text-[10px] font-mono"
              >
                {copiedId === blockId
                  ? <><Check size={10} className="text-green" /><span className="text-green">Copied!</span></>
                  : <><Copy size={10} /><span>Copy</span></>
                }
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[12px] font-mono text-text-1 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline formatting
      return (
        <span key={i} className="whitespace-pre-wrap break-words">
          {part.split(/(\*\*[\s\S]*?\*\*|`[^`\n]+`|\*[\s\S]*?\*)/g).map((seg, j) => {
            if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4)
              return <strong key={j} className="font-semibold text-text-0">{seg.slice(2, -2)}</strong>;
            if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2)
              return (
                <code key={j} className="px-1.5 py-0.5 rounded-md bg-surface-3 text-accent font-mono text-[0.85em]">
                  {seg.slice(1, -1)}
                </code>
              );
            if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2)
              return <em key={j} className="italic text-text-1">{seg.slice(1, -1)}</em>;
            return seg;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-0">

      {/* ── Header ── */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border shrink-0 bg-surface-1">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-accent" />
          <span className="font-mono text-[11px] text-text-2 uppercase tracking-wide">
            {lang === 'ru' ? 'ИИ Ассистент' : 'AI Assistant'}
          </span>
          {agentMode && (
            <span className="px-1.5 py-px rounded bg-cyan/15 text-cyan text-[9px] font-bold uppercase font-mono border border-cyan/20">
              AGENT
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {hasFiles && (
            <>
              <button
                onClick={() => explainProject()}
                disabled={isGenerating}
                title={t.explain}
                className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors disabled:opacity-40"
              >
                <Lightbulb size={13} />
              </button>
              <button
                onClick={() => generateDocumentation()}
                disabled={isGenerating}
                title={t.docs}
                className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors disabled:opacity-40"
              >
                <BookOpen size={13} />
              </button>
            </>
          )}
          {hasMessages && (
            <button
              onClick={() => clearChat()}
              title={t.newChat}
              className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
            >
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">

        {/* Welcome state */}
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center min-h-full py-8 px-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20
                          flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-accent" />
            </div>
            <h3 className="text-base font-semibold text-text-0 mb-1">{t.welcome}</h3>
            <p className="text-xs text-text-2 mb-6 leading-relaxed max-w-[220px]">{t.welcomeSub}</p>

            {/* Templates toggle */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border
                       text-xs text-text-1 hover:border-accent/30 transition-all mb-3 w-full max-w-[240px] justify-center"
            >
              <Layers size={13} />
              {t.templates}
              <ChevronDown size={12} className={`transition-transform ml-auto ${showTemplates ? 'rotate-180' : ''}`} />
            </button>

            {/* Template grid */}
            {showTemplates && (
              <div className="grid grid-cols-2 gap-2 w-full mb-4 animate-fade-up">
                {PROJECT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template.prompt)}
                    className="flex flex-col items-start gap-1 p-3 rounded-xl bg-surface-1 border border-border
                             hover:border-accent/40 hover:bg-surface-2 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center
                                    font-mono text-[9px] font-bold text-text-2 shrink-0 border border-border">
                        {template.icon}
                      </div>
                      <span className="text-xs font-medium text-text-0 truncate">{template.name}</span>
                    </div>
                    <p className="text-[10px] text-text-3 leading-relaxed line-clamp-2 pl-8">{template.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Quick prompts */}
            {!showTemplates && (
              <div className="flex flex-wrap justify-center gap-1.5 max-w-[280px]">
                {quickActions.slice(0, 4).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-2/50 border border-border
                             text-[11px] text-text-3 hover:text-text-1 hover:border-accent/30 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages list */}
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/20
                            flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={11} className="text-accent" />
              </div>
            )}

            <div className={`
              max-w-[88%] rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-accent text-surface-0 px-4 py-2.5 rounded-br-sm font-medium'
                : 'bg-surface-2 border border-border text-text-1 px-4 py-3 rounded-bl-sm'
              }
            `}>
              {msg.role === 'assistant' ? (
                <div>
                  {msg.content
                    ? renderContent(msg.content, msg.id)
                    : (
                      <div className="flex items-center gap-2 text-text-3">
                        <span className="w-3.5 h-3.5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                        <span className="text-xs font-mono">
                          {lang === 'ru' ? 'Думаю...' : 'Thinking...'}
                        </span>
                      </div>
                    )
                  }
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-2 h-4 bg-accent/60 animate-blink ml-0.5 rounded-sm" />
                  )}
                  {msg.files && !msg.isStreaming && (
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
                      <Check size={12} className="text-green shrink-0" />
                      <span className="text-green text-xs font-medium font-mono">
                        {Object.keys(msg.files).length} {t.filesGenerated}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-surface-2 border border-border
                            flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare size={11} className="text-text-2" />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Error Banner ── */}
      {lastError && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-red/8 border border-red/20 flex items-start gap-2.5 shrink-0">
          <AlertCircle size={15} className="text-red shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-red font-medium mb-0.5">
              {autoFixAttempts > 0 ? t.tryingFix : (lang === 'ru' ? 'Обнаружена ошибка' : 'Error detected')}
            </p>
            <p className="text-[11px] text-text-2 line-clamp-2 font-mono">{lastError.slice(0, 120)}</p>
          </div>
          <button
            onClick={() => fixErrorWithAI(false)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red text-white text-[11px]
                     font-medium rounded-lg hover:bg-red/80 transition-colors
                     disabled:opacity-50 shrink-0"
          >
            <Wand2 size={11} />
            {t.fixError}
          </button>
        </div>
      )}

      {/* ── Quick Actions (when project exists) ── */}
      {hasFiles && hasMessages && !isGenerating && (
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 text-[10px] text-text-3 hover:text-text-1 transition-colors font-mono mb-1.5"
          >
            <ChevronRight size={10} className={`transition-transform ${showQuickActions ? 'rotate-90' : ''}`} />
            {t.quickAdd}
          </button>
          {showQuickActions && (
            <div className="flex items-center gap-1.5 flex-wrap animate-fade-up">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="px-2 py-1 rounded-lg bg-surface-2 border border-border
                           text-[10px] text-text-3 hover:text-text-1 hover:border-accent/30
                           transition-all"
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={regenerateProject}
                disabled={isGenerating}
                className="flex items-center gap-1 px-2 py-1 rounded-lg
                         text-[10px] text-text-3 hover:text-orange hover:bg-orange/5 transition-colors
                         border border-transparent hover:border-orange/20
                         disabled:opacity-40"
              >
                <RotateCcw size={10} />
                {t.regenerate}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="p-3 border-t border-border shrink-0">

        {/* No API key warning */}
        {!apiKey && (
          <div className="mb-2 px-3 py-2.5 rounded-xl bg-orange/8 border border-orange/20
                        text-[11px] text-orange flex items-center gap-2">
            <AlertCircle size={13} />
            <span>{t.noKey}</span>
          </div>
        )}

        {/* Input card */}
        <div className={`
          rounded-xl border overflow-hidden transition-all duration-200
          ${agentMode
            ? 'border-cyan/40 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_20px_-6px_rgba(34,211,238,0.15)]'
            : 'border-border focus-within:border-accent/40 focus-within:shadow-[0_0_0_1px_rgba(228,255,26,0.04)]'
          }
          bg-surface-1
        `}>

          {/* Top bar: Agent toggle + Templates */}
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
            {/* Agent Mode toggle */}
            <button
              onClick={() => setAgentMode(!agentMode)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono
                font-medium transition-all border
                ${agentMode
                  ? 'bg-cyan/10 text-cyan border-cyan/30 shadow-[0_0_10px_-4px_rgba(34,211,238,0.5)]'
                  : 'bg-transparent text-text-3 border-transparent hover:text-text-1 hover:bg-surface-2'
                }
              `}
            >
              <Zap size={10} className={agentMode ? 'text-cyan' : ''} />
              {t.agent}
            </button>

            {agentMode && (
              <span className="text-[10px] text-cyan/60 font-mono hidden sm:block">
                {lang === 'ru' ? 'Автономный режим' : 'Autonomous mode'}
              </span>
            )}

            {/* Templates button */}
            <button
              onClick={() => { setShowTemplates(!showTemplates); setShowQuickActions(false); }}
              className={`ml-auto p-1.5 rounded-lg transition-colors
                ${showTemplates ? 'text-accent bg-accent/10' : 'text-text-3 hover:text-text-1 hover:bg-surface-2'}`}
              title={t.templates}
            >
              <Layers size={12} />
            </button>
          </div>

          {/* Templates panel */}
          {showTemplates && (
            <div className="px-3 pb-2 border-b border-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-text-3 uppercase tracking-wide">{t.templates}</span>
                <button onClick={() => setShowTemplates(false)}>
                  <X size={11} className="text-text-3 hover:text-text-1" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {PROJECT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template.prompt)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface-0 border border-border
                             hover:border-accent/30 hover:bg-surface-2 transition-all text-left"
                  >
                    <span className="w-5 h-5 rounded bg-surface-2 border border-border flex items-center justify-center
                                   font-mono text-[9px] font-bold text-text-2 shrink-0">
                      {template.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-text-1 truncate">{template.name}</div>
                      <div className="text-[9px] text-text-3 truncate">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={2}
            disabled={isGenerating || !apiKey}
            className="w-full resize-none px-3 py-2 bg-transparent
                     text-[13px] text-text-0 placeholder:text-text-3
                     focus:outline-none disabled:opacity-40 leading-relaxed"
            style={{ maxHeight: '200px' }}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-3">
                {input.length > 0 ? `${input.length} chars` : 'Enter ↵ to send'}
              </span>
              {hasFiles && !showTemplates && (
                <button
                  onClick={() => { setInput(''); textareaRef.current?.focus(); }}
                  title="Clear input"
                  className="text-text-3 hover:text-text-1 transition-colors"
                >
                  {input.length > 0 && <X size={10} />}
                </button>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating || !apiKey}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold
                transition-all active:scale-95
                disabled:opacity-30 disabled:cursor-not-allowed
                ${agentMode
                  ? 'bg-surface-0 text-cyan border border-cyan/40 hover:bg-cyan/5 shadow-[0_0_12px_-4px_rgba(34,211,238,0.4)]'
                  : 'bg-accent text-surface-0 hover:opacity-90'
                }
              `}
            >
              {isGenerating ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={12} />
              )}
              {!isGenerating && (
                <span>{agentMode ? 'Agent' : t.send}</span>
              )}
            </button>
          </div>
        </div>

        {/* Provider hint */}
        {apiKey && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="font-mono text-[9px] text-text-3">
              {useProjectStore.getState().providerId} · {useProjectStore.getState().modelId.split('/').pop()?.split(':')[0]}
            </span>
            <div className="flex items-center gap-1">
              <FileText size={9} className="text-text-3" />
              <span className="font-mono text-[9px] text-text-3">
                {Object.keys(files).length} {lang === 'ru' ? 'файлов' : 'files'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
