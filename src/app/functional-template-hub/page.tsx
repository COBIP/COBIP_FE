"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/features/main-home/components/Header';
import { Search } from 'lucide-react';
import {
  AISection,
  TemplateGrid,
  InfoSection,
} from '@/features/functional-template-hub/components/Index';

/**
 * 기능 템플릿 탐색 메인 페이지 (Hub)
 */
export default function FunctionalTemplatesPage() {
  const router = useRouter();
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'전체' | '인기' | '추천'>('전체');

  // AI 기반 맞춤 기능 설계 요청 핸들러
  const handleAIDesign = (requirements: string) => {
    // TODO: AI API 연동 로직
    console.log('AI 맞춤 설계 요구사항:', requirements);
  };

  // 템플릿 카드 클릭 핸들러
  const handleTemplateClick = (templateId: string) => {
    if (templateId === 'user-auth') {
      router.push('/functional-template'); 
    } else {
      alert('더 정교한 실습 환경을 위해 준비 중인 템플릿입니다. AI 설계를 이용해보세요!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 메인 헤더 재사용 */}
      <Header />

      {/* 페이지 타이틀 (문법 템플릿과 동일한 형태) */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-5 h-5 text-purple-600" />
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">기능 템플릿</h1>
              </div>
              <p className="text-sm text-gray-500">다양한 실습 템플릿을 탐색하거나 AI로 맞춤 템플릿을 생성해보세요.</p>
            </div>

            {/* 헤더 검색창: 카드 리스트 검색을 제어 */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="템플릿 검색..."
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠: AI 섹션 + 필터 + 그리드 (문법 템플릿과 동일한 흐름) */}
      <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
        {/* AI 섹션 (헤더 바로 아래에 자연스럽게 위치, 박스 제거) */}
        <section>
          <AISection onGenerate={handleAIDesign} />
        </section>

        {/* 필터 버튼 */}
        <div className="flex items-center gap-2">
          {(['전체', '인기', '추천'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as '전체' | '인기' | '추천')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeFilter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 템플릿 그리드 (개별 카드들이 문법 템플릿과 동일한 느낌) */}
        <TemplateGrid onTemplateClick={handleTemplateClick} searchQuery={cardSearchQuery} />

        {/* 서비스 통계 및 가이드 섹션 */}
        <section className="pt-10 border-t border-gray-100">
          <InfoSection />
        </section>
      </main>
    </div>
  );
}