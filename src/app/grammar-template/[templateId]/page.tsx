"use client";

import { useRouter } from 'next/navigation';
import { GrammarDetailView } from '@/features/grammar-template/components/GrammarDetailView';

/**
 * 문법 템플릿 - 개별 레슨 상세 페이지
 * URL: /grammar-template/[templateId]
 */
export default function GrammarTemplateLessonPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/grammar-template');
  };

  return <GrammarDetailView onBack={handleBack} />;
}
