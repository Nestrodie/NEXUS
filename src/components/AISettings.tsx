import { useState } from 'react';
import { X, Eye, EyeOff, ExternalLink, Check, Shield, Zap } from 'lucide-react';
import { AI_PROVIDERS } from '../services/ai';
import { useProjectStore } from '../store/projectStore';
import { useLang } from '../context/LanguageContext';
import {
  getModelIcon,
  GroqIcon, GoogleIcon, OpenRouterIcon, CerebrasIcon, TogetherIcon, SambaNovaIcon,
} from './ProviderIcons';

interface AISettingsProps {
  onClose: () => void;
}

export default function AISettings({ onClose }: AISettingsProps) {
  const { lang } = useLang();
  const { providerId, modelId, apiKey, setProvider, setModel, setApiKey } = useProjectStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentProvider = AI_PROVIDERS.find((p) => p.id === providerId) || AI_PROVIDERS[0];

  const t = {
    title: lang === 'ru' ? 'Настройки ИИ' : 'AI Settings',
    provider: lang === 'ru' ? 'Провайдер' : 'Provider',
    model: lang === 'ru' ? 'Модель' : 'Model',
    apiKey: lang === 'ru' ? 'API ключ' : 'API Key',
    save: lang === 'ru' ? 'Сохранить' : 'Save',
    cancel: lang === 'ru' ? 'Отмена' : 'Cancel',
    saved: lang === 'ru' ? 'Сохранено!' : 'Saved!',
    getKey: lang === 'ru' ? 'Получить ключ' : 'Get free key',
    enterKey: lang === 'ru' ? 'Вставьте API ключ...' : 'Paste API key...',
    free: lang === 'ru' ? 'Бесплатно' : 'Free',
    fast: lang === 'ru' ? 'Быстрый' : 'Fast',
    securityNote: lang === 'ru'
      ? 'Ключ хранится только в вашем браузере'
      : 'Key is stored only in your browser',
    howTo: lang === 'ru' ? 'Как получить ключ:' : 'How to get a key:',
    recommended: lang === 'ru' ? 'Рекомендуем' : 'Recommended',
    steps: {
      groq: [
        lang === 'ru' ? 'Откройте console.groq.com' : 'Go to console.groq.com',
        lang === 'ru' ? 'Зарегистрируйтесь бесплатно' : 'Sign up for free',
        lang === 'ru' ? 'API Keys → Create API Key' : 'API Keys → Create API Key',
        lang === 'ru' ? 'Скопируйте и вставьте сюда' : 'Copy and paste here',
      ],
      google: [
        lang === 'ru' ? 'Откройте aistudio.google.com' : 'Go to aistudio.google.com',
        lang === 'ru' ? 'Войдите через Google' : 'Sign in with Google',
        lang === 'ru' ? 'Get API Key → Create' : 'Get API Key → Create',
        lang === 'ru' ? 'Скопируйте и вставьте сюда' : 'Copy and paste here',
      ],
      openrouter: [
        lang === 'ru' ? 'Откройте openrouter.ai' : 'Go to openrouter.ai',
        lang === 'ru' ? 'Зарегистрируйтесь' : 'Sign up',
        lang === 'ru' ? 'Keys → Create Key' : 'Keys → Create Key',
        lang === 'ru' ? 'Выбирайте модели с пометкой :free' : 'Use models with :free tag',
      ],
      cerebras: [
        lang === 'ru' ? 'Откройте cerebras.ai' : 'Go to cerebras.ai',
        lang === 'ru' ? 'Зарегистрируйтесь' : 'Sign up for free',
        lang === 'ru' ? 'Dashboard → API Keys' : 'Dashboard → API Keys',
        lang === 'ru' ? 'Скопируйте и вставьте сюда' : 'Copy and paste here',
      ],
      together: [
        lang === 'ru' ? 'Откройте together.ai' : 'Go to together.ai',
        lang === 'ru' ? 'Зарегистрируйтесь (бесплатно $5)' : 'Sign up (free $5 credit)',
        lang === 'ru' ? 'Settings → API Keys' : 'Settings → API Keys',
        lang === 'ru' ? 'Скопируйте и вставьте сюда' : 'Copy and paste here',
      ],
      sambanova: [
        lang === 'ru' ? 'Откройте sambanova.ai' : 'Go to sambanova.ai',
        lang === 'ru' ? 'Зарегистрируйтесь бесплатно' : 'Sign up for free',
        lang === 'ru' ? 'API → Create Key' : 'API → Create Key',
        lang === 'ru' ? 'Скопируйте и вставьте сюда' : 'Copy and paste here',
      ],
    },
  };

  const handleSave = () => {
    setApiKey(localKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const getUrl = (id: string) => {
    switch (id) {
      case 'groq': return 'https://console.groq.com';
      case 'google': return 'https://aistudio.google.com/apikey';
      case 'openrouter': return 'https://openrouter.ai/keys';
      case 'cerebras': return 'https://cloud.cerebras.ai';
      case 'together': return 'https://api.together.ai';
      case 'sambanova': return 'https://cloud.sambanova.ai';
      default: return '#';
    }
  };

  const PROVIDER_ICONS: Record<string, React.ReactNode> = {
    groq: <GroqIcon size={28} />,
    google: <GoogleIcon size={28} />,
    openrouter: <OpenRouterIcon size={28} />,
    cerebras: <CerebrasIcon size={28} />,
    together: <TogetherIcon size={28} />,
    sambanova: <SambaNovaIcon size={28} />,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-1 border border-border
                    rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col
                    animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text-0">{t.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                     bg-surface-2 active:bg-surface-3 transition-colors"
          >
            <X size={16} className="text-text-2" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto touch-scroll p-5 space-y-6">

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-2 mb-3">
              {t.provider}
            </label>
            <div className="space-y-2">
              {AI_PROVIDERS.map((p, index) => {
                const isSelected = providerId === p.id;
                const isRecommended = index === 0;
                const isFast = p.id === 'groq' || p.id === 'cerebras';
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProvider(p.id);
                      setModel(p.models[0].id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:bg-surface-2 active:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Provider SVG Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                      overflow-hidden ${isSelected ? 'ring-2 ring-accent/30' : ''}`}>
                        {PROVIDER_ICONS[p.id]}
                      </div>

                      {/* Name + badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-medium ${isSelected ? 'text-text-0' : 'text-text-1'}`}>
                            {p.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-green/10 text-green text-[9px] font-bold uppercase">
                            {t.free}
                          </span>
                          {isFast && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan/10 text-cyan text-[9px] font-bold uppercase flex items-center gap-0.5">
                              <Zap size={8} />
                              {t.fast}
                            </span>
                          )}
                          {isRecommended && (
                            <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-bold uppercase">
                              {t.recommended}
                            </span>
                          )}
                        </div>
                        {p.freeNote && (
                          <div className="text-[11px] text-text-3 mt-0.5 truncate">
                            {p.freeNote}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <Check size={12} className="text-surface-0" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-2 mb-2">
              {t.model}
            </label>
            <div className="space-y-1.5">
              {currentProvider.models.map((m) => {
                const isSelected = modelId === m.id;
                const modelIcon = getModelIcon(m.id, 16);
                return (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-accent/50 bg-accent/5'
                        : 'border-border hover:bg-surface-2'
                    }`}
                  >
                    {/* Model icon */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-surface-2">
                      {modelIcon || (
                        <span className="font-mono text-[9px] font-bold text-text-2">
                          {m.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono truncate ${isSelected ? 'text-text-0' : 'text-text-1'}`}>
                          {m.name}
                        </span>
                        {m.fast && (
                          <span className="flex items-center gap-0.5 px-1.5 py-px rounded bg-cyan/10 text-cyan text-[9px] font-bold shrink-0">
                            <Zap size={8} />
                            Fast
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-accent shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-text-2">
                {t.apiKey}
              </label>
              <a
                href={getUrl(providerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-accent active:opacity-70"
              >
                {t.getKey}
                <ExternalLink size={10} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder={t.enterKey}
                className="w-full p-3 pr-12 rounded-xl border border-border bg-surface-0
                         text-text-0 text-sm font-mono
                         focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-3
                         active:text-text-1 transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield size={11} className="text-text-3" />
              <span className="text-[11px] text-text-3">{t.securityNote}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-surface-0 border border-border">
            <p className="text-xs font-semibold text-text-1 mb-3">{t.howTo}</p>
            <ol className="space-y-2">
              {(t.steps[providerId as keyof typeof t.steps] || t.steps.groq).map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center
                               text-[10px] font-bold text-text-2 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-text-2 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border shrink-0 safe-b">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-xl border border-border text-text-1
                     text-sm font-medium active:bg-surface-2 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green text-surface-0'
                : 'bg-accent text-surface-0 active:scale-[0.98]'
            }`}
          >
            {saved ? (
              <>
                <Check size={16} />
                {t.saved}
              </>
            ) : (
              t.save
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
