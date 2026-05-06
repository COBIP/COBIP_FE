'use client';

import { type File } from '@/app/types/Playground';

interface EditorProps {
  activeFile: File | undefined;
  onCodeChange: (code: string) => void;
}

export function Editor({ activeFile, onCodeChange }: EditorProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <textarea
        value={activeFile?.content || ''}
        onChange={(e) => onCodeChange(e.target.value)}
        className="w-full h-full px-4 py-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none border-none"
        spellCheck="false"
      />
    </div>
  );
}