"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, FileText, ListChecks, RefreshCw, Route, Sparkles } from 'lucide-react';
import { Header } from '@/features/main-home/components/Header';
import {
  fetchAiFeatureTemplateSection,
  type AiFeatureTemplateApiSpec,
  type AiFeatureTemplateBasicQuestion,
  type AiFeatureTemplateCodeFile,
  type AiFeatureTemplateData,
  type AiFeatureTemplateGenerateRequest,
  type AiFeatureTemplateGenerateResult,
  type AiFeatureTemplateInterviewQuestion,
  type AiFeatureTemplateMission,
  type AiFeatureTemplateNextRecommendation,
  type AiFeatureTemplateRegenerateSectionResult,
  type AiFeatureTemplateRequirement,
  type AiFeatureTemplateSection,
} from '@/api/services/AiService';

const AI_TEMPLATE_SESSION_KEY = 'cobip.aiFeatureTemplateDraft';

const sections: Array<{ key: AiFeatureTemplateSection; label: string }> = [
  { key: 'overview', label: '개요' },
  { key: 'requirements', label: '요구사항' },
  { key: 'flow', label: '흐름/구조' },
  { key: 'apiSpec', label: 'API 명세' },
  { key: 'codeFiles', label: '전체 코드' },
  { key: 'basicQuestions', label: '기본문제' },
  { key: 'missions', label: '미션' },
  { key: 'interviewQuestions', label: '면접질문' },
  { key: 'nextRecommendations', label: '다음 추천' },
];

type AiTemplateDraft = {
  request: AiFeatureTemplateGenerateRequest;
  result: AiFeatureTemplateGenerateResult;
  savedAt: string;
};

function loadAiTemplateDraft(): AiTemplateDraft | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(AI_TEMPLATE_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AiTemplateDraft;
  } catch {
    return null;
  }
}

function setAiTemplateDraft(draft: AiTemplateDraft) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AI_TEMPLATE_SESSION_KEY, JSON.stringify(draft));
}

