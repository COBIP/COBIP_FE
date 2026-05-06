'use client';

import { useRouter } from 'next/navigation';
import {
  AISection,
  TemplateGrid,
  InfoSection,
} from '@/features/functional-template-hub/components/Index';

export default function FunctionalTemplates() {
  const router = useRouter();

  // AI 생성 핸들러
  const handleAIGeneration = (input: string) => {
    // 실제로는 AI 서버에 요청하고 결과를 받음
    console.log('AI 생성 요청:', input);
  };

  // 템플릿 클릭 핸들러
  const handleTemplateClick = (templateId: string) => {
    if (templateId === 'user-auth') {
      router.push('/functional-template');
    } else {
      alert('이 템플릿은 준비 중입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            기능 템플릿 탐색
          </h1>
          <p className="text-gray-600">
            다양한 기술 스택으로 실습하고 학습하세요
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* AI 섹션 */}
        <AISection onGenerate={handleAIGeneration} />

        {/* 템플릿 그리드 */}
        <TemplateGrid onTemplateClick={handleTemplateClick} />

        {/* 정보 섹션 */}
        <InfoSection />
      </main>
    </div>
  );
}