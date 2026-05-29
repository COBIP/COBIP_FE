"use client";

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Code2,
  FileText,
  Layers3,
  ListChecks,
  RefreshCw,
  Route,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/features/main-home/components/Header';
import { MarkdownTextView } from '@/features/functional-template/components/MarkdownTextView';
import {
  fetchAiFeatureTemplateSection,
  type AiFeatureTemplateApiSpec,
  type AiFeatureTemplateBasicQuestion,
  type AiFeatureTemplateCodeFile,
  type AiFeatureTemplateData,
  type AiFeatureTemplateInterviewQuestion,
  type AiFeatureTemplateMission,
  type AiFeatureTemplateNextRecommendation,
  type AiFeatureTemplateRegenerateSectionResult,
  type AiFeatureTemplateRequirement,
  type AiFeatureTemplateSection,
} from '@/api/services/AiService';
import {
  loadAiTemplateDraft,
  loadSavedAiTemplateToSession,
  setAiTemplateToLibrary,
  setAiTemplateDraft,
  type AiTemplateDraft,
} from '@/api/services/AiTemplateStorage';

const sections: Array<{ key: AiFeatureTemplateSection; label: string }> = [
  { key: 'overview', label: '개요' },
  { key: 'requirements', label: '요구사항' },
  { key: 'flow', label: '흐름/구조' },
  { key: 'apiSpec', label: 'API 명세' },
  { key: 'codeFiles', label: '전체 코드' },
  { key: 'basicQuestions', label: '문제' },
  { key: 'missions', label: '미션' },
  { key: 'interviewQuestions', label: '핵심 질문' },
  { key: 'nextRecommendations', label: '다음 추천' },
];

function formatJson(value: Record<string, unknown> | string) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function buildMarkdownList(items: string[], fallback = '생성된 내용이 없습니다.') {
  if (items.length === 0) return fallback;
  return items.map((item) => `- ${item}`).join('\n');
}

function renderEmpty(message: string) {
  return (
    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-10 text-center text-sm text-[#64748B]">
      {message}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-[#7C3AED]">{icon}</span>
      <h2 className="text-[28px] font-bold text-[#1E293B]">{title}</h2>
    </div>
  );
}

function ContentPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-6">
      {children}
    </div>
  );
}

function renderOverview(template: AiFeatureTemplateData) {
  const { overview } = template;

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Sparkles size={28} />} title="개요" />
      <ContentPanel>
        <div className="space-y-5 text-[15px] leading-7 text-[#334155]">
          <div>
            <h3 className="mb-2 text-xl font-bold text-[#1E293B]">{overview.featureName}</h3>
            <p>{overview.purpose || 'AI가 생성한 기능 템플릿 개요입니다.'}</p>
            {overview.resultDescription && <p className="mt-3">{overview.resultDescription}</p>}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <h4 className="mb-2 font-semibold text-[#7C3AED]">사용 시나리오</h4>
              <MarkdownTextView content={buildMarkdownList(overview.useCases)} />
            </section>
            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <h4 className="mb-3 font-semibold text-[#7C3AED]">기술 스택</h4>
              <div className="flex flex-wrap gap-2">
                {overview.techStack.length > 0 ? overview.techStack.map((item) => (
                  <span key={item} className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-medium text-[#475569]">
                    {item}
                  </span>
                )) : <span className="text-sm text-[#64748B]">기술 스택 없음</span>}
              </div>
            </section>
            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <h4 className="mb-2 font-semibold text-[#7C3AED]">학습 목표</h4>
              <MarkdownTextView content={buildMarkdownList(overview.learningGoals)} />
            </section>
          </div>
        </div>
      </ContentPanel>
    </div>
  );
}

