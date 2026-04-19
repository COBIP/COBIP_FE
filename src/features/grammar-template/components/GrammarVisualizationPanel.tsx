import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

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
  isPlaying = false,
  speed = 1,
  onPlay = () => {},
  onPause = () => {},
  onReset = () => {},
  onNext = () => {},
  onPrev = () => {},
  onSpeedChange = () => {},
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
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* 변수 상태 */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">변수 상태</h3>
        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-3 text-sm"
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

      {/* 출력 결과 */}
      <div className="border-b border-gray-200 p-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-900 mb-3">출력 결과</h3>
        <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 space-y-1">
          {output.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>

      {/* 플레이어 컨트롤러 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">진행률</span>
            <span className="text-xs font-bold text-gray-900">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={onReset}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            title="초기화"
          >
            <RotateCcw size={18} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="이전 단계"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white"
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="다음 단계"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          </div>

          {/* 배속 선택 */}
          <select
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}