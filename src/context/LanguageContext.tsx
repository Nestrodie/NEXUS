import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ru';

const translations = {
  en: {
    tagline: 'AI-Powered Dev Environment',
    heroTitle1: 'Build anything,',
    heroTitle2: 'ship fast.',
    heroDesc: 'Describe your idea. Watch it come to life. AI writes code, you stay in control.',
    placeholder: 'What do you want to build?',
    generate: 'Generate',
    project: 'Project',
    deploy: 'Deploy',
    chat: 'Chat',
    code: 'Code',
    preview: 'Preview',
    files: 'Files',
    terminal: 'Terminal',
    send: 'Send',
    askAI: 'Ask AI anything...',
    viewCode: 'View Code',
    viewSplit: 'Split',
    viewPreview: 'Preview',
  },
  ru: {
    tagline: 'Среда разработки с ИИ',
    heroTitle1: 'Создавай что угодно,',
    heroTitle2: 'запускай быстро.',
    heroDesc: 'Опиши свою идею. Смотри как она оживает. ИИ пишет код, ты контролируешь.',
    placeholder: 'Что ты хочешь создать?',
    generate: 'Создать',
    project: 'Проект',
    deploy: 'Деплой',
    chat: 'Чат',
    code: 'Код',
    preview: 'Превью',
    files: 'Файлы',
    terminal: 'Терминал',
    send: 'Отправить',
    askAI: 'Спроси ИИ что угодно...',
    viewCode: 'Код',
    viewSplit: 'Сплит',
    viewPreview: 'Превью',
  },
};

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'ru' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
