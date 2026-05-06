'use client';

import { useState, useMemo } from 'react';
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

type EditorMode = 'exploration' | 'mission';

type FileTreeItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeItem[];
};

const explorationTree: FileTreeItem[] = [
  {
    id: 'explore-src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'main-ts', name: 'main.ts', type: 'file' },
      { id: 'utils-ts', name: 'utils.ts', type: 'file' },
      { id: 'config-json', name: 'config.json', type: 'file' },
    ],
  },
];

const missionTree: FileTreeItem[] = [
  {
    id: 'mission-src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'mission1-ts', name: 'mission1.ts', type: 'file' },
      { id: 'mission2-ts', name: 'mission2.ts', type: 'file' },
      { id: 'auth-ts', name: 'auth.ts', type: 'file' },
      { id: 'mission4-ts', name: 'mission4.ts', type: 'file' },
      { id: 'utils-ts-mission', name: 'utils.ts', type: 'file' },
      { id: 'config-json-mission', name: 'config.json', type: 'file' },
    ],
  },
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
    }

    export function FunctionalTemplateLayout({}: FunctionalTemplateLayoutProps) {
      // 상태 관리
      const [activeTab, setActiveTab] = useState('design-intent');
      const [isEditorOpen, setIsEditorOpen] = useState(false);
      const [isMemoOpen, setIsMemoOpen] = useState(false);
      const [isShowSettings, setIsShowSettings] = useState(false);
      const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
      const [isAiGuruHintMode, setIsAiGuruHintMode] = useState(true);
      const [editorMode, setEditorMode] = useState<EditorMode>('exploration');
      const [activeFile, setActiveFile] = useState('main.ts');

      const isDarkMode = themeMode === 'dark';

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
            onEditorToggle={() => {
              if (isEditorOpen) {
                setIsEditorOpen(false);
                return;
              }

              openExplorationEditor();
            }}
            isMemoOpen={isMemoOpen}
            isEditorOpen={isEditorOpen}
            isDarkMode={isDarkMode}
          />

          {/* 탭 네비게이션 */}
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDarkMode={isDarkMode}
          />

          <div className={`relative flex flex-1 min-h-0 overflow-hidden ${isMemoOpen ? 'pr-80' : ''}`}>
            {isEditorOpen ? (
              <div className="grid flex-1 min-w-0 overflow-hidden grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
                <section className={`min-w-0 overflow-y-auto border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#F1F5F9]'}`}>
                  <div className="mx-auto max-w-200 px-5 py-5 lg:px-6 lg:py-6">
                    {renderContent()}
                  </div>
                </section>
                <section className="min-w-0 overflow-hidden">
                  <div className="grid h-full min-w-0 grid-cols-[14rem_minmax(0,1fr)] overflow-hidden">
                    <FileExplorer
                      isDarkMode={isDarkMode}
                      activeFile={activeFile}
                      files={editorMode === 'mission' ? missionTree : explorationTree}
                      onFileSelect={handleEditorFileSelect}
                    />
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
        className={`h-16 border-t transition-colors duration-300 px-6 flex items-center justify-between ${
          isDarkMode
            ? 'bg-[#0F172A] border-[#334155]'
            : 'bg-white border-[#F1F5F9]'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded transition-colors duration-300 ${
              isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
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
            className={`p-2 rounded transition-colors duration-300 ${
              isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
        }`}>
          레슨 완료
        </button>
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
