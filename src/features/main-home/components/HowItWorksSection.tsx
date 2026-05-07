import { Search, Sparkles, BookOpen } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            이렇게 사용해보세요
          </h2>
          <p className="text-gray-500 text-lg">단 3단계로 나만의 학습을 시작할 수 있어요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-purple-600" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">템플릿 선택</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              문법 템플릿이나 기능 템플릿 중<br />
              원하는 학습 주제를 선택하세요
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-indigo-600" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI 생성 또는 직접 선택</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              원하는 템플릿이 없다면 AI에게<br />
              직접 요청해서 만들 수 있어요
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-7 h-7 text-amber-600" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">학습 & 미션 풀이</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              설계 의도부터 소스 코드, 미션까지<br />
              단계별로 학습해보세요
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
