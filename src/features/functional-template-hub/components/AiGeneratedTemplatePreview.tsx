import { Code2, FileText, ListChecks, MessageCircleQuestion, Sparkles } from 'lucide-react';
import type { AiFeatureTemplateGenerateResult } from '@/api/services/AiService';

interface AiGeneratedTemplatePreviewProps {
  result: AiFeatureTemplateGenerateResult;
  onOpen?: () => void;
}

function formatJson(value: Record<string, unknown> | string) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

export function AiGeneratedTemplatePreview({ result, onOpen }: AiGeneratedTemplatePreviewProps) {
  const { template, source } = result;
  const overview = template.overview;

  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#7C3AED]">
            <Sparkles className="h-4 w-4" />
            AI 생성 결과 · {source === 'ollama' ? 'LLM' : 'Fallback'}
          </div>
          <h2 className="text-[28px] font-bold leading-9 text-[#1E293B]">{overview.featureName}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">{overview.purpose}</p>
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="h-10 shrink-0 rounded-lg bg-[#7C3AED] px-5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            AI 템플릿 열기
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {overview.techStack.map((tech) => (
          <span key={tech} className="rounded-lg border border-[#EDE9FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#6D28D9]">
            {tech}
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <ListChecks className="h-4 w-4 text-[#7C3AED]" />
            요구사항
          </h3>
          <ul className="space-y-3">
            {template.requirements.slice(0, 4).map((requirement) => (
              <li key={requirement.requirementId} className="text-sm text-[#475569]">
                <span className="font-semibold text-[#1E293B]">{requirement.name}</span>
                <p className="mt-1 leading-5 text-[#64748B]">{requirement.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <FileText className="h-4 w-4 text-[#7C3AED]" />
            API 명세
          </h3>
          <ul className="space-y-3">
            {template.apiSpec.slice(0, 4).map((api) => (
              <li key={`${api.method}-${api.endpoint}`} className="text-sm text-[#475569]">
                <span className="font-semibold text-[#1E293B]">
                  {api.method} {api.endpoint}
                </span>
                <p className="mt-1 leading-5 text-[#64748B]">{api.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <Code2 className="h-4 w-4 text-[#7C3AED]" />
            코드 파일
          </h3>
          <ul className="space-y-2">
            {template.codeFiles.slice(0, 5).map((file) => (
              <li key={`${file.filePath ?? file.fileName}-${file.role}`} className="text-sm text-[#475569]">
                <span className="font-semibold text-[#1E293B]">{file.filePath ?? file.fileName}</span>
                <span className="ml-2 text-xs text-[#64748B]">{file.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <MessageCircleQuestion className="h-4 w-4 text-[#7C3AED]" />
            핵심 질문
          </h3>
          <ul className="space-y-3">
            {template.interviewQuestions.slice(0, 3).map((question) => (
              <li key={question.questionId} className="text-sm text-[#475569]">
                <span className="font-semibold text-[#1E293B]">{question.question}</span>
                <p className="mt-1 leading-5 text-[#64748B]">{question.sampleAnswer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {template.apiSpec[0] && (
        <details className="mt-5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <summary className="cursor-pointer text-sm font-bold text-[#1E293B]">첫 API 요청/응답 예시 보기</summary>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <pre className="overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
              {formatJson(template.apiSpec[0].requestBody)}
            </pre>
            <pre className="overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
              {formatJson(template.apiSpec[0].responseBody)}
            </pre>
          </div>
        </details>
      )}
    </section>
  );
}
