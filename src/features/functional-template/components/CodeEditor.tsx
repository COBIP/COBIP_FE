"use client";

import { useState } from 'react';
import { Play, MessageCircle, Save, History } from 'lucide-react';

interface CodeEditorProps {
  fileName?: string;
  code?: string;
  onCodeChange?: (value: string) => void;
  fileTabs?: string[];
  onFileSelect?: (fileName: string) => void;
  activeFile?: string;
  isDarkMode?: boolean;
}

const DEFAULT_CODE = `import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
}

export function verifyToken(token: string, secret: string): TokenPayload {
  // JWT 토큰을 검증하고 페이로드를 반환합니다
  const [header, payload, signature] = token.split('.');

  // 여기에 검증 로직을 구현하세요...
  // 1. 서명 검증
  // 2. 만료 시간 확인
  // 3. 페이로드 디코딩

  return {
    userId: 'user123',
    email: 'user@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

export function generateToken(payload: TokenPayload, secret: string): string {
  // JWT 토큰을 생성합니다
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const encodedHeader = Buffer.from(header).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(\`\${encodedHeader}.\${encodedPayload}\`)
    .digest('base64url');

  return \`\${encodedHeader}.\${encodedPayload}.\${signature}\`;
}`;

export function CodeEditor({
  fileName = 'auth.ts',
  code,
  onCodeChange,
  fileTabs = [],
  onFileSelect,
  activeFile,
  isDarkMode = false,
}: CodeEditorProps) {
  const [internalCode, setInternalCode] = useState(DEFAULT_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');

  const editorCode = code ?? internalCode;
  const lineNumbers = Array.from({ length: editorCode.split('\n').length }, (_, i) => i + 1);

  const handleCodeChange = (value: string) => {
    onCodeChange?.(value);
    if (code === undefined) {
      setInternalCode(value);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput('실행 중...');

    setTimeout(() => {
      setConsoleOutput('6.0\nProcess finished with exit code 0');
      setIsRunning(false);
    }, 800);
  };

  return (
    <div
      className={`flex h-full min-w-0 flex-col border-l transition-all duration-300 ${
        isDarkMode
          ? 'bg-[#0F172A] border-[#334155]'
          : 'bg-white border-[#E2E8F0]'
      }`}
    >
      {/* 파일 탭 */}
      <div
        className={`border-b px-3 py-2 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#E2E8F0]'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {fileTabs.map((tab) => {
            const isActive = tab === (activeFile ?? fileName);

            return (
              <button
                key={tab}
                onClick={() => onFileSelect?.(tab)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                  isActive
                    ? isDarkMode
                      ? 'border-[#7C3AED] bg-[#2D1B69] text-white'
                      : 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                    : isDarkMode
                    ? 'border-transparent text-[#94A3B8] hover:bg-[#334155]'
                    : 'border-transparent text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <File className={`h-4 w-4 ${isActive ? 'text-[#7C3AED]' : isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`} />
                <span>{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* 라인 넘버 */}
        <div
          className={`select-none border-r px-3 py-4 font-mono text-[12px] transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#1E293B] border-[#334155] text-[#64748B]'
              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]'
          }`}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* 코드 에디터 */}
        <textarea
          className={`min-w-0 flex-1 overflow-auto px-4 py-4 font-mono text-[14px] resize-none focus:outline-none transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#0F172A] text-white'
              : 'bg-white text-[#1E293B]'
          }`}
          wrap="off"
          style={{ lineHeight: '1.5', whiteSpace: 'pre', overflowX: 'auto' }}
          spellCheck="false"
          onChange={(event) => handleCodeChange(event.target.value)}
          value={editorCode}
        />
      </div>

      {/* 액션 바 */}
      <div
        className={`sticky bottom-0 z-10 flex items-center justify-between border-t px-4 py-3 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#0F172A] border-[#334155]'
            : 'bg-white border-[#E2E8F0]'
        }`}
      >
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50'
              : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50'
          }`}
        >
          <Play className="w-4 h-4" />
          {isRunning ? '실행 중...' : '실행'}
        </button>

        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
              isDarkMode
                ? 'border-[#7C3AED] text-[#7C3AED] hover:bg-[#2D1B69]'
                : 'border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            AI 코드리뷰
          </button>
          <button
            className={`rounded-md p-2 transition-colors duration-300 ${
              isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            className={`rounded-md p-2 transition-colors duration-300 ${
              isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 콘솔 */}
      <div
        className={`flex h-28 flex-col border-t transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#1E293B] border-[#334155]'
            : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}
      >
        <div
          className={`flex items-center gap-1 border-b px-4 py-2 text-[12px] font-semibold transition-colors duration-300 ${
            isDarkMode
              ? 'border-[#334155] text-[#94A3B8]'
              : 'border-[#E2E8F0] text-[#64748B]'
          }`}
        >
          <span>&lt;/&gt;</span>
          <span>실행 결과</span>
        </div>
        <div
          className={`flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] transition-colors duration-300 ${
            isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
          }`}
        >
          {consoleOutput ? (
            consoleOutput.split('\n').map((line, idx) => (
              <div key={idx} className={line.includes('Process') ? 'text-[#64748B]' : ''}>
                {line}
              </div>
            ))
          ) : (
            <div className={isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}>
              여기에 실행 결과가 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function File({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
