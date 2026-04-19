"use client";

import { GrammarLeftSidebar } from '@/features/grammar-template/components/GrammarLeftSidebar';
import { GrammarRightSidebar } from '@/features/grammar-template/components/GrammarRightSidebar';
import { GrammarCodeEditor } from '@/features/grammar-template/components/GrammarCodeEditor';
import { GrammarVisualizationPanel } from '@/features/grammar-template/components/GrammarVisualizationPanel';
import { useGrammarPlayer } from '@/hooks/useGrammarPlayer';

export default function GrammarTemplateDetail() {
  const currentTopic = 'loops';
  const { playerState, play, pause, reset, nextStep, prevStep, setSpeed } =
    useGrammarPlayer();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs text-gray-500">
              Python으로 변수 선언부터 반복문까지
            </p>
            <h1 className="text-2xl font-bold text-gray-900">흐름을 먼저 익힌다</h1>
          </div>
          <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600">
            언어 다시 선택
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GrammarLeftSidebar currentTopic={currentTopic} />

        <main className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
          <div className="min-h-0 flex-1">
            <GrammarCodeEditor currentLine={playerState.currentStep + 2} />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
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

        <GrammarRightSidebar />
      </div>
    </div>
  );
}
