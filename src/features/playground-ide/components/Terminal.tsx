'use client';

import { useRef, useEffect } from 'react';
import { type TerminalLog } from '@/app/types/Playground';

interface TerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
  isDarkMode: boolean;
}

export function Terminal({ logs, onClear, isDarkMode }: TerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`h-48 border-t flex flex-col shrink-0 ${isDarkMode ? 'bg-gray-950 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
      {/* 터미널 헤더 */}
      <div className={`px-4 py-2 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Terminal</span>
        <button
          onClick={onClear}
          className={`text-xs px-2 py-1 rounded transition ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'}`}
        >
          Clear
        </button>
      </div>

      {/* 터미널 내용 */}
      <div className={`flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-1 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
        {logs.map((log) => (
          <div
            key={log.id}
            className={`${
              log.type === 'success'
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : log.type === 'error'
                ? isDarkMode ? 'text-red-400' : 'text-red-600'
                : log.type === 'warning'
                ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {log.message}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}