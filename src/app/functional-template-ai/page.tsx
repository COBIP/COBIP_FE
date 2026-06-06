"use client";

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ChevronLeft,
  Code2,
  FileText,
  Layers3,
  ListChecks,
  RefreshCw,
  Route,
  Sparkles,
} from 'lucide-react';
import { Header as FunctionalTemplateHeader } from '@/features/functional-template/components/Header';
import { MarkdownTextView } from '@/features/functional-template/components/MarkdownTextView';
import { MemoPanel } from '@/features/functional-template/components/MemoPanel';
import { SettingsModal } from '@/features/functional-template/components/SettingsModal';
import {
  AI_TEMPLATE_CHAT_OPEN_EVENT,
  AI_TEMPLATE_CODE_OPEN_EVENT,
  AiTemplateCodeWorkspace,
  ApiSpecDetails,
} from '@/features/functional-template-ai/components/Index';
import { useUserStore } from '@/store/UseUserStore';
import {
  fetchAiFeatureTemplateSection,
  fetchAiMissionFeedback,
  fetchAiQuizGrade,
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
  type AiMissionFeedbackResponse,
  type AiQuizGradeResponse,
} from '@/api/services/AiService';
import {
  loadAiTemplateDraft,
  loadSavedAiTemplateToSession,
  setAiTemplateDraft,
  updateSavedAiTemplateProgress,
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
            <ApiSpecDetails api={api} />
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

function renderBasicQuestions(
  questions: AiFeatureTemplateBasicQuestion[],
  onOpenRelatedCode: (question: AiFeatureTemplateBasicQuestion, index: number) => void,
  answers: Record<string, string>,
  results: Record<string, AiQuizGradeResponse>,
  completedIds: string[],
  gradingId: string | null,
  onAnswerChange: (questionId: string, value: string) => void,
  onGrade: (question: AiFeatureTemplateBasicQuestion) => void,
) {
  if (questions.length === 0) return renderEmpty('생성된 문제가 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<ListChecks size={28} />} title="문제" />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="space-y-2">
            {questions.map((question, index) => (
              <button
                key={question.questionId || index}
                type="button"
                onClick={() => onOpenRelatedCode(question, index)}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-3 text-left transition hover:border-[#C4B5FD] hover:bg-[#FAF5FF]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1E293B]">{index + 1}. {question.question}</span>
                  <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
                    {completedIds.includes(question.questionId) ? '완료' : question.difficulty}
                  </span>
                </div>
              </button>
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
              <textarea
                value={answers[question.questionId] ?? ''}
                onChange={(event) => onAnswerChange(question.questionId, event.target.value)}
                placeholder="답안을 입력하세요."
                className="mt-4 min-h-24 w-full resize-y rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none"
              />
              {results[question.questionId] && (
                <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                  results[question.questionId].isCorrect
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}>
                  <p className="font-bold">{results[question.questionId].isCorrect ? '정답입니다.' : '다시 확인해보세요.'}</p>
                  <p className="mt-1">{results[question.questionId].feedback}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => onGrade(question)}
                disabled={!answers[question.questionId]?.trim() || gradingId === question.questionId}
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#7C3AED] px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {gradingId === question.questionId ? '채점 중' : '정답 확인'}
              </button>
              <button
                type="button"
                onClick={() => onOpenRelatedCode(question, index)}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-[#C4B5FD] px-3 text-sm font-semibold text-[#7C3AED] transition hover:bg-[#F5F3FF]"
              >
                관련 코드 열기
              </button>
            </ContentPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMissions(
  missions: AiFeatureTemplateMission[],
  onOpenRelatedCode: (mission: AiFeatureTemplateMission, index: number) => void,
  results: Record<string, AiMissionFeedbackResponse>,
  completedIds: string[],
  gradingId: string | null,
  onSubmit: (mission: AiFeatureTemplateMission) => void,
) {
  if (missions.length === 0) return renderEmpty('생성된 미션이 없습니다.');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<BookOpen size={28} />} title="미션" />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="space-y-2">
            {missions.map((mission, index) => (
              <button
                key={mission.missionId || index}
                type="button"
                onClick={() => onOpenRelatedCode(mission, index)}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-3 text-left transition hover:border-[#C4B5FD] hover:bg-[#FAF5FF]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1E293B]">{index + 1}. {mission.title}</span>
                  <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
                    {completedIds.includes(mission.missionId) ? '완료' : mission.missionType}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-[#64748B]">{mission.description}</p>
              </button>
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
              {results[mission.missionId] && (
                <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  results[mission.missionId].passed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  <p className="font-bold">{results[mission.missionId].passed ? '미션을 통과했습니다.' : '보완이 필요합니다.'}</p>
                  <p className="mt-1">{results[mission.missionId].summary}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => onSubmit(mission)}
                disabled={gradingId === mission.missionId}
                className="mt-4 mr-2 inline-flex h-9 items-center rounded-lg bg-[#7C3AED] px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {gradingId === mission.missionId ? '검토 중' : '현재 코드로 미션 제출'}
              </button>
              <button
                type="button"
                onClick={() => onOpenRelatedCode(mission, index)}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-[#C4B5FD] px-3 text-sm font-semibold text-[#7C3AED] transition hover:bg-[#F5F3FF]"
              >
                관련 코드 열기
              </button>
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

type QuestionRenderProps = [
  Record<string, string>,
  Record<string, AiQuizGradeResponse>,
  string[],
  string | null,
  (questionId: string, value: string) => void,
  (question: AiFeatureTemplateBasicQuestion) => void,
];

type MissionRenderProps = [
  Record<string, AiMissionFeedbackResponse>,
  string[],
  string | null,
  (mission: AiFeatureTemplateMission) => void,
];

function renderSection(
  section: AiFeatureTemplateSection,
  template: AiFeatureTemplateData,
  onOpenQuestionCode: (question: AiFeatureTemplateBasicQuestion, index: number) => void,
  onOpenMissionCode: (mission: AiFeatureTemplateMission, index: number) => void,
  questionProps: QuestionRenderProps,
  missionProps: MissionRenderProps,
) {
  if (section === 'overview') return renderOverview(template);
  if (section === 'requirements') return renderRequirements(template.requirements);
  if (section === 'flow') return renderFlow(template);
  if (section === 'apiSpec') return renderApiSpec(template.apiSpec);
  if (section === 'codeFiles') return <CodeFilesView codeFiles={template.codeFiles} />;
  if (section === 'basicQuestions') {
    return renderBasicQuestions(template.basicQuestions, onOpenQuestionCode, ...questionProps);
  }
  if (section === 'missions') return renderMissions(template.missions, onOpenMissionCode, ...missionProps);
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

function getAiCodeFileKey(file: AiFeatureTemplateCodeFile) {
  return file.filePath ?? file.fileName;
}

function findRelatedAiCodeFile(
  files: AiFeatureTemplateCodeFile[],
  contextParts: Array<string | string[] | null | undefined>,
  fallbackIndex: number,
) {
  if (files.length === 0) return null;

  const context = contextParts
    .flatMap((part) => Array.isArray(part) ? part : [part])
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .toLowerCase();

  const mentionedFile = files.find((file) => {
    const path = getAiCodeFileKey(file).toLowerCase();
    const basename = path.split(/[\\/]/).at(-1) ?? path;
    return context.includes(path) || context.includes(basename);
  });
  if (mentionedFile) return getAiCodeFileKey(mentionedFile);

  const roleKeywords = ['controller', 'service', 'filter', 'security', 'config', 'repository', 'dto', 'entity', 'util'];
  const matchedRole = roleKeywords.find((keyword) => context.includes(keyword));
  const roleFile = matchedRole
    ? files.find((file) => `${getAiCodeFileKey(file)} ${file.role}`.toLowerCase().includes(matchedRole))
    : null;
  if (roleFile) return getAiCodeFileKey(roleFile);

  return getAiCodeFileKey(files[fallbackIndex % files.length]);
}

export default function AiFunctionalTemplatePage() {
  const router = useRouter();
  const { nickname, profileImage } = useUserStore();
  const [draft, setDraft] = useState<AiTemplateDraft | null>(null);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeSection, setActiveSection] = useState<AiFeatureTemplateSection>('overview');
  const [instruction, setInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isAiGuruHintMode, setIsAiGuruHintMode] = useState(true);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, AiQuizGradeResponse>>({});
  const [missionResults, setMissionResults] = useState<Record<string, AiMissionFeedbackResponse>>({});
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [gradingQuestionId, setGradingQuestionId] = useState<string | null>(null);
  const [gradingMissionId, setGradingMissionId] = useState<string | null>(null);
  const isDarkMode = themeMode === 'dark';

  useEffect(() => {
    let isMounted = true;

    const restoreTemplate = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextSavedTemplateId = searchParams.get('savedTemplateId');
      const restoredTemplate = await loadSavedAiTemplateToSession(nextSavedTemplateId);

    if (restoredTemplate) {
        if (!isMounted) return;
      setDraft({
        request: restoredTemplate.request,
        result: restoredTemplate.result,
        savedAt: restoredTemplate.savedAt,
      });
      setSavedTemplateId(restoredTemplate.id);
      setCompletedQuestionIds(restoredTemplate.completedQuestionIds ?? []);
      setCompletedMissionIds(restoredTemplate.completedMissionIds ?? []);
      return;
    }

      if (!isMounted) return;
    setDraft(loadAiTemplateDraft());
    };

    void restoreTemplate();

    return () => {
      isMounted = false;
    };
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
  const totalLearningItems = (template?.basicQuestions.length ?? 0) + (template?.missions.length ?? 0);
  const completedLearningItems = completedQuestionIds.length + completedMissionIds.length;
  const progressPercent = totalLearningItems > 0
    ? Math.round((completedLearningItems / totalLearningItems) * 100)
    : 0;
  const aiChatContext = useMemo(() => {
    if (!template) return '';

    return [
      `기능 템플릿: ${template.overview.featureName}`,
      `목적: ${template.overview.purpose}`,
      `학습 목표: ${template.overview.learningGoals.join(', ')}`,
      `기술 스택: ${template.overview.techStack.join(', ')}`,
      `현재 섹션: ${activeLabel}`,
    ].join('\n');
  }, [activeLabel, template]);

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
        await updateSavedAiTemplateProgress(
          nextDraft,
          savedTemplateId,
          completedQuestionIds,
          completedMissionIds,
        );
      }
      setInstruction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 섹션 재생성에 실패했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!draft) return;

    try {
      setError(null);
      const savedTemplate = await updateSavedAiTemplateProgress(
        draft,
        savedTemplateId,
        completedQuestionIds,
        completedMissionIds,
      );
      setSavedTemplateId(savedTemplate.id);
      setSaveMessage('내 학습에 저장되었습니다. 마이페이지 내 학습에서 이어서 볼 수 있어요.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'AI 템플릿 저장에 실패했습니다.');
    }
  };

  const handleCodeFilesChange = async (codeFiles: AiFeatureTemplateCodeFile[]) => {
    if (!draft || !template) return;

    const nextDraft: AiTemplateDraft = {
      ...draft,
      result: {
        ...draft.result,
        template: {
          ...template,
          codeFiles,
        },
      },
      savedAt: new Date().toISOString(),
    };

    setAiTemplateDraft(nextDraft);
    setDraft(nextDraft);
    if (savedTemplateId) {
      try {
        await updateSavedAiTemplateProgress(
          nextDraft,
          savedTemplateId,
          completedQuestionIds,
          completedMissionIds,
        );
      } catch {
        setError('AI 템플릿 코드 변경사항 저장에 실패했습니다.');
      }
    }
  };

  const openRelatedCode = (
    contextParts: Array<string | string[] | null | undefined>,
    fallbackIndex: number,
  ) => {
    if (!template) return;

    const filePath = findRelatedAiCodeFile(template.codeFiles, contextParts, fallbackIndex);
    if (!filePath) return;

    window.dispatchEvent(new CustomEvent(AI_TEMPLATE_CODE_OPEN_EVENT, { detail: filePath }));
  };

  const handleOpenQuestionCode = (question: AiFeatureTemplateBasicQuestion, index: number) => {
    openRelatedCode(
      [question.relatedSection, question.question, question.explanation, question.answer, question.choices],
      index,
    );
  };

  const handleOpenMissionCode = (mission: AiFeatureTemplateMission, index: number) => {
    openRelatedCode(
      [
        mission.title,
        mission.description,
        mission.missionType,
        mission.requirements,
        mission.successCriteria,
        mission.relatedRequirements,
      ],
      index,
    );
  };

  const syncAiProgress = async (nextQuestionIds: string[], nextMissionIds: string[]) => {
    if (!draft) return;
    const saved = await updateSavedAiTemplateProgress(draft, savedTemplateId, nextQuestionIds, nextMissionIds);
    setSavedTemplateId(saved.id);
    setCompletedQuestionIds(nextQuestionIds);
    setCompletedMissionIds(nextMissionIds);
  };

  const handleGradeQuestion = async (question: AiFeatureTemplateBasicQuestion) => {
    if (!template) return;
    const userAnswer = questionAnswers[question.questionId]?.trim();
    if (!userAnswer) return;

    try {
      setGradingQuestionId(question.questionId);
      const result = await fetchAiQuizGrade({
        featureName: template.overview.featureName,
        question,
        userAnswer,
        relatedRequirements: template.requirements,
        relatedApiSpecs: template.apiSpec,
      });
      setQuestionResults((current) => ({ ...current, [question.questionId]: result }));
      if (result.isCorrect && !completedQuestionIds.includes(question.questionId)) {
        await syncAiProgress([...completedQuestionIds, question.questionId], completedMissionIds);
      }
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : '문제 채점에 실패했습니다.');
    } finally {
      setGradingQuestionId(null);
    }
  };

  const handleSubmitMission = async (mission: AiFeatureTemplateMission) => {
    if (!template) return;

    try {
      setGradingMissionId(mission.missionId);
      const result = await fetchAiMissionFeedback({
        featureName: template.overview.featureName,
        mission,
        submittedCode: template.codeFiles,
        requirements: template.requirements,
        apiSpecs: template.apiSpec,
      });
      setMissionResults((current) => ({ ...current, [mission.missionId]: result }));
      if (result.passed && !completedMissionIds.includes(mission.missionId)) {
        await syncAiProgress(completedQuestionIds, [...completedMissionIds, mission.missionId]);
      }
    } catch (missionError) {
      setError(missionError instanceof Error ? missionError.message : '미션 검토에 실패했습니다.');
    } finally {
      setGradingMissionId(null);
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-white">
        <FunctionalTemplateHeader
          title="기능 템플릿"
          isFavorite={false}
          isFavoriteSaving={false}
          profileImage={profileImage}
          nickname={nickname}
          onFavoriteToggle={() => undefined}
          onProfileClick={() => router.push('/my-page/profile')}
          onSettingsClick={() => undefined}
          onMemoToggle={() => undefined}
          isMemoOpen={false}
          isDarkMode={false}
        />
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
    <div className={`flex h-screen flex-col ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <FunctionalTemplateHeader
        title="기능 템플릿"
        isFavorite={isFavorite}
        isFavoriteSaving={false}
        profileImage={profileImage}
        nickname={nickname}
        onFavoriteToggle={() => setIsFavorite((current) => !current)}
        onProfileClick={() => router.push('/my-page/profile')}
        onAiChatOpen={() => window.dispatchEvent(new Event(AI_TEMPLATE_CHAT_OPEN_EVENT))}
        onSettingsClick={() => setIsShowSettings(true)}
        onMemoToggle={() => setIsMemoOpen((current) => !current)}
        isMemoOpen={isMemoOpen}
        isDarkMode={isDarkMode}
      />

      <div className="border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="min-w-0 truncate text-[28px] font-bold text-[#1E293B]">
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
              {savedTemplateId && (
                <span className="rounded-md bg-[#EDE9FE] px-2 py-0.5 text-[#6D28D9]">내 학습 저장됨</span>
              )}
            </div>
          </div>
          <div className="flex w-[28rem] max-w-[42vw] shrink-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>학습 진행률</span>
                <span className="font-semibold text-[#334155]">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full rounded-full bg-[#7C3AED] transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSaveTemplate()}
              className="h-10 rounded-lg bg-[#7C3AED] px-5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
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
        <div className="flex w-full gap-7 overflow-x-auto">
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
          <div className="px-5 py-6 lg:px-6">
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

            {renderSection(
              activeSection,
              template,
              handleOpenQuestionCode,
              handleOpenMissionCode,
              [
                questionAnswers,
                questionResults,
                completedQuestionIds,
                gradingQuestionId,
                (questionId, value) => setQuestionAnswers((current) => ({ ...current, [questionId]: value })),
                (question) => void handleGradeQuestion(question),
              ],
              [
                missionResults,
                completedMissionIds,
                gradingMissionId,
                (mission) => void handleSubmitMission(mission),
              ],
            )}
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

      <AiTemplateCodeWorkspace
        codeFiles={template.codeFiles}
        templateTitle={template.overview.featureName}
        chatContext={aiChatContext}
        onCodeFilesChange={handleCodeFilesChange}
      />

      {isMemoOpen && <MemoPanel isDarkMode={isDarkMode} onClose={() => setIsMemoOpen(false)} />}

      <div className={`flex h-14 shrink-0 items-center border-t px-6 ${
        isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#F1F5F9] bg-white'
      }`}>
        <button
          type="button"
          onClick={() => router.push('/functional-template-hub')}
          className={`flex items-center gap-2 rounded p-2 ${
            isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">목록으로</span>
        </button>
      </div>

      {isShowSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          isAiGuruHintMode={isAiGuruHintMode}
          onAiGuruHintModeChange={setIsAiGuruHintMode}
          onClose={() => setIsShowSettings(false)}
        />
      )}
    </div>
  );
}