function formatJson(value: Record<string, unknown> | string) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function renderEmpty(message: string) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function renderOverview(template: AiFeatureTemplateData) {
  const { overview } = template;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-extrabold text-gray-900">{overview.featureName}</h2>
        <p className="mt-3 leading-7 text-gray-700">{overview.purpose}</p>
        <p className="mt-4 leading-7 text-gray-600">{overview.resultDescription}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-bold text-gray-900">사용 시나리오</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {overview.useCases.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-bold text-gray-900">기술 스택</h3>
          <div className="flex flex-wrap gap-2">
            {overview.techStack.map((item) => (
              <span key={item} className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-bold text-gray-900">학습 목표</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {overview.learningGoals.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}

function renderRequirements(requirements: AiFeatureTemplateRequirement[]) {
  if (requirements.length === 0) return renderEmpty('생성된 요구사항이 없습니다.');

  return (
    <div className="space-y-4">
      {requirements.map((requirement) => (
        <article key={requirement.requirementId} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-purple-600">{requirement.requirementId}</p>
              <h3 className="mt-1 text-lg font-bold text-gray-900">{requirement.name}</h3>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {requirement.priority}
            </span>
          </div>
          <p className="mt-3 leading-7 text-gray-700">{requirement.description}</p>
          <dl className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
            <div><dt className="font-semibold text-gray-900">입력값</dt><dd className="mt-1 text-gray-600">{requirement.inputValue}</dd></div>
            <div><dt className="font-semibold text-gray-900">처리 조건</dt><dd className="mt-1 text-gray-600">{requirement.processCondition}</dd></div>
            <div><dt className="font-semibold text-gray-900">성공 결과</dt><dd className="mt-1 text-gray-600">{requirement.successResult}</dd></div>
            <div><dt className="font-semibold text-gray-900">실패 결과</dt><dd className="mt-1 text-gray-600">{requirement.failureResult}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function renderFlow(template: AiFeatureTemplateData) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Route className="h-5 w-5 text-purple-600" />
          처리 흐름
        </h3>
        <ol className="space-y-3 text-sm text-gray-700">
          {template.flow.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-lg font-bold text-gray-900">계층별 역할</h3>
        <div className="space-y-3">
          {template.flow.layers.map((layer) => (
            <div key={layer.layer} className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{layer.layer}</p>
              <p className="mt-1 text-sm text-gray-600">{layer.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function renderApiSpec(apiSpec: AiFeatureTemplateApiSpec[]) {
  if (apiSpec.length === 0) return renderEmpty('생성된 API 명세가 없습니다.');

  return (
    <div className="space-y-4">
      {apiSpec.map((api) => (
        <article key={`${api.method}-${api.endpoint}`} className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-bold text-gray-900">{api.apiName}</h3>
          <p className="mt-2 text-sm font-semibold text-purple-700">{api.method} {api.endpoint}</p>
          <p className="mt-3 leading-7 text-gray-700">{api.description}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">{formatJson(api.requestBody)}</pre>
            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">{formatJson(api.responseBody)}</pre>
          </div>
        </article>
      ))}
    </div>
  );
}

function renderCodeFiles(codeFiles: AiFeatureTemplateCodeFile[]) {
  if (codeFiles.length === 0) return renderEmpty('생성된 코드 파일이 없습니다.');

  return (
    <div className="space-y-4">
      {codeFiles.map((file) => (
        <article key={`${file.filePath ?? file.fileName}-${file.role}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
            <div>
              <h3 className="font-bold text-gray-900">{file.filePath ?? file.fileName}</h3>
              <p className="mt-1 text-xs text-gray-500">{file.role} · {file.language}</p>
            </div>
            <Code2 className="h-5 w-5 text-purple-600" />
          </div>
          <pre className="max-h-96 overflow-auto bg-gray-950 p-5 text-sm leading-6 text-gray-100">{file.content}</pre>
        </article>
      ))}
    </div>
  );
}

function renderBasicQuestions(questions: AiFeatureTemplateBasicQuestion[]) {
  if (questions.length === 0) return renderEmpty('생성된 기본 문제가 없습니다.');

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <article key={question.questionId} className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-purple-600">{question.type} · {question.difficulty}</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{question.question}</h3>
          {question.choices && (
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {question.choices.map((choice) => <li key={choice}>- {choice}</li>)}
            </ul>
          )}
          <p className="mt-4 text-sm font-semibold text-gray-900">정답: {question.answer}</p>
          <p className="mt-2 leading-6 text-gray-600">{question.explanation}</p>
        </article>
      ))}
    </div>
  );
}

function renderMissions(missions: AiFeatureTemplateMission[]) {
  if (missions.length === 0) return renderEmpty('생성된 미션이 없습니다.');

  return (
    <div className="space-y-4">
      {missions.map((mission) => (
        <article key={mission.missionId} className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-purple-600">{mission.missionType} · {mission.difficulty}</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{mission.title}</h3>
          <p className="mt-3 leading-7 text-gray-700">{mission.description}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">수행 요구</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {mission.requirements.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">완료 기준</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {mission.successCriteria.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function renderInterviewQuestions(questions: AiFeatureTemplateInterviewQuestion[]) {
  if (questions.length === 0) return renderEmpty('생성된 면접 질문이 없습니다.');

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <article key={question.questionId} className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-bold text-gray-900">{question.question}</h3>
          <p className="mt-3 leading-7 text-gray-700">{question.sampleAnswer}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {question.keyPoints.map((point) => (
              <span key={point} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {point}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function renderNextRecommendations(recommendations: AiFeatureTemplateNextRecommendation[]) {
  if (recommendations.length === 0) return renderEmpty('생성된 다음 추천 학습이 없습니다.');

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {recommendations.map((recommendation) => (
        <article key={recommendation.featureName} className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-purple-600">priority {recommendation.priority}</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{recommendation.featureName}</h3>
          <p className="mt-3 text-sm leading-6 text-gray-700">{recommendation.reason}</p>
          <p className="mt-3 text-sm leading-6 text-gray-600">{recommendation.expectedLearning}</p>
        </article>
      ))}
    </div>
  );
}

function renderSection(section: AiFeatureTemplateSection, template: AiFeatureTemplateData) {
  if (section === 'overview') return renderOverview(template);
  if (section === 'requirements') return renderRequirements(template.requirements);
  if (section === 'flow') return renderFlow(template);
  if (section === 'apiSpec') return renderApiSpec(template.apiSpec);
  if (section === 'codeFiles') return renderCodeFiles(template.codeFiles);
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
  const [activeSection, setActiveSection] = useState<AiFeatureTemplateSection>('overview');
  const [instruction, setInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(loadAiTemplateDraft());
  }, []);

  const template = draft?.result.template ?? null;
  const activeLabel = useMemo(
    () => sections.find((section) => section.key === activeSection)?.label ?? '섹션',
    [activeSection],
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
      setInstruction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 섹션 재생성에 실패했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        <main className="mx-auto max-w-4xl px-8 py-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-purple-600" />
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">AI 생성 템플릿이 없습니다</h1>
            <p className="mt-3 text-gray-600">기능 템플릿 허브에서 원하는 로직을 입력해 먼저 AI 템플릿을 생성해 주세요.</p>
            <Link
              href="/functional-template-hub"
              className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              허브로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <header className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-6">
          <div>
            <Link href="/functional-template-hub" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-700">
              <ArrowLeft className="h-4 w-4" />
              기능 템플릿 허브
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-semibold text-purple-600">AI 생성 템플릿 · {draft?.result.source}</p>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{template.overview.featureName}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-gray-600">{template.overview.purpose}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-8 py-8 lg:grid-cols-[16rem_1fr]">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection === section.key ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-5">
          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="text-sm font-bold text-gray-900">{activeLabel} 재생성 요청</label>
                <input
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  placeholder="예: 더 실무형으로, Redis 예시 추가, 초급자가 이해하기 쉽게"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleRegenerateSection()}
                disabled={isRegenerating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mb-3 flex items-center gap-2 text-gray-900">
            {activeSection === 'apiSpec' ? <FileText className="h-5 w-5 text-purple-600" /> : <ListChecks className="h-5 w-5 text-purple-600" />}
            <h2 className="text-2xl font-extrabold">{activeLabel}</h2>
          </div>

          {renderSection(activeSection, template)}
        </section>
      </main>
    </div>
  );
}
