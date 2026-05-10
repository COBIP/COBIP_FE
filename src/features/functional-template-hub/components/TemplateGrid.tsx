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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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