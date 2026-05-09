'use client';

import { type File } from '@/app/types/Playground';

interface EditorProps {
  activeFile: File | undefined;
  onCodeChange: (code: string) => void;
  isDarkMode: boolean;
}

export function Editor({ activeFile, onCodeChange, isDarkMode }: EditorProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <textarea
        value={activeFile?.content || ''}
        onChange={(e) => onCodeChange(e.target.value)}
        className={`w-full h-full px-4 py-4 font-mono text-sm resize-none focus:outline-none border-none ${isDarkMode 
          ? 'bg-gray-900 text-gray-300' 
          : 'bg-white text-gray-900'}`}
        spellCheck="false"
      />
    </div>
  );
}