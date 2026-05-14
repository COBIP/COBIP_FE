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

type TemplateFilter = '전체' | '인기' | '추천';

export const AI_TEMPLATE_SESSION_KEY = 'cobip.aiFeatureTemplateDraft';

function setAiTemplateDraft(request: AiFeatureTemplateGenerateRequest, result: AiFeatureTemplateGenerateResult) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    AI_TEMPLATE_SESSION_KEY,
    JSON.stringify({
      request,
      result,
      savedAt: new Date().toISOString(),
    }),
  );
}

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
    setAiTemplateDraft(request, result);
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

    setAiTemplateDraft(request, generatedTemplate);
    router.push('/functional-template-ai');
  };

  const handleTemplateClick = (templateId: string) => {
    router.push(`/functional-template/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <header className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">기능 템플릿</h1>
              </div>
              <p className="text-sm text-gray-500">
                원하는 템플릿이 없다면 AI로 기능 템플릿 초안을 생성해 보세요.
              </p>
            </div>

            <div className="relative w-72">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="템플릿 검색"
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-8 py-8">
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
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <TemplateGrid
          templates={templates}
          onTemplateClick={handleTemplateClick}
          searchQuery={cardSearchQuery}
          isLoading={isLoading}
        />

        <section className="border-t border-gray-100 pt-10">
          <InfoSection />
        </section>
      </main>
    </div>
  );
}
