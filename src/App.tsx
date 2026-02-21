import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import ProjectsPage from './components/ProjectsPage';
import { useProjectStore } from './store/projectStore';
import { handleUserPrompt, bootWebContainer } from './services/projectController';
import type { SavedProject } from './services/projectStorage';

type View = 'landing' | 'workspace' | 'projects';

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const projectName = useProjectStore((s) => s.projectName);
  const { setFiles, setProjectName, openFile, clearChat, addChatMessage, clearTerminal, setPreviewUrl } = useProjectStore();

  const handleStartProject = async (prompt: string) => {
    setView('workspace');
    try {
      await bootWebContainer();
      if (prompt.trim()) {
        await handleUserPrompt(prompt);
      }
    } catch (error) {
      console.error('Failed to start project:', error)
    }
  };

  const handleOpenSavedProject = async (project: SavedProject) => {
    // Load project state into store
    clearChat();
    clearTerminal();
    setPreviewUrl(null);
    setProjectName(project.name);
    setFiles(project.files);

    // Restore first user message as context
    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: project.description,
      timestamp: project.createdAt,
    });
    addChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Project "${project.name}" loaded — ${project.fileCount} files restored.`,
      timestamp: project.createdAt + 1,
    });

    // Open main file
    const mainFile = Object.keys(project.files).find(f =>
      f.includes('App.') || f.includes('main.')
    ) || Object.keys(project.files)[0];
    if (mainFile) openFile(mainFile);

    setView('workspace');

    // Boot and restart dev server
    try {
      await bootWebContainer();
      const { applyGeneratedFiles } = await import('./services/projectController');
      await applyGeneratedFiles(project.files, []);
    } catch (e) {
      console.error('Failed to load project:', e);
    }
  };

  const handleLogoClick = () => {
    if (view === 'landing') {
      setView('workspace');
      bootWebContainer().catch(console.error);
    } else {
      setView('landing');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-0">
      <Navbar
        view={view}
        title={view === 'workspace' ? projectName : view === 'projects' ? 'Projects' : undefined}
        onLogoClick={handleLogoClick}
      />
      <div className="flex-1 overflow-hidden">
        {view === 'landing' && (
          <LandingPage
            onStartProject={handleStartProject}
            onOpenProjects={() => setView('projects')}
          />
        )}
        {view === 'workspace' && <Workspace />}
        {view === 'projects' && (
          <ProjectsPage
            onOpenProject={handleOpenSavedProject}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
