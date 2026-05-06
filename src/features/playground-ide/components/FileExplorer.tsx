'use client';

import { FileText, Trash2, Plus } from 'lucide-react';
import { type File } from '@/app/types/Playground';
import { LANGUAGE_CONFIGS } from '@/data/Languages';

interface FileExplorerProps {
  files: File[];
  activeFileId: string;
  selectedTemplate: 'none' | string;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onAddFile: () => void;
}

export function FileExplorer({
  files,
  activeFileId,
  selectedTemplate,
  onFileSelect,
  onFileDelete,
  onAddFile,
}: FileExplorerProps) {
  return (
    <div className="w-64 border-r border-gray-700 flex flex-col bg-gray-950 shrink-0">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <FileText size={16} className="text-purple-400" />
          Explorer
        </h2>
      </div>

      {/* 파일 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm cursor-pointer transition-all group ${
                activeFileId === file.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2 flex-1 truncate">
                <span>{LANGUAGE_CONFIGS[file.language].icon}</span>
                <span className="truncate">{file.name}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.id);
                }}
                className="p-1 hover:bg-red-600 rounded transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 파일 추가 버튼 (템플릿이 없을 때만) */}
      {selectedTemplate === 'none' && (
        <div className="px-2 py-3 border-t border-gray-700">
          <button
            onClick={onAddFile}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition"
          >
            <Plus size={16} />
            New File
          </button>
        </div>
      )}
    </div>
  );
}