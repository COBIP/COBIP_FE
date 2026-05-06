import { LOADING_STEPS } from '@/features/functional-template-hub/Constants';

interface LoadingStateProps {
  currentStep: number;
}

export function LoadingState({ currentStep }: LoadingStateProps) {
  return (
    <div className="mt-6 space-y-3 pt-4">
      {/* 프로그레스 바 */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* 로딩 메시지 */}
      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
        <div className="w-2 h-2 bg-linear-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
        <p className="text-sm text-gray-700 font-medium">
          <span className="animate-fade">{LOADING_STEPS[currentStep]}</span>
        </p>
      </div>
    </div>
  );
}