import { useState } from 'react';

interface Variable {
  name: string;
  value: string | number;
  type: string;
}

interface ArrayItem {
  index: number;
  value: string | number;
}

interface GrammarVisualizationPanelProps {
  currentStep?: number;
  totalSteps?: number;
  stepDescription?: string;
  variables?: Variable[];
  arrayValues?: ArrayItem[];
  currentIndex?: number;
  outputLines?: string[];
}

export function GrammarVisualizationPanel({
  currentStep = 2,
  totalSteps = 4,
  stepDescription = '두 번째 원소 7로 넘어간다',
  variables = [
    { name: 'total', value: 4, type: 'number' },
    { name: 'value', value: 4, type: 'number' },
  ],
  arrayValues = [
    { index: 0, value: 3 },
    { index: 1, value: 7 },
    { index: 2, value: 2 },
    { index: 3, value: 5 },
  ],
  currentIndex = 1,
  outputLines = ['Current: 7, Total: 4'],
}: GrammarVisualizationPanelProps) {
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">현재 단계:</span> {stepDescription}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-bold text-gray-900">변수 상태</h3>
        <div className="grid grid-cols-2 gap-4">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="rounded-lg border border-gray-200 bg-gray-50 p-6"
            >
              <p className="mb-3 text-sm text-gray-600">{variable.name}</p>
              <p className="mb-2 text-4xl font-bold text-blue-600">{variable.value}</p>
              <p className="text-sm text-gray-500">{variable.type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-bold text-gray-900">배열 상태</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {arrayValues.map((item) => (
            <div
              key={item.index}
              className={`rounded-lg border-2 p-6 text-center transition ${
                currentIndex === item.index
                  ? 'border-blue-600 bg-blue-500 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              <p className="mb-3 text-sm font-semibold">values[{item.index}]</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">출력 결과</h3>
        <div className="min-h-32 rounded-lg bg-gray-900 p-6 font-mono text-sm text-green-400">
          {outputLines.map((line, idx) => (
            <div key={`${line}-${idx}`}>{line}</div>
          ))}
          <div className="mt-4 text-gray-500">{'>'} 프로그램 실행 중...</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-bold text-gray-900">플레이어</h3>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">진행률</span>
            <span className="text-sm font-bold text-gray-900">
              STEP {currentStep}/{totalSteps}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-300">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 transition hover:bg-gray-200"
          >
            ⏮
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition hover:bg-blue-600"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 transition hover:bg-gray-200">
            ⏭
          </button>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">배속</p>
          <div className="flex gap-2">
            {[0.5, 1.0, 1.5].map((selectedSpeed) => (
              <button
                key={selectedSpeed}
                onClick={() => setSpeed(selectedSpeed)}
                className={`flex-1 rounded-lg py-3 text-sm font-semibold transition ${
                  speed === selectedSpeed
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedSpeed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}