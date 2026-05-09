"use client";

import { useRouter } from 'next/navigation';
import { Header } from '@/features/main-home/components/Header';
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
      {/* 상단 헤더 섹션: 메인 헤더 컴포넌트 재사용 */}
      <Header />

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