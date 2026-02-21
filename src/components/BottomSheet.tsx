import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: string;
}

export default function BottomSheet({ isOpen, onClose, title, children, height = '75vh' }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={`bottom-sheet-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet ${isOpen ? 'open' : ''}`} style={{ height }}>
        <div className="bottom-sheet-handle" />
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="font-mono text-xs uppercase tracking-widest text-text-2">{title}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 active:bg-surface-3 transition-colors"
            >
              <X size={16} className="text-text-1" />
            </button>
          </div>
        )}
        <div className="overflow-auto touch-scroll safe-b" style={{ maxHeight: `calc(${height} - 60px)` }}>
          {children}
        </div>
      </div>
    </>
  );
}
