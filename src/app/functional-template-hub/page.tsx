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
  formatFeatureTemplateFramework,
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

  const handleAIDesign = async (request: AiFeatureTemplateGenerateRequest) => {
    const result = await fetchAiFeatureTemplate(request);
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

      <header className="border-b border-[#E2E8F0] bg-white px-6 py-8">
        <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Search className="h-5 w-5 shrink-0 text-[#7C3AED]" />
              <h1 className="text-[32px] font-bold tracking-tight text-[#1E293B]">기능 템플릿</h1>
            </div>
            <p className="text-sm text-[#64748B]">
              원하는 템플릿이 없다면 AI로 기능 템플릿을 생성해 보세요.
            </p>
          </div>

          <div className="relative w-full shrink-0 md:w-80 lg:w-96">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="템플릿 검색"
              value={cardSearchQuery}
              onChange={(event) => setCardSearchQuery(event.target.value)}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pr-3 pl-9 text-sm transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-8 px-6 py-8">
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
              className={`h-8 cursor-pointer rounded-lg px-4 text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
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
