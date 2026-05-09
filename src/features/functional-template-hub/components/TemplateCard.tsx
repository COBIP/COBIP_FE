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
    <div
      onClick={() => isClickable && onClick(id)}
      className={`group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ${
        isReady ? 'hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 hover:-translate-y-0.5' : 'opacity-75'
      }`}>
        {/* 준비 중 오버레이 */}
        {!isReady && (
          <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <Lock size={24} className="text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-500">준비 중</p>
            </div>
          </div>
        )}
        {/* 상단 컬러 바 */}
        <div className={`h-1 ${isReady ? 'bg-gradient-to-r from-purple-400 to-blue-400' : 'bg-gray-100'}`} />

        <div className="p-4">
          {/* 헤더: 아이콘 + 상태 배지 */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
              {icon}
            </div>

            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
              isReady ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {isReady ? '준비 완료' : '준비 중'}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>

          {/* 토픽 태그 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded-md border border-purple-100">
                {tag}
              </span>
            ))}
          </div>

          {/* 푸터 */}
          <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">⏱️ {duration}</span>
            {isReady ? (
              <ArrowRight size={16} className="text-purple-600" />
            ) : (
              <Lock size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}