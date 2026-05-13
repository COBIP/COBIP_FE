"use client";

import { useRouter } from 'next/navigation';
import { GrammarTemplateList } from '@/features/grammar-template/components/GrammarTemplateList';

/*
 * 문법 템플릿 - 목록 페이지
 * URL: /grammar-template
 */
export default function GrammarTemplatePage() {
  const router = useRouter();

    const handleSelectTemplate = (templateId: number) => {
    // 비로그인 상태면 로그인 페이지로 이동
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') ?? localStorage.getItem('access_token')
      : null;
    if (!token) {
      router.push('/login');
      return;
    }
    router.push(`/grammar-template/${templateId}`);
  };

  return <GrammarTemplateList onSelectTemplate={handleSelectTemplate} />;
}

