"use client";

import { useRouter } from 'next/navigation';
import { GrammarTemplateList } from '@/features/grammar-template/components/GrammarTemplateList';

/*
 * 문법 템플릿 - 목록 페이지
 * URL: /grammar-template
 */
export default function GrammarTemplatePage() {
  const router = useRouter();

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/grammar-template/${templateId}`);
  };

  return <GrammarTemplateList onSelectTemplate={handleSelectTemplate} />;
}
