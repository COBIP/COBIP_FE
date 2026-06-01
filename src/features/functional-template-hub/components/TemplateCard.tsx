import { ArrowRight, Lock } from 'lucide-react';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'ready' | 'coming-soon';
  tags: string[];
  duration: string;
  onClick: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  icon,
  status,
  tags,
  duration,
  onClick,
}: TemplateCardProps) {
  const isReady = status === 'ready';
  const isClickable = isReady;

  return (
    <button
      type="button"
      onClick={() => isClickable && onClick(id)}
      className={`group w-full text-left ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className={`relative min-h-[17rem] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white transition-all duration-200 ${
        isReady ? 'hover:border-[#C4B5FD] hover:shadow-sm' : 'opacity-75'
      }`}>
        {/* 준비 중 오버레이 */}
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70">
            <div className="text-center">
              <Lock size={24} className="mx-auto mb-1 text-[#94A3B8]" />
              <p className="text-xs font-semibold text-[#64748B]">준비 중</p>
            </div>
          </div>
        )}
        {/* 상단 컬러 바 */}
        <div className={`h-1 ${isReady ? 'bg-[#7C3AED]' : 'bg-[#E2E8F0]'}`} />

        <div className="flex min-h-[16.75rem] flex-col p-5">
          {/* 헤더: 아이콘 + 상태 배지 */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC] text-lg">
              {icon}
            </div>

            <span className={`inline-flex h-8 items-center rounded-lg border px-2 text-xs font-semibold ${
              isReady ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B]'
            }`}>
              {isReady ? '준비 완료' : '준비 중'}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="mb-2 text-lg font-bold leading-7 text-[#1E293B]">{title}</h3>
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#64748B]">{description}</p>

          {/* 토픽 태그 */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-lg border border-[#EDE9FE] bg-[#F5F3FF] px-2 py-1 text-xs font-medium text-[#6D28D9]">
                {tag}
              </span>
            ))}
          </div>

          {/* 푸터 */}
          <div className="mt-auto flex items-center justify-between border-t border-[#F1F5F9] pt-4">
            <span className="text-xs font-medium text-[#64748B]">예상 {duration}</span>
            {isReady ? (
              <ArrowRight size={16} className="text-[#7C3AED]" />
            ) : (
              <Lock size={16} className="text-[#94A3B8]" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
