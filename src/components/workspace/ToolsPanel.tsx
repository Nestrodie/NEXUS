import { useState } from 'react';
import {
  GitBranch, Globe, Cpu, Database, Key, Shield, Settings, Workflow,
  Users, Package, Bell, Lock, Server, HardDrive, ChevronRight, X,
  Search, Layers
} from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

interface Tool {
  id: string;
  icon: typeof GitBranch;
  name: string;
  nameRu: string;
  desc: string;
  descRu: string;
  badge?: string;
  color: string;
}

const TOOLS: Tool[] = [
  {
    id: 'git',
    icon: GitBranch,
    name: 'Git',
    nameRu: 'Git',
    desc: 'Version control — commit, branch, push & pull',
    descRu: 'Управление версиями — коммиты, ветки, push и pull',
    color: 'text-orange',
  },
  {
    id: 'publishing',
    icon: Globe,
    name: 'Publishing',
    nameRu: 'Публикация',
    desc: 'Deploy your app to a public URL instantly',
    descRu: 'Задеплой приложение на публичный URL мгновенно',
    badge: 'Soon',
    color: 'text-cyan',
  },
  {
    id: 'agent-skills',
    icon: Cpu,
    name: 'Agent Skills',
    nameRu: 'Навыки Агента',
    desc: 'Configure what the AI agent can do autonomously',
    descRu: 'Настрой что агент ИИ может делать автономно',
    color: 'text-accent',
  },
  {
    id: 'storage',
    icon: HardDrive,
    name: 'App Storage',
    nameRu: 'Хранилище',
    desc: 'Persistent file storage for your application',
    descRu: 'Постоянное файловое хранилище для приложения',
    color: 'text-green',
  },
  {
    id: 'auth',
    icon: Lock,
    name: 'Auth',
    nameRu: 'Аутентификация',
    desc: 'Add user authentication — login, signup, sessions',
    descRu: 'Добавь аутентификацию — вход, регистрация, сессии',
    badge: 'Soon',
    color: 'text-red',
  },
  {
    id: 'database',
    icon: Database,
    name: 'Database',
    nameRu: 'База данных',
    desc: 'SQL / NoSQL database for your project',
    descRu: 'SQL / NoSQL база данных для проекта',
    badge: 'Soon',
    color: 'text-cyan',
  },
  {
    id: 'developer',
    icon: Settings,
    name: 'Developer',
    nameRu: 'Разработчик',
    desc: 'Env variables, build settings, runtime config',
    descRu: 'Переменные среды, настройки сборки, конфигурация',
    color: 'text-text-1',
  },
  {
    id: 'invite',
    icon: Users,
    name: 'Invite',
    nameRu: 'Пригласить',
    desc: 'Collaborate — share access to your workspace',
    descRu: 'Совместная работа — поделись доступом к воркспейсу',
    badge: 'Soon',
    color: 'text-accent',
  },
  {
    id: 'integrations',
    icon: Package,
    name: 'Integrations',
    nameRu: 'Интеграции',
    desc: 'Connect third-party services and APIs',
    descRu: 'Подключи сторонние сервисы и API',
    color: 'text-orange',
  },
  {
    id: 'secrets',
    icon: Key,
    name: 'Secrets',
    nameRu: 'Секреты',
    desc: 'Securely store API keys and environment secrets',
    descRu: 'Безопасно храни API ключи и секреты окружения',
    color: 'text-accent',
  },
  {
    id: 'kv-store',
    icon: Server,
    name: 'Key-Value Store',
    nameRu: 'Key-Value хранилище',
    desc: 'Fast in-memory key-value store for caching',
    descRu: 'Быстрое in-memory хранилище для кэширования',
    badge: 'Soon',
    color: 'text-green',
  },
  {
    id: 'security',
    icon: Shield,
    name: 'Security Scanner',
    nameRu: 'Сканер безопасности',
    desc: 'Scan your code for vulnerabilities & issues',
    descRu: 'Сканируй код на уязвимости и проблемы безопасности',
    color: 'text-red',
  },
  {
    id: 'notifications',
    icon: Bell,
    name: 'User Settings',
    nameRu: 'Настройки',
    desc: 'Workspace preferences, theme, notifications',
    descRu: 'Настройки воркспейса, тема, уведомления',
    color: 'text-text-1',
  },
  {
    id: 'workflow',
    icon: Workflow,
    name: 'Workflow',
    nameRu: 'Воркфлоу',
    desc: 'Automate tasks with CI/CD pipelines',
    descRu: 'Автоматизируй задачи с CI/CD пайплайнами',
    badge: 'Soon',
    color: 'text-cyan',
  },
];

interface ToolDetailProps {
  tool: Tool;
  onClose: () => void;
  lang: string;
}

function ToolDetail({ tool, onClose, lang }: ToolDetailProps) {
  const Icon = tool.icon;
  const name = lang === 'ru' ? tool.nameRu : tool.name;
  const desc = lang === 'ru' ? tool.descRu : tool.desc;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
        >
          <ChevronRight size={14} className="rotate-180" />
        </button>
        <div className={`w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center ${tool.color}`}>
          <Icon size={16} />
        </div>
        <span className="font-mono text-sm font-medium text-text-0">{name}</span>
        {tool.badge && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-3 text-[10px] font-bold font-mono text-text-2 uppercase">
            {tool.badge}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-text-2 mb-6 leading-relaxed">{desc}</p>
        {tool.badge === 'Soon' ? (
          <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
            <span className="text-sm text-text-3">
              {lang === 'ru' ? 'Скоро будет доступно' : 'Coming soon'}
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
            <span className="text-sm text-accent font-mono">
              {lang === 'ru' ? 'Функция в разработке' : 'Feature in development'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ToolsPanelProps {
  onClose: () => void;
}

export default function ToolsPanel({ onClose }: ToolsPanelProps) {
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Tool | null>(null);

  const filtered = TOOLS.filter(t => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.nameRu.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)
    );
  });

  if (selected) {
    return <ToolDetail tool={selected} onClose={() => setSelected(null)} lang={lang} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Layers size={15} className="text-accent shrink-0" />
        <span className="font-mono text-xs uppercase tracking-wider text-text-2 flex-1">
          {lang === 'ru' ? 'Инструменты' : 'Tools'}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-0 border border-border">
          <Search size={13} className="text-text-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ru' ? 'Поиск...' : 'Search...'}
            className="flex-1 bg-transparent text-xs text-text-0 placeholder:text-text-3 outline-none font-mono"
          />
        </div>
      </div>

      {/* Tools list */}
      <div className="flex-1 overflow-auto py-1">
        {filtered.map(tool => {
          const Icon = tool.icon;
          const name = lang === 'ru' ? tool.nameRu : tool.name;
          const desc = lang === 'ru' ? tool.descRu : tool.desc;
          return (
            <button
              key={tool.id}
              onClick={() => setSelected(tool)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left group"
            >
              <div className={`w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 mt-0.5 ${tool.color} group-hover:border-border-hover transition-colors`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-0">{name}</span>
                  {tool.badge && (
                    <span className="px-1.5 py-px rounded bg-surface-3 text-[9px] font-bold font-mono text-text-3 uppercase">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-3 mt-0.5 leading-relaxed line-clamp-2">{desc}</p>
              </div>
              <ChevronRight size={13} className="text-text-3 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
