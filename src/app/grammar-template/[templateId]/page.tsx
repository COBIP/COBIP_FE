"use client";

import { useParams, useRouter } from 'next/navigation';
import { GrammarDetailView } from '@/features/grammar-template/components/GrammarDetailView';

/**
 * 문법 템플릿 - 개별 레슨 상세 페이지
 * URL: /grammar-template/[templateId]
 */
export default function GrammarTemplateLessonPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = Number(params.templateId);

  const handleBack = () => {
    router.push('/grammar-template');
  };

  return <GrammarDetailView templateId={templateId} onBack={handleBack} />;
}