function renderRequirements(requirements: AiFeatureTemplateRequirement[]) {
  if (requirements.length === 0) return renderEmpty('생성된 요구사항이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<ListChecks size={28} />} title="요구사항" />
      <div className="space-y-4">
        {requirements.map((requirement, index) => (
          <ContentPanel key={requirement.requirementId || index}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#7C3AED]">{requirement.requirementId}</p>
                <h3 className="mt-1 text-lg font-bold text-[#1E293B]">{requirement.name || `요구사항 ${index + 1}`}</h3>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-[#64748B]">
                {requirement.priority}
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[#334155]">{requirement.description}</p>
            <dl className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
              <div><dt className="font-semibold text-[#1E293B]">입력값</dt><dd className="mt-1 text-[#64748B]">{requirement.inputValue || '-'}</dd></div>
              <div><dt className="font-semibold text-[#1E293B]">처리 조건</dt><dd className="mt-1 text-[#64748B]">{requirement.processCondition || '-'}</dd></div>
              <div><dt className="font-semibold text-[#1E293B]">성공 결과</dt><dd className="mt-1 text-[#64748B]">{requirement.successResult || '-'}</dd></div>
              <div><dt className="font-semibold text-[#1E293B]">실패 결과</dt><dd className="mt-1 text-[#64748B]">{requirement.failureResult || '-'}</dd></div>
            </dl>
          </ContentPanel>
        ))}
      </div>
    </div>
  );
}

function renderFlow(template: AiFeatureTemplateData) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<Route size={28} />} title="흐름/구조" />
      <div className="grid gap-5 lg:grid-cols-2">
        <ContentPanel>
          <h3 className="mb-4 text-lg font-bold text-[#1E293B]">처리 흐름</h3>
          {template.flow.steps.length > 0 ? (
            <ol className="space-y-3 text-sm text-[#334155]">
              {template.flow.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#7C3AED]">
                    {index + 1}
                  </span>
                  <span className="leading-6">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[#64748B]">생성된 처리 흐름이 없습니다.</p>
          )}
        </ContentPanel>

        <ContentPanel>
          <h3 className="mb-4 text-lg font-bold text-[#1E293B]">계층별 역할</h3>
          <div className="space-y-3">
            {template.flow.layers.length > 0 ? template.flow.layers.map((layer, index) => (
              <div key={`${layer.layer}-${index}`} className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                <p className="font-semibold text-[#1E293B]">{layer.layer || `Layer ${index + 1}`}</p>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">{layer.role}</p>
              </div>
            )) : <p className="text-sm text-[#64748B]">생성된 구조 설명이 없습니다.</p>}
          </div>
        </ContentPanel>
      </div>
    </div>
  );
}

function renderApiSpec(apiSpec: AiFeatureTemplateApiSpec[]) {
  if (apiSpec.length === 0) return renderEmpty('생성된 API 명세가 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<FileText size={28} />} title="API 명세" />
      <div className="space-y-4">
        {apiSpec.map((api, index) => (
          <ContentPanel key={`${api.method}-${api.endpoint}-${index}`}>
            <h3 className="text-lg font-bold text-[#1E293B]">{api.apiName}</h3>
            <p className="mt-2 text-sm font-semibold text-[#7C3AED]">{api.method} {api.endpoint}</p>
            <p className="mt-3 text-[15px] leading-7 text-[#334155]">{api.description}</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <pre className="max-h-80 overflow-auto rounded-lg bg-[#0F172A] p-4 text-xs leading-5 text-[#E2E8F0]">
                <code>{formatJson(api.requestBody)}</code>
              </pre>
              <pre className="max-h-80 overflow-auto rounded-lg bg-[#0F172A] p-4 text-xs leading-5 text-[#E2E8F0]">
                <code>{formatJson(api.responseBody)}</code>
              </pre>
            </div>
          </ContentPanel>
        ))}
      </div>
    </div>
  );
}

function CodeFilesView({ codeFiles }: { codeFiles: AiFeatureTemplateCodeFile[] }) {
  const [activeFile, setActiveFile] = useState(codeFiles[0]?.filePath ?? codeFiles[0]?.fileName ?? '');
  const currentFile = codeFiles.find((file) => (file.filePath ?? file.fileName) === activeFile) ?? codeFiles[0];

  if (codeFiles.length === 0) return renderEmpty('생성된 코드 파일이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Code2 size={28} />} title="전체 코드" />
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
        <div className="flex overflow-x-auto border-b border-[#E2E8F0] bg-[#F8FAFC]">
          {codeFiles.map((file) => {
            const key = file.filePath ?? file.fileName;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFile(key)}
                title={key}
                className={`shrink-0 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  key === (currentFile?.filePath ?? currentFile?.fileName)
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {(file.filePath ?? file.fileName).split('/').pop()}
              </button>
            );
          })}
        </div>
        <div className="border-b border-[#E2E8F0] bg-white px-5 py-3 text-xs text-[#64748B]">
          {currentFile?.filePath ?? currentFile?.fileName} · {currentFile?.language || 'code'} · {currentFile?.role || 'generated'}
        </div>
        <pre className="max-h-[34rem] overflow-auto bg-white p-5 text-sm leading-6 text-[#1E293B]">
          <code className="font-mono whitespace-pre">{currentFile?.content ?? ''}</code>
        </pre>
      </div>
    </div>
  );
}

function renderBasicQuestions(questions: AiFeatureTemplateBasicQuestion[]) {
  if (questions.length === 0) return renderEmpty('생성된 문제가 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<ListChecks size={28} />} title="문제" />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div key={question.questionId || index} className="rounded-md border border-[#E2E8F0] bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1E293B]">{index + 1}. {question.question}</span>
                  <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
                    {question.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((question, index) => (
            <ContentPanel key={`${question.questionId}-detail-${index}`}>
              <p className="text-xs font-semibold text-[#7C3AED]">{question.type} · {question.difficulty}</p>
              <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{question.question}</h3>
              {question.choices && question.choices.length > 0 && (
              <MarkdownTextView content={buildMarkdownList(question.choices)} className="mt-3 text-sm text-[#334155]" />
              )}
              <p className="mt-4 text-sm font-semibold text-[#1E293B]">정답: {question.answer}</p>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">{question.explanation}</p>
            </ContentPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMissions(missions: AiFeatureTemplateMission[]) {
  if (missions.length === 0) return renderEmpty('생성된 미션이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<BookOpen size={28} />} title="미션" />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="space-y-2">
            {missions.map((mission, index) => (
              <div key={mission.missionId || index} className="rounded-md border border-[#E2E8F0] bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1E293B]">{index + 1}. {mission.title}</span>
                  <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
                    {mission.missionType}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-[#64748B]">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {missions.map((mission, index) => (
            <ContentPanel key={`${mission.missionId}-detail-${index}`}>
              <p className="text-xs font-semibold text-[#7C3AED]">{mission.missionType} · {mission.difficulty}</p>
              <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{mission.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#334155]">{mission.description}</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold text-[#1E293B]">수행 요구</h4>
                  <MarkdownTextView content={buildMarkdownList(mission.requirements)} className="text-sm text-[#475569]" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-[#1E293B]">완료 기준</h4>
                  <MarkdownTextView content={buildMarkdownList(mission.successCriteria)} className="text-sm text-[#475569]" />
                </div>
              </div>
            </ContentPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderInterviewQuestions(questions: AiFeatureTemplateInterviewQuestion[]) {
  if (questions.length === 0) return renderEmpty('생성된 핵심 질문이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Sparkles size={28} />} title="핵심 질문" />
      {questions.map((question, index) => (
        <ContentPanel key={question.questionId || index}>
          <p className="text-sm font-semibold text-[#7C3AED]">Q{index + 1}</p>
          <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{question.question}</h3>
          <p className="mt-3 text-[15px] leading-7 text-[#334155]">{question.sampleAnswer}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {question.keyPoints.map((point) => (
              <span key={point} className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-medium text-[#475569]">
                {point}
              </span>
            ))}
          </div>
        </ContentPanel>
      ))}
    </div>
  );
}

function renderNextRecommendations(recommendations: AiFeatureTemplateNextRecommendation[]) {
  if (recommendations.length === 0) return renderEmpty('생성된 다음 추천 학습이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Layers3 size={28} />} title="다음 추천" />
      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <ContentPanel key={recommendation.featureName}>
            <p className="text-xs font-semibold text-[#7C3AED]">priority {recommendation.priority}</p>
            <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{recommendation.featureName}</h3>
            <p className="mt-3 text-sm leading-6 text-[#334155]">{recommendation.reason}</p>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">{recommendation.expectedLearning}</p>
          </ContentPanel>
        ))}
      </div>
    </div>
  );
}

function renderSection(section: AiFeatureTemplateSection, template: AiFeatureTemplateData) {
  if (section === 'overview') return renderOverview(template);
  if (section === 'requirements') return renderRequirements(template.requirements);
  if (section === 'flow') return renderFlow(template);
  if (section === 'apiSpec') return renderApiSpec(template.apiSpec);
  if (section === 'codeFiles') return <CodeFilesView codeFiles={template.codeFiles} />;
  if (section === 'basicQuestions') return renderBasicQuestions(template.basicQuestions);
  if (section === 'missions') return renderMissions(template.missions);
  if (section === 'interviewQuestions') return renderInterviewQuestions(template.interviewQuestions);
  return renderNextRecommendations(template.nextRecommendations);
}

function updateTemplateSection(
  template: AiFeatureTemplateData,
  result: AiFeatureTemplateRegenerateSectionResult,
): AiFeatureTemplateData {
  return {
    ...template,
    [result.section]: result.content,
  } as AiFeatureTemplateData;
}

export default function AiFunctionalTemplatePage() {
  const [draft, setDraft] = useState<AiTemplateDraft | null>(null);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeSection, setActiveSection] = useState<AiFeatureTemplateSection>('overview');
  const [instruction, setInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextSavedTemplateId = searchParams.get('savedTemplateId');
    const restoredTemplate = loadSavedAiTemplateToSession(nextSavedTemplateId);

    if (restoredTemplate) {
      setDraft({
        request: restoredTemplate.request,
        result: restoredTemplate.result,
        savedAt: restoredTemplate.savedAt,
      });
      setSavedTemplateId(restoredTemplate.id);
      return;
    }

    setDraft(loadAiTemplateDraft());
  }, []);

  const template = draft?.result.template ?? null;
  const activeLabel = useMemo(
    () => sections.find((section) => section.key === activeSection)?.label ?? '섹션',
    [activeSection],
  );
  const tags = useMemo(
    () => template?.overview.techStack.slice(0, 4) ?? [],
    [template?.overview.techStack],
  );
  const learningPoint = template?.overview.purpose || template?.overview.resultDescription || 'AI가 생성한 기능 템플릿을 섹션별로 확인해보세요.';
  const references = useMemo(
    () => [
      draft?.request.framework ? `Framework: ${draft.request.framework}` : null,
      draft?.request.language ? `Language: ${draft.request.language}` : null,
      draft?.result.source ? `AI source: ${draft.result.source}` : null,
    ].filter((item): item is string => Boolean(item)),
    [draft?.request.framework, draft?.request.language, draft?.result.source],
  );

  const handleRegenerateSection = async () => {
    if (!draft || !template) return;

    try {
      setError(null);
      setIsRegenerating(true);
      const result = await fetchAiFeatureTemplateSection({
        ...draft.request,
        section: activeSection,
        previousContent: { [activeSection]: template[activeSection] },
        userInstruction: instruction.trim() || null,
        techStack: template.overview.techStack,
        currentTemplate: template as unknown as Record<string, unknown>,
      });
      const nextDraft = {
        ...draft,
        result: {
          ...draft.result,
          template: updateTemplateSection(template, result),
          source: result.source,
        },
        savedAt: new Date().toISOString(),
      };

      setAiTemplateDraft(nextDraft);
      setDraft(nextDraft);
      if (savedTemplateId) {
        setAiTemplateToLibrary(nextDraft, savedTemplateId);
      }
      setInstruction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 섹션 재생성에 실패했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!draft) return;

    const savedTemplate = setAiTemplateToLibrary(draft, savedTemplateId);
    setSavedTemplateId(savedTemplate.id);
    setSaveMessage('내 학습에 저장되었습니다. 마이페이지 내 학습에서 이어서 볼 수 있어요.');
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-4xl px-8 py-16">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-[#7C3AED]" />
            <h1 className="mt-4 text-2xl font-bold text-[#1E293B]">AI 생성 템플릿이 없습니다</h1>
            <p className="mt-3 text-[#64748B]">기능 템플릿 페이지에서 원하는 로직을 입력해 AI 템플릿을 먼저 생성해주세요.</p>
            <Link
              href="/functional-template-hub"
              className="mt-6 inline-flex rounded-lg bg-[#7C3AED] px-5 py-3 font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              기능 템플릿으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="border-b border-[#E2E8F0] bg-white px-6 py-3">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link href="/functional-template-hub" className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-[#7C3AED]">
              <ArrowLeft className="h-4 w-4" />
              기능 템플릿
            </Link>
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="min-w-0 truncate text-lg font-bold text-[#1E293B]">
                {template.overview.featureName || 'AI 생성 기능 템플릿'}
              </h1>
              <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2 py-1 text-[11px] font-medium text-[#475569]">
                AI 생성
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
              <span>기능 템플릿</span>
              <span>난이도 {draft?.request.level ?? 'intermediate'}</span>
              {tags.map((tag) => (
                <span key={tag} className="rounded-md bg-[#F1F5F9] px-2 py-0.5">
                  {tag}
                </span>
              ))}
              <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[#047857]">초안</span>
              {savedTemplateId && (
                <span className="rounded-md bg-[#EDE9FE] px-2 py-0.5 text-[#6D28D9]">내 학습 저장됨</span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              내 학습에 저장
            </button>
            {saveMessage && (
              <p className="mt-2 max-w-56 text-right text-xs text-[#047857]">{saveMessage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center border-b border-[#F1F5F9] bg-white px-6">
        <div className="flex gap-7 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`relative h-12 shrink-0 text-sm font-medium transition ${
                activeSection === section.key ? 'text-[#7C3AED]' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {section.label}
              {activeSection === section.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-[1040px] px-5 py-6 lg:px-6">
            <div className="mb-5 rounded-lg border border-[#EDE9FE] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="text-sm font-bold text-[#1E293B]">{activeLabel} 재생성 요청</label>
                  <input
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    placeholder="예: Redis 예시 추가, 초급자가 이해하기 쉽게, API 응답을 더 자세히"
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:ring-2 focus:ring-[#DDD6FE] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleRegenerateSection()}
                  disabled={isRegenerating}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? '재생성 중' : `${activeLabel} 재생성`}
                </button>
              </div>
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {renderSection(activeSection, template)}
          </div>
        </section>

        <aside className="w-[22rem] shrink-0 border-l border-[#F1F5F9] bg-[#FAFBFC] px-4 py-4">
          <div className="space-y-3">
            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-[#1E293B]">학습 포인트</h3>
              </div>
              <MarkdownTextView
                content={learningPoint}
                compact
                maxBlocks={3}
                className="line-clamp-7 text-[13px] text-[#475569]"
              />
            </section>

            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-[#1E293B]">관련 개념 키워드</h3>
              </div>
              <ul className="space-y-1.5 text-[13px] text-[#475569]">
                {(tags.length > 0 ? tags : ['AI 생성', '기능 템플릿']).map((keyword) => (
                  <li key={keyword} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                    <span className="truncate">{keyword}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-[#1E293B]">참고 정보</h3>
              </div>
              <ul className="space-y-1.5 text-[13px] text-[#475569]">
                {references.map((reference) => (
                  <li key={reference} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                    <span className="min-w-0 truncate">{reference}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </main>
    </div>
  );
}
