'use client';

import { FolderOpen, File } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
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
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id}>
          <button
            onClick={() => node.type === 'file' && onFileSelect?.(node.name)}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[14px] transition-colors ${
              activeFile === node.name
                ? isDarkMode
                  ? 'bg-[#2D1B69] text-white'
                  : 'bg-[#F5F3FF] text-[#5B21B6]'
                : isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
            style={{ paddingLeft: `${12 + depth * 14}px` }}
          >
            {node.type === 'folder' ? (
              <FolderOpen className="h-4 w-4 text-[#7C3AED]" />
            ) : (
              <File className={`h-4 w-4 ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`} />
            )}
            <span className="font-medium">{node.name}</span>
          </button>

          {node.children && node.expanded && (
            <div className="mt-1">{renderFileTree(node.children, depth + 1)}</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`w-56 min-w-0 shrink-0 border-r transition-all duration-300 flex flex-col ${
        isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}
    >
      <div
        className={`border-b px-4 py-3 text-[14px] font-semibold transition-colors duration-300 ${
          isDarkMode ? 'bg-[#1E293B] border-[#334155] text-white' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
        }`}
      >
        파일 탐색기
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">{renderFileTree(files)}</div>
    </div>
  );
}
