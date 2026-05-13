import { Lock } from 'lucide-react';
import type { GrammarTemplateData } from '@/features/grammar-template/Constants';

interface GrammarTemplateCardProps {
  template: GrammarTemplateData;
  onClick: (id: string) => void;
}

const BADGE_STYLES: Record<string, string> = {
  인기: 'bg-orange-50 text-orange-600 border-orange-200',
  추천: 'bg-blue-50 text-blue-600 border-blue-200',
  신규: 'bg-green-50 text-green-600 border-green-200',
};

export function GrammarTemplateCard({ template, onClick }: GrammarTemplateCardProps) {
  const isReady = template.status === 'ready';

  return (
    <div
      onClick={() => isReady && onClick(template.id)}
      className={`group ${isReady ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ${
        isReady
          ? 'hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 hover:-translate-y-0.5'
          : 'relative opacity-75'
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
        <div className={`h-2 bg-gradient-to-r ${template.color}`} />

        <div className="p-4">
          {/* 헤더: 아이콘 + 배지 */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
              {template.icon}
            </div>
            {isReady && template.badge && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${BADGE_STYLES[template.badge] || ''}`}>
                {template.badge}
              </span>
            )}
            {!isReady && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                준비 중
              </span>
            )}
          </div>

          {/* 제목 */}
          <h3 className="text-sm font-bold text-gray-900 mb-1">{template.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.description}</p>

          {/* 학습 주제 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.topics.map((topic: string) => (
              <span
                key={topic}
                className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded-md border border-purple-100"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* 푸터 */}
          <div className="pt-2.5 border-t border-gray-50" />
        </div>
      </div>
    </div>
  );
}
