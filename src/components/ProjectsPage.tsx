import { useState, useEffect } from 'react';
import { Layers, Plus, Clock, Trash2, ExternalLink, FileText, Cpu, RotateCcw, Check } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useProjectStore } from '../store/projectStore';
import {
  getAllProjects,
  saveProject,
  deleteProject,
  createProjectFromState,
  timeAgo,
  type SavedProject,
} from '../services/projectStorage';

interface ProjectsPageProps {
  onOpenProject: (project: SavedProject) => void;
}

export default function ProjectsPage({ onOpenProject }: ProjectsPageProps) {
  const { lang } = useLang();
  const { files, chatMessages, providerId, modelId, previewUrl } = useProjectStore();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const t = {
    title: lang === 'ru' ? 'Проекты' : 'Projects',
    subtitle: lang === 'ru' ? 'Сохранённые проекты' : 'Saved projects',
    empty: lang === 'ru' ? 'Нет сохранённых проектов' : 'No saved projects yet',
    emptyDesc: lang === 'ru'
      ? 'Создайте проект на главной и нажмите «Сохранить»'
      : 'Create a project and click "Save"',
    open: lang === 'ru' ? 'Открыть' : 'Open',
    delete: lang === 'ru' ? 'Удалить' : 'Delete',
    files: lang === 'ru' ? 'файлов' : 'files',
    currentProject: lang === 'ru' ? 'Текущий проект' : 'Current project',
    saveCurrent: lang === 'ru' ? 'Сохранить' : 'Save',
    saved: lang === 'ru' ? 'Сохранено!' : 'Saved!',
    updated: lang === 'ru' ? 'Обновлено:' : 'Updated:',
    created: lang === 'ru' ? 'Создан:' : 'Created:',
    noPrompt: lang === 'ru' ? 'Нет описания' : 'No description',
  };

  const fileCount = Object.keys(files).length;
  const firstUserMsg = chatMessages.find(m => m.role === 'user');
  const hasCurrentProject = fileCount > 0 && !!firstUserMsg;

  const handleSaveCurrent = () => {
    if (!firstUserMsg) return;
    const project = createProjectFromState(
      firstUserMsg.content,
      files,
      providerId,
      modelId,
      previewUrl
    );
    saveProject(project);
    setProjects(getAllProjects());
    setSavedId(project.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteProject(id);
      setProjects(getAllProjects());
      setDeletingId(null);
    }, 300);
  };

  const getFileTypeBreakdown = (projectFiles: Record<string, string>) => {
    const counts: Record<string, number> = {};
    for (const path of Object.keys(projectFiles)) {
      const ext = path.split('.').pop() || 'other';
      counts[ext] = (counts[ext] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([ext, count]) => `${count} .${ext}`)
      .join(', ');
  };

  return (
    <div className="h-full overflow-auto touch-scroll safe-b bg-surface-0">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-8 pb-20">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-full mb-4">
            <Layers size={12} className="text-accent" />
            <span className="font-mono text-[11px] text-text-2 uppercase tracking-wider">{t.title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t.title}</h1>
          <p className="text-sm text-text-2">{t.subtitle}</p>
        </div>

        {/* Current project — save banner */}
        {hasCurrentProject && (
          <div
            className="mb-6 p-4 bg-surface-1 border border-border rounded-2xl animate-fade-up"
            style={{ animationDelay: '0.05s' }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{t.currentProject}</span>
                </div>
                <p className="text-sm font-medium text-text-0 truncate">
                  {firstUserMsg.content.slice(0, 70)}{firstUserMsg.content.length > 70 ? '...' : ''}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[11px] text-text-3 flex items-center gap-1">
                    <FileText size={10} />
                    {fileCount} {t.files}
                  </span>
                  {providerId && (
                    <span className="font-mono text-[11px] text-text-3 flex items-center gap-1">
                      <Cpu size={10} />
                      {providerId}
                    </span>
                  )}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveCurrent}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0
                           active:scale-95 transition-all
                           ${savedId ? 'bg-green text-white' : 'bg-accent text-surface-0 hover:opacity-90'}`}
              >
                {savedId ? (
                  <><Check size={13} /> {t.saved}</>
                ) : (
                  <><Plus size={13} /> {t.saveCurrent}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="text-center py-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <Layers size={28} className="text-text-3" />
            </div>
            <p className="text-text-1 font-medium mb-1">{t.empty}</p>
            <p className="text-sm text-text-3 max-w-xs mx-auto">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={`bg-surface-1 border border-border rounded-2xl overflow-hidden
                            transition-all duration-300
                            ${deletingId === project.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                            hover:border-border-hover`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">

                    {/* Provider initials */}
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 font-mono text-[11px] font-bold text-text-2">
                      {(project.providerId || 'AI').slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-0 truncate mb-0.5">
                        {project.name}
                      </p>
                      {project.description !== project.name && (
                        <p className="text-[12px] text-text-2 line-clamp-1 mb-1.5">
                          {project.description}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-[10px] text-text-3">
                          <Clock size={9} />
                          {timeAgo(project.updatedAt || project.createdAt, lang)}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-text-3">
                          <FileText size={9} />
                          {project.fileCount} {t.files}
                        </span>
                        {project.providerId && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-text-3">
                            <Cpu size={9} />
                            {project.providerId}
                          </span>
                        )}
                      </div>

                      {/* File type breakdown */}
                      {Object.keys(project.files).length > 0 && (
                        <p className="font-mono text-[10px] text-text-3 mt-1 truncate">
                          {getFileTypeBreakdown(project.files)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenProject(project)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl
                                   bg-surface-0 border border-border text-xs font-medium text-text-1
                                   hover:border-accent/50 hover:text-text-0 transition-all"
                      >
                        <ExternalLink size={12} />
                        {t.open}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="w-8 h-8 rounded-xl text-text-3 hover:text-red hover:bg-red/10
                                   flex items-center justify-center transition-colors"
                        title={t.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview URL bar (if available) */}
                {project.previewUrl && (
                  <div className="px-4 py-2 border-t border-border bg-surface-0 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                    <span className="font-mono text-[10px] text-text-3 truncate">{project.previewUrl}</span>
                    <a
                      href={project.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-text-3 hover:text-text-1 transition-colors"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reset / clear all */}
        {projects.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                if (window.confirm(lang === 'ru' ? 'Удалить все проекты?' : 'Delete all projects?')) {
                  localStorage.removeItem('nexus-saved-projects');
                  setProjects([]);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-text-3
                         hover:text-red hover:bg-red/5 transition-colors border border-transparent
                         hover:border-red/20"
            >
              <RotateCcw size={13} />
              {lang === 'ru' ? 'Очистить всё' : 'Clear all'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
