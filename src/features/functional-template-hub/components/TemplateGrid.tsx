import { TemplateCard } from '@/features/functional-template-hub/components/TemplateCard';
import type { FunctionalTemplateCardViewModel } from '@/api/services/FunctionalTemplateService';

interface TemplateGridProps {
  templates: FunctionalTemplateCardViewModel[];
  onTemplateClick: (templateId: string) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

export function TemplateGrid({ 
  templates, 
  onTemplateClick, 
  searchQuery = '',
  isLoading = false 
}: TemplateGridProps) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? templates.filter((t) => {
        if (t.title.toLowerCase().includes(q)) return true;
        if (t.description.toLowerCase().includes(q)) return true;
        if (t.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
        return false;
      })
    : templates;

  if (isLoading) {
    return (
      <section>
        <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-lg border border-[#E2E8F0] bg-[#F1F5F9]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section>
        <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1E293B]">검색 결과가 없습니다.</p>
          <p className="mt-2 text-sm text-[#64748B]">다른 키워드나 카테고리로 다시 찾아보세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            id={template.id}
            title={template.title}
            description={template.description}
            icon={template.icon}
            status={template.status as 'ready' | 'coming-soon'}
            tags={template.tags}
            duration={template.duration}
            onClick={onTemplateClick}
          />
        ))}
      </div>
    </section>
  );
}
