"use client";

import { useState } from 'react';
import { GrammarTemplateList } from '@/features/grammar-template/components/GrammarTemplateList';
import { GrammarDetailView } from '@/features/grammar-template/components/GrammarDetailView';

/* ================== 메인: 목록 ↔ 상세 전환 ================== */
export default function GrammarTemplatePage() {
  const [view, setView] = useState<'list' | 'detail'>('list');

  const handleSelectTemplate = (_templateId: string) => {
    setView('detail');
    void _templateId;
  };

  const handleBack = () => {
    setView('list');
  };

  // 목록 뷰
  if (view === 'list') {
    return <GrammarTemplateList onSelectTemplate={handleSelectTemplate} />;
  }

  // 상세 뷰 - 새로운 강의형 뷰
  return <GrammarDetailView onBack={handleBack} />;
}

