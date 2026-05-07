import { BookOpen, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export function QuickLinksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">바로 학습하러 가기</h2>
        <p className="text-gray-500 mb-10">원하는 템플릿 유형을 선택하세요</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/grammar-template"
            className="inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-purple-700 transition cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            문법 템플릿 바로가기
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/functional-template"
            className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            <Layers className="w-5 h-5" />
            기능 템플릿 바로가기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
