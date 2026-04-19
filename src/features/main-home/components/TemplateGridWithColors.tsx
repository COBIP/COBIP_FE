// TemplateGridWithColors.tsx — 전체 교체

interface Template {
  id: number;
  title: string;
  category: string;
  rating: number;
  color: string;
}

interface TemplateGridWithColorsProps {
  templates: Template[];
}

export default function TemplateGridWithColors({ templates }: TemplateGridWithColorsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {templates.map(template => (
        <div key={template.id} className="cursor-pointer group">

          {/* 썸네일 */}
          <div
            className="
              h-40 md:h-44 rounded-xl
              flex flex-col items-center justify-center
              relative overflow-hidden
              transition-all duration-200 ease-out
              group-hover:scale-[1.06] group-hover:-translate-y-1
              group-hover:shadow-[0_12px_28px_rgba(83,74,183,0.35)]
            "
            style={{ backgroundColor: template.color }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.07] transition-all duration-200" />
            <p className="text-xs text-white/70 mb-1">Template</p>
            <p className="text-2xl font-medium text-white">{template.id}</p>
          </div>

          {/* 카드 하단 정보 */}
          <div className="mt-2.5 px-0.5">
            <p className="text-sm font-medium text-gray-900 truncate mb-1.5">
              {template.title}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                {template.category}
              </span>
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <span className="text-amber-400">★</span>
                {template.rating.toFixed(1)}
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}