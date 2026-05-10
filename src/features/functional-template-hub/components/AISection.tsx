'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, BrainCircuit } from 'lucide-react'; 
import { RECOMMENDED_FEATURES, LOADING_STEPS } from '@/features/functional-template-hub/Constants';
import { LoadingState } from '@/features/functional-template-hub/components/LoadingState';

interface AISectionProps {
  onGenerate: (input: string) => void;
}

export function AISection({ onGenerate }: AISectionProps) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);

  // 로딩 스텝 애니메이션
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 생성 핸들러
  const handleGenerate = async () => {
    if (!userInput.trim()) {
      alert('구현하고 싶은 기능을 입력해주세요.'); 
      return;
    }

    setIsLoading(true);
    setCurrentLoadingStep(0);
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      onGenerate(userInput);
    }, 3200);
  };

  // 추천 태그 클릭
  const handleTagClick = (value: string) => {
    setUserInput(value);
  };

  return (
    <section className="mb-20 relative py-8">
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>

      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
      </div>

      {/* 콘텐츠 (박스 없이 배경 위에 자연스럽게 노출) */}
      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BrainCircuit size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">원하는 학습 주제가 없나요?</h2>
            <p className="text-sm text-gray-500 mt-1">사용하실 기술 스택과 학습하고 싶은 로직을 입력하면 AI가 맞춤형 환경을 설계해드립니다.</p>
          </div>
        </div>

        {/* 입력 + 태그 레이아웃 */}
        <div className="space-y-3">
          <div className="relative flex gap-3 items-center">
            <div className="flex-1 relative">
              <Sparkles size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
              <input
                type="text"
                placeholder="구현하고 싶은 기능을 입력하세요... (예: Redis 기반 실시간 재고 관리)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleGenerate();
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-white border border-purple-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded-full transition text-sm"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  설계 중...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  생성하기
                </>
              )}
            </button>
          </div>

          {/* 추천 태그: RECOMMENDED_FEATURES 사용 */}
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">추천 로직:</span>
            {RECOMMENDED_FEATURES.map((feature) => (
              <button
                key={feature.value}
                onClick={() => handleTagClick(feature.value)}
                className="px-3 py-1.5 bg-white/60 hover:bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-700 text-xs font-medium rounded-full transition-all hover:shadow-md"
              >
                {feature.label}
              </button>
            ))}
          </div>

          {/* 로딩 상태 */}
          {isLoading && <LoadingState currentStep={currentLoadingStep} />}
        </div>
      </div>
    </section>
  );
}