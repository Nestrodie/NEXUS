import { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  direction: 'horizontal' | 'vertical';
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  onResize?: (size: number) => void;
}

export default function ResizablePanel({
  children,
  direction,
  defaultSize,
  minSize = 150,
  maxSize = 800,
  className = '',
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const isResizing = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize.current = size;
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      const newSize = Math.min(maxSize, Math.max(minSize, startSize.current + delta));
      
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, size, minSize, maxSize, onResize]);

  const style = direction === 'horizontal' 
    ? { width: size } 
    : { height: size };

  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} shrink-0`} style={style}>
      <div className={`flex-1 overflow-hidden ${className}`}>
        {children}
      </div>
      <div
        className={`resize-handle ${direction === 'horizontal' ? 'resize-handle-x' : 'resize-handle-y'}`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
