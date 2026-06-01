import { LOADING_STEPS } from '@/features/functional-template-hub/Constants';

interface LoadingStateProps {
  currentStep: number;
}

export function LoadingState({ currentStep }: LoadingStateProps) {
  return (
    <div className="mt-6 space-y-3 pt-4">
      {/* 프로그레스 바 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="h-full rounded-full bg-[#7C3AED] transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* 로딩 메시지 */}
      <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#7C3AED]" />
        <p className="text-sm font-medium text-[#475569]">
          <span className="animate-fade">{LOADING_STEPS[currentStep]}</span>
        </p>
      </div>
    </div>
  );
}
