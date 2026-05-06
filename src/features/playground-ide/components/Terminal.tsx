'use client';

import { useRef, useEffect } from 'react';
import { type TerminalLog } from '@/app/types/Playground';

interface TerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
}

export function Terminal({ logs, onClear }: TerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-48 bg-gray-950 border-t border-gray-700 flex flex-col shrink-0">
      {/* 터미널 헤더 */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Terminal</span>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 hover:bg-gray-700 rounded transition"
        >
          Clear
        </button>
      </div>

      {/* 터미널 내용 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`${
              log.type === 'success'
                ? 'text-green-400'
                : log.type === 'error'
                ? 'text-red-400'
                : log.type === 'warning'
                ? 'text-yellow-400'
                : 'text-gray-400'
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