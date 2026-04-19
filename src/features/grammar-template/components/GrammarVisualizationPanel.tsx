interface GrammarVisualizationPanelProps {
  currentStep?: number;
  totalSteps?: number;
  isPlaying?: boolean;
  speed?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSpeedChange?: (speed: number) => void;
}

export function GrammarVisualizationPanel({
  currentStep = 2,
  totalSteps = 4,
}: GrammarVisualizationPanelProps) {
  const variables = [
    { name: 'total', value: '10', type: 'int' },
    { name: 'values', value: '[3, 7, 2, 5]', type: 'list' },
    { name: 'value', value: '7', type: 'int' },
  ];

  const output = [
    'Current: 3, Total: 3',
    'Current: 7, Total: 10',
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 border-b border-gray-200 p-3">
        <h3 className="mb-2 text-xs font-bold text-gray-900">변수 상태</h3>
        <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-xs"
            >
              <div>
                <span className="text-gray-600">{variable.name}</span>
                <span className="text-gray-400 ml-2">({variable.type})</span>
              </div>
              <span className="font-mono font-bold text-blue-600">{variable.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex flex-1 flex-col border-b border-gray-200 p-3">
        <h3 className="mb-2 shrink-0 text-xs font-bold text-gray-900">출력 결과</h3>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg bg-gray-900 p-2.5 font-mono text-[11px] text-green-400">
          {output.map((line, idx) => (
            <div key={idx} className="mb-1 last:mb-0">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-3">
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">진행률</span>
            <span className="text-xs font-bold text-gray-900">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-300">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}