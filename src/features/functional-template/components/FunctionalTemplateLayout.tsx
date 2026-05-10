'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen, Layers3, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { MemoPanel } from './MemoPanel';
import { SettingsModal } from './SettingsModal';
import { DesignIntentSection } from './DesignIntentSection';
import { MissionSection } from './MissionSection';
import { RequirementsSection } from './RequirementsSection';
import { StructureSection } from './StructureSection';
import { InterviewSection } from './InterviewSection';
import type { TemplateDetailApiResponse } from '@/api/services/FunctionalTemplateService';

type EditorMode = 'exploration' | 'mission';

interface FileTreeItem {
  id?: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeItem[];
}

const explorationTree: FileTreeItem[] = [
  { name: 'Bootstrap', type: 'folder', children: [{ name: 'main.ts', type: 'file' }, { name: 'utils.ts', type: 'file' }, { name: 'config.json', type: 'file' }] },
];

const missionTree: FileTreeItem[] = [
  { name: 'JWT 검증', type: 'folder', children: [{ name: 'mission1.ts', type: 'file' }, { name: 'mission2.ts', type: 'file' }, { name: 'auth.ts', type: 'file' }, { name: 'mission4.ts', type: 'file' }, { name: 'utils.ts', type: 'file' }, { name: 'config.json', type: 'file' }] },
];

const explorationTabs = ['main.ts', 'utils.ts', 'config.json'];
const missionTabs = ['mission1.ts', 'mission2.ts', 'auth.ts', 'mission4.ts', 'utils.ts', 'config.json'];

const explorationFiles: Record<string, string> = {
  'main.ts': `import { bootstrapApp } from './utils';
import config from './config.json';

bootstrapApp({
  appName: config.appName,
  theme: config.theme,
  telemetry: true,
});`,
  'utils.ts': `export function bootstrapApp(options: { appName: string; theme: string; telemetry: boolean }) {
  return {
    ready: true,
    ...options,
  };
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}`,
  'config.json': `{
  "appName": "Codeit Learning",
  "theme": "deep-violet",
  "telemetry": true,
  "featureFlags": {
    "aiGuru": true,
    "missionHints": true
  }
}`,
};

