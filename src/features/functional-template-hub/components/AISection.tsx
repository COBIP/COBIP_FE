'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, Sparkles, Zap } from 'lucide-react';
import { RECOMMENDED_FEATURES, LOADING_STEPS } from '@/features/functional-template-hub/Constants';
import { LoadingState } from '@/features/functional-template-hub/components/LoadingState';
import {
  formatFeatureTemplateFramework,
  type AiFeatureTemplateDifficulty,
  type AiFeatureTemplateGenerateRequest,
} from '@/api/services/AiService';

interface AISectionProps {
  onGenerate: (request: AiFeatureTemplateGenerateRequest) => Promise<void>;
}

const difficultyOptions: Array<{ value: AiFeatureTemplateDifficulty; label: string }> = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

function buildTechStack(language: string, framework: string) {
  return Array.from(
    new Set([framework.trim(), language.trim()].filter(Boolean)),
  );
}

export function AISection({ onGenerate }: AISectionProps) {
  const [featureName, setFeatureName] = useState('');
  const [language, setLanguage] = useState('java');
  const [framework, setFramework] = useState('Spring Boot');
  const [level, setLevel] = useState<AiFeatureTemplateDifficulty>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    const nextFeatureName = featureName.trim();

    if (!nextFeatureName) {
      setError('생성할 기능 이름이나 학습 주제를 입력해 주세요.');
      return;
    }

    const nextLanguage = language.trim() || 'java';
    const nextFramework = formatFeatureTemplateFramework(framework);

    try {
      setError(null);
      setIsLoading(true);
      setCurrentLoadingStep(0);

      await onGenerate({
        featureName: nextFeatureName,
        language: nextLanguage,
        framework: nextFramework,
        techStack: buildTechStack(nextLanguage, nextFramework),
        level,
        difficulty: level,
        includeCode: true,
        includeMissions: true,
        includeInterview: true,
        referenceContext: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 템플릿 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (value: string) => {
    setFeatureName(value);
  };

  return (
    <section className="py-4">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-5 flex items-start gap-4">
          <div className="rounded-lg bg-[#EDE9FE] p-3">
            <BrainCircuit size={20} className="text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">원하는 학습 주제가 있나요?</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              구현하고 싶은 기능과 기본 기술 정보를 입력하면 AI가 기능 템플릿 초안을 생성합니다.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_9rem_11rem_8rem_auto]">
            <div className="relative">
              <Sparkles size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#7C3AED]" />
              <input
                type="text"
                placeholder="예: JWT 로그인, Redis 기반 장바구니, OAuth 소셜 로그인"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) void handleGenerate();
                }}
                className="h-12 w-full rounded-lg border border-[#DDD6FE] bg-white pr-4 pl-10 text-sm text-[#1E293B] transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#1E293B] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
              placeholder="java"
              disabled={isLoading}
            />

            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#1E293B] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
              placeholder="Spring Boot"
              disabled={isLoading}
            />

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as AiFeatureTemplateDifficulty)}
              className="h-12 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#1E293B] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
              disabled={isLoading}
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isLoading}
              className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#7C3AED] px-6 font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  생성 중
                </>
              ) : (
                <>
                  <Zap size={18} />
                  생성하기
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold tracking-wider text-[#64748B] uppercase">추천 주제:</span>
            {RECOMMENDED_FEATURES.map((feature) => (
              <button
                key={feature.value}
                type="button"
                onClick={() => handleTagClick(feature.value)}
                className="h-8 rounded-lg border border-[#DDD6FE] bg-white px-3 text-xs font-medium text-[#6D28D9] transition hover:border-[#7C3AED] hover:bg-[#F5F3FF]"
              >
                {feature.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && <LoadingState currentStep={currentLoadingStep} />}
        </div>
      </div>
    </section>
  );
}
