"use client";

import { MarkdownTextView } from './MarkdownTextView';

interface StructureSectionProps {
  isDarkMode?: boolean;
  content?: string;
  title?: string;
}

type FlowStep = {
  title: string;
  description?: string;
};

type FlowLayer = {
  name: string;
  description: string;
};

type StructuredFlow = {
  steps: FlowStep[];
  layers: FlowLayer[];
};

function parseStructuredFlow(content?: string): StructuredFlow | null {
  const text = content?.trim();

  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : [];
    const rawLayers = Array.isArray(parsed.layers) ? parsed.layers : [];
    const steps = rawSteps
      .map((step) => {
        if (typeof step === 'string') {
          return { title: step.trim() };
        }

        const record = step as Record<string, unknown>;
        return {
          title: String(record.title ?? record.description ?? '').trim(),
          description: String(record.description ?? '').trim(),
        };
      })
      .filter((step) => step.title);
    const layers = rawLayers
      .map((layer) => {
        const record = layer as Record<string, unknown>;

        return {
          name: String(record.name ?? record.title ?? '').trim(),
          description: String(record.description ?? record.role ?? '').trim(),
        };
      })
      .filter((layer) => layer.name || layer.description);

    return steps.length > 0 || layers.length > 0 ? { steps, layers } : null;
  } catch {
    return null;
  }
}

export function StructureSection({ isDarkMode = false, content, title = '구조설명' }: StructureSectionProps) {
  const hasContent = Boolean(content?.trim());
  const structuredFlow = parseStructuredFlow(content);

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1E293B]'
        }`}
      >
        {title}
      </h2>

      <div
        className={`rounded-lg border p-6 transition-colors duration-300 ${
          isDarkMode
            ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0]'
            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
        }`}
      >
        {structuredFlow ? (
          <div className="space-y-6">
            <section>
              <h3 className={`mb-4 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>처리 흐름</h3>
              {structuredFlow.steps.length > 0 ? (
                <ol className="space-y-3">
                  {structuredFlow.steps.map((step, index) => (
                    <li
                      key={`${step.title}-${index}`}
                      className={`flex gap-4 rounded-lg border p-4 ${
                        isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold leading-relaxed">{step.title}</p>
                        {step.description && step.description !== step.title ? (
                          <p className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>등록된 처리 흐름이 없습니다.</p>
              )}
            </section>

            <section>
              <h3 className={`mb-4 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>계층별 역할</h3>
              {structuredFlow.layers.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {structuredFlow.layers.map((layer, index) => (
                    <div
                      key={`${layer.name}-${index}`}
                      className={`rounded-lg border p-4 ${
                        isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'
                      }`}
                    >
                      <h4 className="font-bold text-[#7C3AED]">{layer.name}</h4>
                      <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                        {layer.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>등록된 계층 역할이 없습니다.</p>
              )}
            </section>
          </div>
        ) : hasContent ? (
          <MarkdownTextView content={content} isDarkMode={isDarkMode} />
        ) : (
          <div className={`flex min-h-32 items-center justify-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
