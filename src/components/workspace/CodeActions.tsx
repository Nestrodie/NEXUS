import { Sparkles, RefreshCw, TestTube, HelpCircle, X } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { handleUserPrompt } from '../../services/projectController';
import { 
  generateExplainPrompt, 
  generateRefactorPrompt, 
  generateTestPrompt 
} from '../../services/ai';
import { useLang } from '../../context/LanguageContext';

export default function CodeActions() {
  const { lang } = useLang();
  const { selectedCode, setSelectedCode, isGenerating, files } = useProjectStore();

  const t = {
    explain: lang === 'ru' ? 'Объяснить' : 'Explain',
    refactor: lang === 'ru' ? 'Рефакторинг' : 'Refactor',
    test: lang === 'ru' ? 'Создать тесты' : 'Generate Tests',
    improve: lang === 'ru' ? 'Улучшить' : 'Improve',
    selectedCode: lang === 'ru' ? 'Выбранный код' : 'Selected Code',
  };

  if (!selectedCode) return null;

  // Get full file content for context
  const fullFileContent = files[selectedCode.filePath] || '';

  const actions = [
    {
      id: 'explain',
      icon: HelpCircle,
      label: t.explain,
      color: 'text-cyan',
      bg: 'bg-cyan/10',
      action: () => {
        const prompt = generateExplainPrompt(selectedCode.code, selectedCode.filePath);
        handleUserPrompt(prompt);
        setSelectedCode(null);
      },
    },
    {
      id: 'refactor',
      icon: RefreshCw,
      label: t.refactor,
      color: 'text-accent',
      bg: 'bg-accent/10',
      action: () => {
        const prompt = generateRefactorPrompt(selectedCode.code, selectedCode.filePath, fullFileContent);
        handleUserPrompt(prompt);
        setSelectedCode(null);
      },
    },
    {
      id: 'test',
      icon: TestTube,
      label: t.test,
      color: 'text-green',
      bg: 'bg-green/10',
      action: () => {
        const prompt = generateTestPrompt(selectedCode.code, selectedCode.filePath);
        handleUserPrompt(prompt);
        setSelectedCode(null);
      },
    },
    {
      id: 'improve',
      icon: Sparkles,
      label: t.improve,
      color: 'text-orange',
      bg: 'bg-orange/10',
      action: () => {
        const prompt = `Improve this code from "${selectedCode.filePath}". Make it more efficient, readable, and following best practices:\n\n\`\`\`\n${selectedCode.code}\n\`\`\`\n\nFull file for context:\n\`\`\`\n${fullFileContent}\n\`\`\``;
        handleUserPrompt(prompt);
        setSelectedCode(null);
      },
    },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 
                  animate-fade-up">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl 
                    p-2 flex items-center gap-2">
        <div className="px-3 py-1.5 bg-surface-2 rounded-xl flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-3 uppercase">{t.selectedCode}</span>
          <span className="text-xs font-mono text-text-1 truncate max-w-[100px]">
            {selectedCode.filePath.split('/').pop()}
          </span>
        </div>

        <div className="w-px h-6 bg-border" />

        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl 
                       ${action.bg} ${action.color} 
                       hover:opacity-80 transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Icon size={16} />
              <span className="text-xs font-medium hidden sm:inline">{action.label}</span>
            </button>
          );
        })}

        <div className="w-px h-6 bg-border" />

        <button
          onClick={() => setSelectedCode(null)}
          className="p-2 rounded-xl text-text-3 hover:text-text-1 
                   hover:bg-surface-2 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
