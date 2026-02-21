import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { Sun, Moon, Languages, Terminal, Home } from 'lucide-react';

type View = 'landing' | 'workspace' | 'projects';

interface NavbarProps {
  view?: View;
  title?: string;
  onLogoClick?: () => void;
}

export default function Navbar({ view = 'landing', title, onLogoClick }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();

  const isInApp = view === 'workspace' || view === 'projects';

  return (
    <nav className="safe-t bg-surface-1 border-b border-border sticky top-0 z-50 shrink-0">
      <div className="flex items-center justify-between h-11 px-3">

        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onLogoClick}
            className={`w-8 h-8 cut-sm flex items-center justify-center flex-shrink-0
                       hover:opacity-80 active:scale-95 transition-all
                       ${isInApp ? 'bg-surface-2 border border-border' : 'bg-accent'}`}
            title={isInApp ? 'Back to Home' : 'Open Workspace'}
          >
            {isInApp
              ? <Home size={14} className="text-text-1" strokeWidth={2} />
              : <Terminal size={14} className="text-surface-0" strokeWidth={2.5} />
            }
          </button>

          <span className="font-mono text-sm font-semibold tracking-wide truncate text-text-0">
            {title || 'NEXUS'}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="h-9 px-2.5 flex items-center gap-1.5 rounded-xl
                     active:bg-surface-2 hover:bg-surface-2 transition-colors"
            aria-label="Toggle language"
          >
            <Languages size={15} className="text-text-2" />
            <span className="font-mono text-[11px] font-bold text-text-1 uppercase">{lang.toUpperCase()}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                     active:bg-surface-2 hover:bg-surface-2 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun size={17} className="text-accent" />
              : <Moon size={17} className="text-text-1" />
            }
          </button>
        </div>
      </div>
    </nav>
  );
}
