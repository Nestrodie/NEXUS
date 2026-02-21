import { useMemo } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useState } from 'react';

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of Object.keys(files).sort()) {
    const parts = filePath.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          children: [],
        };
        currentLevel.push(existing);
      }

      if (!isLast) {
        currentLevel = existing.children;
      }
    }
  }

  return root;
}

function getFileColor(name: string): string {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'text-cyan';
  if (name.endsWith('.jsx') || name.endsWith('.js')) return 'text-accent';
  if (name.endsWith('.css') || name.endsWith('.scss')) return 'text-red';
  if (name.endsWith('.json')) return 'text-orange';
  if (name.endsWith('.html')) return 'text-red';
  if (name.endsWith('.md')) return 'text-text-1';
  return 'text-text-2';
}

function TreeNodeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const { openFile, activeFile, deleteFileFromStore } = useProjectStore();
  const isActive = activeFile === node.path;

  const handleClick = () => {
    if (node.isDirectory) {
      setOpen(!open);
    } else {
      openFile(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 py-2 md:py-1.5 px-3 text-left group
                 transition-colors ${isActive ? 'bg-accent/10 text-accent' : 'active:bg-surface-2 md:hover:bg-surface-2'}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {node.isDirectory ? (
          open ? <ChevronDown size={14} className="text-text-3 shrink-0" />
               : <ChevronRight size={14} className="text-text-3 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {node.isDirectory
          ? <Folder size={15} className="text-accent shrink-0" />
          : <FileText size={15} className={`${getFileColor(node.name)} shrink-0`} />
        }
        <span className={`font-mono text-xs truncate ${isActive ? 'text-accent' : 'text-text-1'}`}>
          {node.name}
        </span>
        {!node.isDirectory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFileFromStore(node.path);
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-text-3 hover:text-red transition-all"
          >
            <Trash2 size={12} />
          </button>
        )}
      </button>
      {node.isDirectory && open && node.children.map((child) => (
        <TreeNodeItem key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FileTree() {
  const { files } = useProjectStore();
  const tree = useMemo(() => buildTree(files), [files]);

  if (tree.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-xs text-text-3 font-mono text-center">No files yet.<br />Use AI to generate a project.</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {tree.map((node) => (
        <TreeNodeItem key={node.path} node={node} />
      ))}
    </div>
  );
}
