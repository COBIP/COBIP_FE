"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FunctionalTemplateLayout } from '@/features/functional-template/components/FunctionalTemplateLayout';
import type { TemplateDetailApiResponse } from '@/api/services/FunctionalTemplateService';
import { getTemplate } from '@/api/services/FunctionalTemplateService';

export default function FunctionalTemplateDetail() {
  const params = useParams();
  const templateId = params?.templateId ? parseInt(String(params.templateId), 10) : null;
  
  const [template, setTemplate] = useState<TemplateDetailApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) {
      setError('유효하지 않은 템플릿 ID입니다.');
      setIsLoading(false);
      return;
    }

    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        const data = await getTemplate(templateId);
        setTemplate(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load template:', err);
        setError(err instanceof Error ? err.message : '템플릿을 로드할 수 없습니다.');
        setTemplate(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">템플릿을 로드하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">템플릿을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <FunctionalTemplateLayout 
      templateTitle={template.title}
      templateId={templateId}
      template={template}
    />
  );
}