'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, Sparkles, Zap } from 'lucide-react';
import { RECOMMENDED_FEATURES, LOADING_STEPS } from '@/features/functional-template-hub/Constants';
import { LoadingState } from '@/features/functional-template-hub/components/LoadingState';
import type { AiFeatureTemplateDifficulty, AiFeatureTemplateGenerateRequest } from '@/api/services/AiService';

interface AISectionProps {
  onGenerate: (request: AiFeatureTemplateGenerateRequest) => Promise<void>;
}

const difficultyOptions: Array<{ value: AiFeatureTemplateDifficulty; label: string }> = [
  { value: 'beginner', label: '입문' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

export function AISection({ onGenerate }: AISectionProps) {
  const [featureName, setFeatureName] = useState('');
  const [language, setLanguage] = useState('java');
  const [framework, setFramework] = useState('spring-boot');
  const [techStack, setTechStack] = useState('Spring Boot, Spring Security, JWT');
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

    try {
      setError(null);
      setIsLoading(true);
      setCurrentLoadingStep(0);

      await onGenerate({
        featureName: nextFeatureName,
        language: language.trim() || 'java',
        framework: framework.trim() || null,
        techStack: techStack
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
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
    <section className="relative mb-20 py-8">
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 animate-blob rounded-full bg-purple-300 opacity-15 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 animate-blob rounded-full bg-blue-300 opacity-15 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mb-5 flex items-start gap-4">
          <div className="rounded-lg bg-purple-100 p-3">
            <BrainCircuit size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">원하는 학습 주제가 있나요?</h2>
            <p className="mt-1 text-sm text-gray-500">
              구현하고 싶은 기능과 기술 스택을 입력하면 AI가 기능 템플릿 초안을 생성합니다.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-[1fr_9rem_11rem_14rem_8rem_auto]">
            <div className="relative">
              <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
              <input
                type="text"
                placeholder="예: JWT 로그인, Redis 기반 장바구니, OAuth 소셜 로그인"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) void handleGenerate();
                }}
                className="w-full rounded-full border border-purple-200 bg-white py-3 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 transition focus:ring-2 focus:ring-purple-200 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              placeholder="java"
              disabled={isLoading}
            />

            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              placeholder="spring-boot"
              disabled={isLoading}
            />

            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              placeholder="Spring Boot, JWT"
              disabled={isLoading}
            />

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as AiFeatureTemplateDifficulty)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-purple-200 focus:outline-none"
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
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">추천 주제:</span>
            {RECOMMENDED_FEATURES.map((feature) => (
              <button
                key={feature.value}
                type="button"
                onClick={() => handleTagClick(feature.value)}
                className="rounded-full border border-purple-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-purple-700 transition-all hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
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
