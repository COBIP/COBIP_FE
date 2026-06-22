"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Header } from '@/features/main-home/components/Header';
import {
  AISection,
  AiGeneratedTemplatePreview,
  InfoSection,
  TemplateGrid,
} from '@/features/functional-template-hub/components/Index';
import {
  getTemplates,
  mapTemplateCardViewModel,
  type FunctionalTemplateCardViewModel,
} from '@/api/services/FunctionalTemplateService';
import {
  fetchAiFeatureTemplate,
  fetchAiFeatureTemplateStream,
  formatFeatureTemplateFramework,
  type AiFeatureTemplateGenerateProgress,
  type AiFeatureTemplateGenerateRequest,
  type AiFeatureTemplateGenerateResult,
} from '@/api/services/AiService';
import { setAiTemplateDraft } from '@/api/services/AiTemplateStorage';

type TemplateFilter = '전체' | '인기' | '추천';

export default function FunctionalTemplatesPage() {
  const router = useRouter();
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TemplateFilter>('전체');
  const [templates, setTemplates] = useState<FunctionalTemplateCardViewModel[]>([]);
  const [generatedTemplate, setGeneratedTemplate] = useState<AiFeatureTemplateGenerateResult | null>(null);
  const [generatedTemplateRequest, setGeneratedTemplateRequest] = useState<AiFeatureTemplateGenerateRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await getTemplates();
        setTemplates(data.map(mapTemplateCardViewModel));
        setError(null);
      } catch (err) {
        console.error('Failed to load templates:', err);
        setError(err instanceof Error ? err.message : '템플릿을 불러오지 못했습니다.');
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTemplates();
  }, []);

  const handleAIDesign = async (
    request: AiFeatureTemplateGenerateRequest,
    onProgress?: (progress: AiFeatureTemplateGenerateProgress) => void,
  ) => {
    let result: AiFeatureTemplateGenerateResult;

    try {
      result = await fetchAiFeatureTemplateStream(request, onProgress);
    } catch (streamError) {
      console.warn('AI template stream generation failed. Falling back to JSON generate API.', streamError);
      onProgress?.({
        status: 'RUNNING',
        step: 'fallback',
        label: '기본 생성 API로 다시 시도 중입니다.',
        progress: 20,
      });
      result = await fetchAiFeatureTemplate(request);
    }

    setAiTemplateDraft({
      request,
      result,
      savedAt: new Date().toISOString(),
    });
    setGeneratedTemplate(result);
    setGeneratedTemplateRequest(request);
    router.push('/functional-template-ai');
  };

  const handleOpenGeneratedTemplate = () => {
    if (!generatedTemplate) return;

    const request: AiFeatureTemplateGenerateRequest = {
      ...(generatedTemplateRequest ?? {}),
      featureName: generatedTemplateRequest?.featureName ?? generatedTemplate.template.overview.featureName,
      language: generatedTemplateRequest?.language ?? generatedTemplate.template.codeFiles[0]?.language ?? 'java',
      framework: formatFeatureTemplateFramework(generatedTemplateRequest?.framework),
      techStack: generatedTemplateRequest?.techStack ?? generatedTemplate.template.overview.techStack,
      level: generatedTemplateRequest?.level ?? 'intermediate',
      difficulty: generatedTemplateRequest?.difficulty ?? generatedTemplateRequest?.level ?? 'intermediate',
      includeCode: true,
      includeMissions: true,
      includeInterview: true,
      referenceContext: generatedTemplateRequest?.referenceContext ?? null,
    };

    setAiTemplateDraft({
      request,
      result: generatedTemplate,
      savedAt: new Date().toISOString(),
    });
    router.push('/functional-template-ai');
  };

  const handleTemplateClick = (templateId: string) => {
    router.push(`/functional-template/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <header className="border-b border-[#E2E8F0] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Search className="h-5 w-5 text-[#7C3AED]" />
                <h1 className="text-[28px] font-bold tracking-tight text-[#1E293B]">기능 템플릿</h1>
              </div>
              <p className="text-sm text-[#64748B]">
                원하는 템플릿이 없다면 AI로 기능 템플릿을 생성해 보세요.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="템플릿 검색"
                value={cardSearchQuery}
                onChange={(event) => setCardSearchQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pr-3 pl-9 text-sm text-[#1E293B] transition placeholder:text-[#94A3B8] focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#EDE9FE] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-8 py-8">
        <AISection onGenerate={handleAIDesign} />

        {generatedTemplate && (
          <AiGeneratedTemplatePreview result={generatedTemplate} onOpen={handleOpenGeneratedTemplate} />
        )}

        <div className="flex items-center gap-2">
          {(['전체', '인기', '추천'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`h-10 cursor-pointer rounded-lg border px-4 text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white shadow-sm'
                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#D8B4FE] hover:bg-[#F8FAFC]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <TemplateGrid
          templates={templates}
          onTemplateClick={handleTemplateClick}
          searchQuery={cardSearchQuery}
          isLoading={isLoading}
        />

        <section>
          <InfoSection />
        </section>
      </main>
    </div>
  );
}
