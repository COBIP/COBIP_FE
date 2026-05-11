'use client';

import { ChevronRight, FileText, FolderOpen } from 'lucide-react';

interface FileNode {
  id?: string;
  name: string;
  path?: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  expanded?: boolean;
}

interface FileExplorerProps {
  files: FileNode[];
  activeFile?: string;
  onFileSelect?: (fileName: string) => void;
  isDarkMode?: boolean;
}

export function FileExplorer({ files, activeFile, onFileSelect, isDarkMode = false }: FileExplorerProps) {
  const renderFileTree = (nodes: FileNode[], depth = 0) => (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        const nodePath = node.path ?? node.name;
        const isActive = node.type === 'file' && activeFile === nodePath;

        return (
          <div key={node.id ?? nodePath}>
            <button
              type="button"
              onClick={() => node.type === 'file' && onFileSelect?.(nodePath)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                isActive
                  ? isDarkMode
                    ? 'bg-[#2D1B69] text-white'
                    : 'bg-[#F3E8FF] text-[#7C3AED]'
                  : isDarkMode
                    ? 'text-[#CBD5E1] hover:bg-[#334155]'
                    : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              {node.type === 'folder' ? (
                <>
                  <ChevronRight className={`h-3.5 w-3.5 ${node.expanded ? 'rotate-90' : ''}`} />
                  <FolderOpen className="h-4 w-4 text-[#F59E0B]" />
                </>
              ) : (
                <>
                  <span className="w-3.5" />
                  <FileText className={`h-4 w-4 ${isActive ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}`} />
                </>
              )}
              <span className="min-w-0 truncate font-medium">{node.name}</span>
            </button>

            {node.children && node.expanded && <div className="mt-0.5">{renderFileTree(node.children, depth + 1)}</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`flex h-full min-w-0 flex-col ${isDarkMode ? 'bg-[#111827]' : 'bg-[#F8FAFC]'}`}>
      <div
        className={`border-b px-4 py-3 text-[13px] font-semibold ${
          isDarkMode ? 'border-[#334155] text-white' : 'border-[#E2E8F0] text-[#334155]'
        }`}
      >
        탐색기
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">{renderFileTree(files)}</div>
    </div>
  );
}
