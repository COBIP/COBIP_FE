interface LoadingStateProps {
  label: string;
  progress: number;
  step?: string;
  status?: string;
}

export function LoadingState({ label, progress, step, status }: LoadingStateProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="mt-6 space-y-3 pt-4">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#64748B]">
        <span>{step ? `현재 단계: ${step}` : 'AI 생성 진행 중'}</span>
        <span>{Math.round(normalizedProgress)}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="h-full rounded-full bg-[#7C3AED] transition-all duration-500"
          style={{
            width: `${normalizedProgress}%`,
          }}
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#7C3AED]" />
        <div>
          <p className="text-sm font-medium text-[#475569]">{label}</p>
          {status ? <p className="mt-0.5 text-xs text-[#94A3B8]">{status}</p> : null}
        </div>
      </div>
    </div>
  );
}
