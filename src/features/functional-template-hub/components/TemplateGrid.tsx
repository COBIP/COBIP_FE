import { TEMPLATES } from '@/features/functional-template-hub/Constants';
import { TemplateCard } from '@/features/functional-template-hub/components/TemplateCard';

interface TemplateGridProps {
  onTemplateClick: (templateId: string) => void;
  searchQuery?: string;
}

export function TemplateGrid({ onTemplateClick, searchQuery = '' }: TemplateGridProps) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? TEMPLATES.filter((t) => {
        if (t.title.toLowerCase().includes(q)) return true;
        if (t.description.toLowerCase().includes(q)) return true;
        if (t.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
        return false;
      })
    : TEMPLATES;

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