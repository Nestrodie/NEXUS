import { useRef, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { runCommand } from '../../services/webcontainer';

interface TerminalPanelProps {
  embedded?: boolean;
}

export default function TerminalPanel({ embedded }: TerminalPanelProps) {
  const { terminalOutput, clearTerminal, addTerminalOutput, isBooted } = useProjectStore();
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleCommand = async () => {
    const cmd = input.trim();
    if (!cmd || !isBooted || isRunning) return;

    setInput('');
    addTerminalOutput(`$ ${cmd}`);
    setIsRunning(true);

    try {
      const parts = cmd.split(' ');
      const program = parts[0];
      const args = parts.slice(1);

      const exitCode = await runCommand(program, args, {
        onOutput: (data) => {
          const lines = data.split('\n');
          for (const line of lines) {
            if (line.trim()) addTerminalOutput(line);
          }
        },
      });

      if (exitCode !== 0) {
        addTerminalOutput(`Process exited with code ${exitCode}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addTerminalOutput(`Error: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex flex-col bg-surface-0 font-mono text-[13px] ${embedded ? 'h-full' : 'h-full'}`}
      onClick={focusInput}
    >
      {!embedded && (
        <div className="h-9 px-4 flex items-center justify-between bg-surface-1 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green/60" />
            </div>
            <span className="text-[11px] text-text-3 uppercase tracking-wider">Terminal</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearTerminal();
            }}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto touch-scroll p-4 space-y-0.5 cursor-text">
        {terminalOutput.length === 0 ? (
          <div className="text-text-3 text-xs">
            {isBooted ? 'Ready. Type a command...' : 'Waiting for WebContainer...'}
          </div>
        ) : (
          terminalOutput.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith('$') || line.startsWith('⚡')
                  ? 'text-accent'
                  : line.startsWith('✓') || line.startsWith('✅')
                  ? 'text-green'
                  : line.startsWith('❌') || line.toLowerCase().includes('error')
                  ? 'text-red'
                  : line.startsWith('📦') || line.startsWith('🔧') || line.startsWith('📁') || line.startsWith('🚀')
                  ? 'text-cyan'
                  : line.startsWith('⚠️')
                  ? 'text-orange'
                  : 'text-text-2'
              }
            >
              {line || '\u00A0'}
            </div>
          ))
        )}
        
        {/* Command input line */}
        {isBooted && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-accent">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              placeholder={isRunning ? 'Running...' : 'Enter command...'}
              className="flex-1 bg-transparent text-text-0 placeholder:text-text-3 
                       outline-none disabled:opacity-50"
            />
            {isRunning && (
              <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