const missionFiles: Record<string, string> = {
      'mission1.ts': `export const JWT_PARTS = ['header', 'payload', 'signature'];

    export const mission1Hint = 'JWT는 header.payload.signature 형태입니다.';

    export function fillBlank(parts: string[]) {
      return parts.concat('signature');
    }`,
      'mission2.ts': `export function isExpired(exp: number) {
      // BUG: 비교 방향이 반대입니다.
      return exp > Date.now();
    }

    export function fixExpired(exp: number) {
      return Date.now() > exp;
    }`,
      'auth.ts': `import crypto from 'crypto';

    interface TokenPayload {
      userId: string;
      email: string;
      exp: number;
    }

    export function verifyToken(token: string, secret: string): TokenPayload {
      const [header, payload, signature] = token.split('.');

      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      // TODO 1. HMAC-SHA256으로 signature 검증
      // TODO 2. exp 만료 시간 검사
      // TODO 3. payload를 디코딩해 반환

      return {
        userId: 'TODO',
        email: 'TODO',
        exp: 0,
      };
    }

    export function createToken(payload: TokenPayload, secret: string) {
      return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    }`,
      'mission4.ts': `import { verifyToken } from './auth';

    export async function advancedMission(token: string, secret: string) {
      const payload = verifyToken(token, secret);
      return {
        payload,
        role: 'admin',
        canRefresh: true,
      };
    }`,
      'utils.ts': `export const TOKEN_LIFETIME = 60 * 60;

    export function isExpired(exp: number) {
      return Date.now() > exp * 1000;
    }`,
      'config.json': `{
      "authStrategy": "jwt",
      "requiredFields": ["userId", "email", "exp"],
      "mission": "verifyToken"
    }`,
    };

    interface FunctionalTemplateLayoutProps {
      templateTitle: string;
      consecutiveDays?: number;
      templateId?: number | null;
      template?: TemplateDetailApiResponse | null;
    }

    export function FunctionalTemplateLayout({ templateTitle, templateId, template }: FunctionalTemplateLayoutProps) {
      // 상태 관리
      const [activeTab, setActiveTab] = useState('design-intent');
      const [isEditorOpen, setIsEditorOpen] = useState(false);
      const [isMemoOpen, setIsMemoOpen] = useState(false);
      const [isShowSettings, setIsShowSettings] = useState(false);
      const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
      const [isAiGuruHintMode, setIsAiGuruHintMode] = useState(true);
      const [editorMode, setEditorMode] = useState<EditorMode>('exploration');
      const [activeFile, setActiveFile] = useState('main.ts');
      const [contentWidth, setContentWidth] = useState(400);
      const [explorerWidth, setExplorerWidth] = useState(224);

      const resizingRef = useRef<'content' | 'explorer' | null>(null);
      const startXRef = useRef(0);
      const startWidthRef = useRef(400);

      const isDarkMode = themeMode === 'dark';
      const router = useRouter();

      // 현재 에디터 코드 계산 (useMemo로 메모이제이션)
      const editorCode = useMemo(
        () =>
          editorMode === 'mission'
            ? missionFiles[activeFile] ?? missionFiles['auth.ts']
            : explorationFiles[activeFile] ?? explorationFiles['main.ts'],
        [activeFile, editorMode]
      );

      // 콘텐츠 렌더링
      const renderContent = () => {
        switch (activeTab) {
          case 'design-intent':
            return <DesignIntentSection isDarkMode={isDarkMode} />;
          case 'structure':
            return <StructureSection isDarkMode={isDarkMode} />;
          case 'requirements':
            return <RequirementsSection isDarkMode={isDarkMode} />;
          case 'mission':
            return <MissionSection isDarkMode={isDarkMode} onOpenEditor={openMissionEditor} />;
          case 'interview':
            return <InterviewSection isDarkMode={isDarkMode} />;
          default:
            return <DesignIntentSection isDarkMode={isDarkMode} />;
        }
      };

      const openExplorationEditor = () => {
        setEditorMode('exploration');
        setActiveFile('main.ts');
        setIsEditorOpen(true);
      };

      const openMissionEditor = (fileName = 'auth.ts') => {
        setEditorMode('mission');
        setActiveFile(fileName);
        setIsEditorOpen(true);
      };

      const currentTabs = editorMode === 'mission' ? missionTabs : explorationTabs;

      const handleEditorFileSelect = (fileName: string) => {
        setActiveFile(fileName);
      };

      // ===== Resize 핸들러 =====
      const handleContentResizeStart = useCallback((e: React.MouseEvent) => {
        resizingRef.current = 'content';
        startXRef.current = e.clientX;
        startWidthRef.current = contentWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }, [contentWidth]);

      const handleExplorerResizeStart = useCallback((e: React.MouseEvent) => {
        resizingRef.current = 'explorer';
        startXRef.current = e.clientX;
        startWidthRef.current = explorerWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }, [explorerWidth]);

      useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
          if (!resizingRef.current) return;
          if (resizingRef.current === 'content') {
            setContentWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 300), 700));
          } else if (resizingRef.current === 'explorer') {
            setExplorerWidth(Math.min(Math.max(startWidthRef.current + (e.clientX - startXRef.current), 150), 400));
          }
        };
        const handleMouseUp = () => {
          if (resizingRef.current) {
            resizingRef.current = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }, []);

      const renderLessonSidebar = () => (
        <aside
          className={`w-72 shrink-0 border-l transition-colors duration-300 ${
            isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FAFBFC] border-[#F1F5F9]'
          }`}
        >
          <div className="h-full overflow-y-auto space-y-3 px-4 py-4">
            <div className={`rounded-md border p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                <h3 className={`text-[15px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                  학습 포인트
                </h3>
              </div>
              <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                미션 스텝을 따라가며 JWT 구조를 먼저 이해하고, 검증 로직과 만료 처리까지 이어서 구현합니다.
              </p>
            </div>

            <div className={`rounded-md border p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#7C3AED]" />
                <h3 className={`text-[15px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                  관련 개념 키워드
                </h3>
              </div>
              <ul className={`space-y-1.5 text-[14px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                <li>• header / payload / signature</li>
                <li>• exp 만료 검사</li>
                <li>• HMAC-SHA256</li>
              </ul>
            </div>

            <div className={`rounded-md border p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}>
              <div className="mb-2 flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-[#7C3AED]" />
                <h3 className={`text-[15px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                  참고 레퍼런스
                </h3>
              </div>
              <div className={`space-y-1.5 text-[14px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                <p>• auth.ts 검증 흐름</p>
                <p>• refresh token 갱신 패턴</p>
                <p>• 예외 처리 규칙</p>
              </div>
            </div>
          </div>
        </aside>
      );

      return (
        <div
          className={`flex flex-col h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-[#0F172A]' : 'bg-white'
          }`}
        >
          {/* 헤더 */}
          <Header
            onSettingsClick={() => setIsShowSettings(true)}
            onMemoToggle={() => setIsMemoOpen(!isMemoOpen)}
            isMemoOpen={isMemoOpen}
            isDarkMode={isDarkMode}
          />

          <div className={`border-b px-8 py-4 transition-colors duration-300 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>{templateTitle}</p>
                <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  {template?.category ?? '기능 템플릿'}
                  {templateId != null ? ` · ID ${templateId}` : ''}
                </p>
              </div>
              {template && (
                <div className={`text-xs ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                  난이도 {template.difficulty} · 조회 {template.viewCount.toLocaleString()}회
                </div>
              )}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDarkMode={isDarkMode}
            onMarkComplete={() => {
              // 학습 완료 처리 로직
            }}
          />

          <div className={`relative flex flex-1 min-h-0 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
            {/* 에디터 토글 버튼 (절대 위치, 문법 템플릿 스타일) */}
            <button
              onClick={() => {
                if (isEditorOpen) {
                  setIsEditorOpen(false);
                  return;
                }

                openExplorationEditor();
              }}
              className={`absolute top-14 z-20 flex items-center justify-center px-2 py-3 shadow-sm cursor-pointer group transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-[#1E293B] text-[#A78BFA] hover:text-[#E9D5FF] hover:bg-[#334155]'
                  : 'bg-purple-50 text-purple-500 hover:text-purple-700 hover:bg-purple-100'
              } ${
                isEditorOpen
                  ? `${isDarkMode ? 'border border-l-2 border-t-2 border-b-2 border-r-0 border-[#475569]' : 'border border-l-2 border-t-2 border-b-2 border-r-0 border-purple-200'} rounded-l-lg`
                  : `${isDarkMode ? 'border border-t-2 border-b-2 border-l-2 border-r-0 border-[#475569]' : 'border border-t-2 border-b-2 border-l-2 border-r-0 border-purple-200'} rounded-l-lg`
              }`}
              style={isEditorOpen ? { right: `${contentWidth + 1}px` } : { right: '0px' }}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isEditorOpen ? 'rotate-180' : ''}`} />
              <span className={`absolute whitespace-nowrap text-[11px] font-medium px-2 py-1 rounded-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm ${
                isDarkMode
                  ? 'text-[#94A3B8] bg-[#0F172A] border-[#475569]'
                  : 'text-purple-600 bg-white border-purple-200'
              } ${
                isEditorOpen ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'right-full mr-1.5 top-1/2 -translate-y-1/2'
              }`}>
                {isEditorOpen ? '에디터 닫기' : '에디터 열기'}
              </span>
            </button>

            {isEditorOpen ? (
              <div className="flex flex-1 min-w-0 overflow-hidden relative">
                {/* 좌측 콘텐츠 영역 */}
                <section
                  style={{ width: `${contentWidth}px` }}
                  className={`min-w-0 overflow-y-auto border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}
                >
                  <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                    {renderContent()}
                  </div>
                </section>

                {/* 콘텐츠 리사이즈 핸들 */}
                <div
                  onMouseDown={handleContentResizeStart}
                  className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
                />

                {/* 우측 에디터 영역 */}
                <section className="flex-1 overflow-hidden">
                  <div className="flex h-full min-w-0 overflow-hidden">
                    {/* 파일 탐색기 */}
                    <div
                      style={{ width: `${explorerWidth}px` }}
                      className={`min-w-0 border-r transition-colors duration-300 ${isDarkMode ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}
                    >
                      <FileExplorer
                        isDarkMode={isDarkMode}
                        activeFile={activeFile}
                        files={editorMode === 'mission' ? missionTree : explorationTree}
                        onFileSelect={handleEditorFileSelect}
                      />
                    </div>

                    {/* 파일 탐색기 리사이즈 핸들 */}
                    <div
                      onMouseDown={handleExplorerResizeStart}
                      className={`w-1 bg-gray-200 hover:bg-purple-500 cursor-col-resize transition-colors duration-150 ${isDarkMode ? 'bg-gray-700 hover:bg-purple-400' : ''}`}
                    />

                    {/* 코드 에디터 */}
                    <div className="flex-1 overflow-hidden">
                      <CodeEditor
                        fileName={activeFile}
                        code={editorCode}
                        onCodeChange={() => {}}
                        fileTabs={currentTabs}
                        activeFile={activeFile}
                        onFileSelect={handleEditorFileSelect}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex flex-1 min-w-0 overflow-hidden">
                <section className={`flex-1 min-w-0 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
                  <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                    {renderContent()}
                  </div>
                </section>
                {renderLessonSidebar()}
              </div>
            )}

            {isMemoOpen && (
              <MemoPanel
                isDarkMode={isDarkMode}
                onClose={() => setIsMemoOpen(false)}
              />
            )}
          </div>

      {/* 바텀 네비게이션 */}
      <div
        className={`h-16 border-t transition-colors duration-300 px-6 flex items-center ${
          isDarkMode
            ? 'bg-[#0F172A] border-[#334155]'
            : 'bg-white border-[#F1F5F9]'
        }`}
      >
        <button
          onClick={() => router.push('/functional-template-hub')}
          className={`flex items-center gap-2 p-2 rounded transition-colors duration-300 ${
            isDarkMode
              ? 'text-[#94A3B8] hover:bg-[#334155]'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            뒤로가기
          </span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <button
            aria-label="이전 레슨"
            className={`p-1 rounded transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            01. 인증의 기초
          </span>

          <span
            className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            |
          </span>

          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            03. Refresh Token 구현
          </span>

          <button
            aria-label="다음 레슨"
            className={`p-1 rounded transition-colors duration-300 ${
              isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 설정 모달 */}
      {isShowSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          isAiGuruHintMode={isAiGuruHintMode}
          onAiGuruHintModeChange={setIsAiGuruHintMode}
          onClose={() => setIsShowSettings(false)}
        />
      )}
    </div>
  );
}