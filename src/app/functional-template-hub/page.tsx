'use client';

import { useRouter } from 'next/navigation';
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
      {/* 상단 헤더 섹션 */}
      <header className="bg-white border-b border-gray-200 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            기능 템플릿 탐색
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            다양한 기술 스택을 선택하고, 비즈니스 로직을 실습하고 학습하세요.
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-8 py-12 space-y-20">
        
        {/* AI 커스텀 기능 설계 섹션 */}
        <section>
          <AISection onGenerate={handleAIDesign} />
        </section>

        {/* 베스트 실습 템플릿 그리드 */}
        <section>
          <TemplateGrid onTemplateClick={handleTemplateClick} />
        </section>

        {/* 서비스 통계 및 가이드 섹션 */}
        <section className="pt-10 border-t border-gray-100">
          <InfoSection />
        </section>
        
      </main>
    </div>
  );
}