import { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { RECOMMENDED_STACKS, LOADING_STEPS } from '@/features/functional-template-hub/Constants';
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
      alert('학습하고 싶은 기술 스택을 입력해주세요.');
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
        @keyframes fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade {
          animation: fade 0.8s ease-in-out;
        }
      `}</style>

      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative">
        {/* 헤더 */}
        <div className="flex items-start gap-4 mb-12">
          <div className="p-3 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              원하는 학습 주제가 없나요?
            </h2>
            <p className="text-gray-600 mt-1 text-base">
              AI에게 요청하면 맞춤형 실습 환경을 만들어드립니다
            </p>
          </div>
        </div>

        {/* 입력 + 태그 한 줄 레이아웃 */}
        <div className="space-y-3">
          {/* 입력창 */}
          <div className="relative flex gap-3 items-center">
            <div className="flex-1 relative">
              <Sparkles size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-600" />
              <input
                type="text"
                placeholder="기술 스택을 입력하세요... (예: Next.js + Prisma)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleGenerate();
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-white/70 border border-purple-200 hover:border-purple-400 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent rounded-lg transition-all text-base font-medium backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  생성하기
                </>
              )}
            </button>
          </div>

          {/* 추천 태그 */}
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">추천:</span>
            {RECOMMENDED_STACKS.map((stack) => (
              <button
                key={stack.value}
                onClick={() => handleTagClick(stack.value)}
                className="px-3 py-1.5 bg-white/60 hover:bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-700 text-xs font-medium rounded-full transition-all hover:shadow-md"
              >
                {stack.label}
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