import { useMemo } from 'react';
import type { ExecutionFlowStep } from '@/features/grammar-template/Constants';

interface ExecutionFlowPanelProps {
  steps: ExecutionFlowStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

/** eventType별 아이콘/색상 */
const EVENT_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  OUTPUT:     { icon: '📤', color: 'text-green-700',   bg: 'bg-green-50' },
  CONDITION:  { icon: '🔀', color: 'text-amber-700',   bg: 'bg-amber-50' },
  LOOP:       { icon: '🔁', color: 'text-blue-700',    bg: 'bg-blue-50' },
  FUNCTION:   { icon: '⚙️', color: 'text-purple-700',  bg: 'bg-purple-50' },
  ASSIGNMENT: { icon: '📦', color: 'text-cyan-700',    bg: 'bg-cyan-50' },
  LINE:       { icon: '➡️', color: 'text-gray-600',    bg: 'bg-gray-50' },
};

/** 실행흐름 한 스텝을 시각화한 카드 */
function FlowStepCard({
  step,
  index,
  isActive,
  isLast,
  onClick,
}: {
  step: ExecutionFlowStep;
  index: number;
  isActive: boolean;
  isLast: boolean;
  onClick: () => void;
}) {
  const style = EVENT_STYLE[step.eventType] ?? EVENT_STYLE.LINE;

  return (
    <div className="relative flex items-start gap-3">
      {/* 타임라인 연결선 */}
      {!isLast && (
        <div className="absolute left-[17px] top-7 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* 순서 원형 아이콘 */}
      <div
        className={`relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm shadow-sm transition-all duration-200 cursor-pointer ${
          isActive
            ? 'ring-2 ring-purple-400 ring-offset-2 scale-110'
            : 'hover:ring-1 hover:ring-gray-300'
        } ${style.bg}`}
        onClick={onClick}
        title={`${step.eventType}: ${step.description}`}
      >
        {style.icon}
      </div>

      {/* 내용 */}
      <div
        className={`flex-1 rounded-lg border p-2.5 transition-all duration-200 cursor-pointer ${
          isActive
            ? 'border-purple-300 bg-purple-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${style.color}`}>
            {step.eventType}
          </span>
          <span className="text-[10px] text-gray-400">#{step.stepOrder}</span>
        </div>
        <code className="mt-1 block text-xs font-mono text-gray-800 break-all">
          {step.sourceLine}
        </code>
        <p className="mt-0.5 text-[10px] text-gray-500">{step.description}</p>
      </div>
    </div>
  );
}

/** 실행흐름 패널 */
export function ExecutionFlowPanel({
  steps,
  currentStepIndex,
  onStepClick,
}: ExecutionFlowPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">🔍</span>
          <span className="text-sm font-semibold text-gray-800">실행흐름</span>
          <span className="text-[10px] text-gray-400 font-mono">
            {steps.length} steps
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {steps.map((step, i) => (
          <FlowStepCard
            key={step.stepOrder}
            step={step}
            index={i}
            isActive={i === currentStepIndex}
            isLast={i === steps.length - 1}
            onClick={() => onStepClick(i)}
          />
        ))}
      </div>
    </div>
  );
}
