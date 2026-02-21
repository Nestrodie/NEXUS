import { X, FileCode, FileJson, FileType, File } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export default function FileTabs() {
  const { activeFile, setActiveFile, openFiles, closeFile } = useProjectStore();

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return FileCode;
      case 'json':
        return FileJson;
      case 'css':
      case 'scss':
        return FileType;
      default:
        return File;
    }
  };

  const getFileColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'text-cyan';
      case 'jsx':
      case 'js':
        return 'text-yellow-400';
      case 'json':
        return 'text-green';
      case 'css':
      case 'scss':
        return 'text-pink-400';
      case 'html':
        return 'text-orange';
      default:
        return 'text-text-2';
    }
  };

  if (openFiles.length === 0) return null;

  return (
    <div className="file-tabs">
      {openFiles.map((path: string) => {
        const filename = path.split('/').pop() || path;
        const Icon = getFileIcon(filename);
        const isActive = activeFile === path;

        return (
          <button
            key={path}
            onClick={() => setActiveFile(path)}
            className={`file-tab ${isActive ? 'active' : ''}`}
          >
            <Icon size={14} className={getFileColor(filename)} />
            <span>{filename}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
              className="file-tab-close"
            >
              <X size={12} />
            </button>
          </button>
        );
      })}
    </div>
  );
}
