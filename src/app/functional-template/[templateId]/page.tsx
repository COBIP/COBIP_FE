'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FunctionalTemplateLayout } from '@/features/functional-template/components/FunctionalTemplateLayout';
import {
  getTemplate,
  getTemplatePractice,
  type TemplateDetailApiResponse,
  type TemplatePracticeDetailApiResponse,
} from '@/api/services/FunctionalTemplateService';

export default function FunctionalTemplateDetail() {
  const params = useParams();
  const templateId = params?.templateId ? Number.parseInt(String(params.templateId), 10) : null;

  const [template, setTemplate] = useState<TemplateDetailApiResponse | null>(null);
  const [practice, setPractice] = useState<TemplatePracticeDetailApiResponse | null>(null);
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
        const [templateResult, practiceResult] = await Promise.allSettled([
          getTemplate(templateId),
          getTemplatePractice(templateId),
        ]);

        if (templateResult.status === 'fulfilled') {
          setTemplate(templateResult.value);
        } else {
          throw templateResult.reason;
        }

        setPractice(practiceResult.status === 'fulfilled' ? practiceResult.value : null);
        setError(null);
      } catch (loadError) {
        console.error('Failed to load template:', loadError);
        setError(loadError instanceof Error ? loadError.message : '템플릿을 불러오지 못했습니다.');
        setTemplate(null);
        setPractice(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTemplate();
  }, [templateId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">템플릿을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">템플릿을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <FunctionalTemplateLayout
      templateTitle={template.title}
      templateId={templateId}
      template={template}
      practice={practice}
    />
  );
}
