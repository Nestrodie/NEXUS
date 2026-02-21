import { useState } from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, Loader, ExternalLink, Maximize2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useLang } from '../../context/LanguageContext';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPanel() {
  const { lang } = useLang();
  const { previewUrl, isInstalling, isBooting, files } = useProjectStore();
  const [device, setDevice] = useState<Device>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const widths: Record<Device, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const devices: { id: Device; icon: typeof Monitor; label: string }[] = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  const t = {
    preview: lang === 'ru' ? 'Превью' : 'Preview',
    loading: lang === 'ru' ? 'Загрузка...' : 'Loading...',
    installing: lang === 'ru' ? 'Установка...' : 'Installing...',
    booting: lang === 'ru' ? 'Загрузка среды...' : 'Booting...',
    noPreview: lang === 'ru' ? 'Превью появится после генерации' : 'Preview will appear after generation',
    noFiles: lang === 'ru' ? 'Создайте проект чтобы увидеть превью' : 'Generate a project to see preview',
  };

  const hasFiles = Object.keys(files).length > 0;

  return (
    <div className="h-full flex flex-col bg-surface-1">
      {/* Toolbar */}
      <div className="h-10 px-3 flex items-center justify-between bg-surface-0 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-2 uppercase tracking-wider">{t.preview}</span>
          {previewUrl && (
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-green/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-[10px] text-green font-mono">LIVE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="hidden md:flex bg-surface-2 rounded-lg p-0.5">
            {devices.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  title={d.label}
                  className={`p-1.5 rounded-md transition-colors
                           ${device === d.id ? 'bg-surface-1 text-accent shadow-sm' : 'text-text-2 hover:text-text-1'}`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          {previewUrl && (
            <>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-2 text-text-2 hover:text-text-1 transition-colors rounded-lg"
                title="Refresh"
              >
                <RotateCw size={14} />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-2 hover:text-text-1 transition-colors rounded-lg"
                title="Open in new tab"
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe) {
                    iframe.requestFullscreen?.();
                  }
                }}
                className="p-2 text-text-2 hover:text-text-1 transition-colors rounded-lg hidden md:block"
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] flex items-start justify-center p-2 md:p-4">
        {previewUrl ? (
          <div
            className="bg-white rounded-lg overflow-hidden transition-all duration-300 shadow-2xl h-full"
            style={{ width: widths[device], maxWidth: '100%' }}
          >
            <iframe
              key={refreshKey}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {isBooting || isInstalling ? (
              <>
                <div className="relative mb-4">
                  <Loader size={40} className="text-accent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-accent/30" />
                  </div>
                </div>
                <p className="text-sm text-text-1 font-medium mb-1">
                  {isBooting ? t.booting : t.installing}
                </p>
                <p className="text-xs text-text-3 font-mono">
                  {isBooting ? 'Initializing WebContainer...' : 'Running npm install...'}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 border border-border">
                  <Monitor size={36} className="text-text-3" />
                </div>
                <p className="text-sm text-text-1 font-medium mb-1">
                  {hasFiles ? t.noPreview : t.noFiles}
                </p>
                <p className="text-xs text-text-3 text-center px-4 max-w-xs">
                  {lang === 'ru' 
                    ? 'Используйте AI чат для создания проекта' 
                    : 'Use AI chat to create a project'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
