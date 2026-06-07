'use client';

import { ArrowRight } from 'lucide-react';
import type { TemplateNextRecommendationApiResponse } from '@/api/services/FunctionalTemplateService';

interface NextRecommendationSectionProps {
  recommendations?: TemplateNextRecommendationApiResponse[];
  isDarkMode?: boolean;
}

export function NextRecommendationSection({
  recommendations,
  isDarkMode = false,
}: NextRecommendationSectionProps) {
  const sortedRecommendations = [...(recommendations ?? [])]
    .filter((recommendation) => recommendation.featureName || recommendation.reason || recommendation.expectedLearning)
    .sort((left, right) => (left.priority ?? 0) - (right.priority ?? 0));

  if (sortedRecommendations.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
          다음 추천
        </h2>
        <div
          className={`rounded-md border p-8 text-center ${
            isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          아직 연결된 다음 추천 학습이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
          다음 추천
        </h2>
        <p className={`mt-2 text-sm leading-6 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
          현재 템플릿 다음에 이어서 학습하면 좋은 기능입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sortedRecommendations.map((recommendation, index) => (
          <article
            key={`${recommendation.featureName}-${index}`}
            className={`rounded-md border p-5 ${
              isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-violet-600">추천 {recommendation.priority || index + 1}</p>
                <h3 className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                  {recommendation.featureName}
                </h3>
              </div>
              <ArrowRight className="mt-1 shrink-0 text-violet-500" size={22} />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>추천 이유</h4>
                <p className={`mt-1 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {recommendation.reason || '추천 이유가 없습니다.'}
                </p>
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>기대 학습</h4>
                <p className={`mt-1 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {recommendation.expectedLearning || '기대 학습 내용이 없습니다.'}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
