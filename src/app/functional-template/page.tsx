"use client";

import { FunctionalTemplateSidebar } from '@/features/functional-template/components/FunctionalTemplateSidebar';
import { DesignIntentSection } from '@/features/functional-template/components/DesignIntentSection';
import { SourceCodeSection } from '@/features/functional-template/components/SourceCodeSection';
import { MissionSection } from '@/features/functional-template/components/MissionSection';
import { RequirementsSection } from '@/features/functional-template/components/RequirementsSection';
import { StructureSection } from '@/features/functional-template/components/StructureSection';
import { InterviewSection } from '@/features/functional-template/components/InterviewSection';
import { useTemplateMenu } from '@/hooks/useTemplateMenu';

export default function GrammarTemplateDetail() {
  const [currentTopic, setCurrentTopic] = useState('loops');
  const { playerState, play, pause, reset, nextStep, prevStep, setSpeed } =
    useGrammarPlayer();

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Python으로 변수 선언부터 반복문까지
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              흐름을 먼저 익힌다
            </h1>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">
            언어 다시 선택
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 - 3 컬럼 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <GrammarLeftSidebar currentTopic={currentTopic} />

        {/* 중앙 콘텐츠 */}
        <main className="flex-1 flex flex-col overflow-hidden px-6 py-6 gap-6">
          {/* 코드 에디터 - 50% */}
          <div className="flex-1 min-h-0">
            <GrammarCodeEditor currentLine={playerState.currentStep + 2} />
          </div>

          {/* 시각화 패널 - 50% (내부 스크롤) */}
          <div className="flex-1 min-h-0">
            <GrammarVisualizationPanel
              currentStep={playerState.currentStep}
              totalSteps={4}
              isPlaying={playerState.isPlaying}
              speed={playerState.speed}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onNext={nextStep}
              onPrev={prevStep}
              onSpeedChange={setSpeed}
            />
          </div>
        </main>

        {/* 우측 사이드바 */}
        <GrammarRightSidebar />
      </div>
    </div>
  );
}