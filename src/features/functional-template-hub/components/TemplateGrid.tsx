import { TEMPLATES } from '@/features/functional-template-hub/Constants';
import { TemplateCard } from '@/features/functional-template-hub/components/TemplateCard';

interface TemplateGridProps {
  onTemplateClick: (templateId: string) => void;
}

export function TemplateGrid({ onTemplateClick }: TemplateGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        추천 템플릿
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => (
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