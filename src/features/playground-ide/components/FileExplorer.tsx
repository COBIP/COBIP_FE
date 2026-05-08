'use client';

import Link from 'next/link';
import { FileText, Folder as FolderIcon, ChevronRight, ChevronDown, Trash2, Plus, FolderPlus } from 'lucide-react';
import { type File, type Folder } from '@/app/types/Playground';
import { LANGUAGE_CONFIGS } from '@/data/Languages';

interface FileExplorerProps {
  files: File[];
  folders: Folder[];
  activeFileId: string;
  selectedTemplate: 'none' | string;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleFolderExpansion: (folderId: string) => void;
  isDarkMode: boolean;
}

export function FileExplorer({
  files,
  folders,
  activeFileId,
  selectedTemplate,
  onFileSelect,
  onFileDelete,
  onAddFile,
  onAddFolder,
  onDeleteFolder,
  onToggleFolderExpansion,
  isDarkMode,
}: FileExplorerProps) {
  const rootFiles = files.filter((f) => !f.parentId);
  
  const getFilesInFolder = (folderId: string) => {
    return files.filter((f) => f.parentId === folderId);
  };

  const renderFileItem = (file: File) => (
    <div
      key={file.id}
      onClick={() => onFileSelect(file.id)}
      className={`flex items-center justify-between px-3 py-2 rounded text-sm cursor-pointer transition-all group ${
        activeFileId === file.id
          ? isDarkMode
            ? 'bg-gray-700 text-white'
            : 'bg-purple-100 text-purple-900'
          : isDarkMode
          ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
        className={`p-1 rounded transition opacity-0 group-hover:opacity-100 ${isDarkMode ? 'hover:bg-red-600' : 'hover:bg-red-500'}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const renderFolderItem = (folder: Folder, level = 0) => {
    const filesInFolder = getFilesInFolder(folder.id);

    return (
      <div key={folder.id}>
        {/* 폴더 헤더 */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded text-sm transition-all group`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <button
            onClick={() => onToggleFolderExpansion(folder.id)}
            className={`flex items-center gap-2 flex-1 cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'}`}
          >
            {folder.expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <FolderIcon size={16} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} />
            <span className="truncate">{folder.name}</span>
          </button>
          <button
            onClick={() => onDeleteFolder(folder.id)}
            className={`p-1 rounded transition opacity-0 group-hover:opacity-100 ${isDarkMode ? 'hover:bg-red-600' : 'hover:bg-red-500'}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* 폴더 내 파일 (확장 시) */}
        {folder.expanded && (
          <div className={isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50'}>
            {filesInFolder.length > 0 ? (
              filesInFolder.map((file) =>
                renderFileItem(file)
              )
            ) : (
              <div
                className={`px-3 py-2 text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                style={{ paddingLeft: `${12 + (level + 1) * 16}px` }}
              >
                폴더가 비어있습니다
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-64 border-r flex flex-col shrink-0 ${isDarkMode ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      {/* 헤더 */}
      <div className={`px-4 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* 로고: 클릭 시 메인 홈으로 이동 */}
          <Link href="/main-home" className="flex items-center cursor-pointer hover:opacity-80 transition">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
              </svg>
            </div>
          </Link>
          <FileText size={16} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
          Explorer
        </h2>
      </div>

      {/* 파일 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {/* 루트 파일들 */}
          {rootFiles.map((file) => renderFileItem(file))}

          {/* 폴더들 */}
          {folders.map((folder) => renderFolderItem(folder))}

          {/* 빈 상태 */}
          {rootFiles.length === 0 && folders.length === 0 && (
            <div className={`px-3 py-6 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              파일이나 폴더를 추가해보세요
            </div>
          )}
        </div>
      </div>

      {/* 추가 버튼 (템플릿이 없을 때만) */}
      {selectedTemplate === 'none' && (
        <div className={`px-2 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            <button
              onClick={onAddFile}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${isDarkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
            >
              <Plus size={16} />
              File
            </button>
            <button
              onClick={onAddFolder}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${isDarkMode 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              <FolderPlus size={16} />
              Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}