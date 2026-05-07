import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* 왼쪽: 텍스트 */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI 기반 템플릿 생성
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              직접 만드는
              <br />
              <span className="text-purple-600">맞춤형 학습</span> 템플릿
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-lg mx-auto md:mx-0">
              React, Vue, Spring 등 실무 기술을 템플릿을 통해 학습하세요.
              <br />
              원하는 내용이 없다면 AI가 직접 만들어 드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/grammar-template"
                className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition cursor-pointer inline-flex items-center justify-center gap-2"
              >
                템플릿 둘러보기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition cursor-pointer inline-flex items-center justify-center gap-2"
              >
                사용 방법 보기
              </Link>
            </div>
          </div>

          {/* 오른쪽: 일러스트 */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl p-8 md:p-10 max-w-md mx-auto">
              <div className="space-y-3">
                {/* 더미 코드 블록 */}
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
                  <div className="flex gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-24 bg-purple-200 rounded" />
                    <div className="h-2 w-32 bg-purple-300 rounded" />
                    <div className="h-2 w-20 bg-purple-200 rounded" />
                    <div className="h-2 w-40 bg-purple-300 rounded" />
                  </div>
                </div>
                {/* 더미 템플릿 카드 */}
                <div className="flex gap-2">
                  <div className="bg-white/80 backdrop-blur rounded-lg p-3 flex-1 shadow-sm">
                    <div className="h-2 w-16 bg-purple-300 rounded mb-2" />
                    <div className="h-2 w-12 bg-gray-200 rounded" />
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-lg p-3 flex-1 shadow-sm">
                    <div className="h-2 w-16 bg-indigo-300 rounded mb-2" />
                    <div className="h-2 w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
