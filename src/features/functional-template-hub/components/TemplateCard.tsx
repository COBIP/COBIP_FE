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
      className={`group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
    >
      <div className={`h-full bg-white rounded-2xl p-6 border border-gray-200 backdrop-blur-sm transition-all duration-300 ${
        isReady
          ? 'hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200/50 hover:-translate-y-1'
          : 'relative'
      }`}>
        {/* 준비 중 오버레이 */}
        {!isReady && (
          <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Lock size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">준비 중</p>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${
            isReady
              ? 'bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200'
              : 'bg-gradient-to-br from-gray-100 to-gray-100'
          } transition`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isReady
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isReady ? '준비 완료' : '준비 중'}
          </span>
        </div>

        {/* 제목 및 설명 */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">⏱️ {duration}</span>
          {isReady ? (
            <ArrowRight
              size={18}
              className="text-purple-600 group-hover:translate-x-1 transition"
            />
          ) : (
            <Lock size={18} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}