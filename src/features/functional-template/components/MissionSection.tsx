'use client';

import { useState } from 'react';
import type { TemplatePracticeMissionApiResponse } from '@/api/services/FunctionalTemplateService';
import { MarkdownTextView } from './MarkdownTextView';

interface MissionSectionProps {
  isDarkMode?: boolean;
  title?: string;
  description?: string;
  emptyText?: string;
  actionLabel?: string;
  learningType?: 'mission' | 'problem';
  activeMissionId?: number | null;
  completedMissionIds?: Set<number>;
  onOpenEditor?: (fileName: string, missionId: number) => void;
  onProblemCorrect?: (missionId: number) => void | Promise<void>;
  missions?: Array<TemplatePracticeMissionApiResponse & { fileName?: string }>;
}

type MissionMeta = {
  questionType?: string;
  difficulty?: string;
  choices?: string[];
  answer?: string;
  explanation?: string;
  requirements?: string[];
  successCriteria?: string[];
};

type AnswerResult = 'correct' | 'incorrect' | 'empty';

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : typeof value === 'string'
      ? value.split(/\r?\n/g).map((item) => item.trim()).filter(Boolean)
      : [];
}

function getMissionMeta(validationJson?: Record<string, unknown> | null): MissionMeta {
  const validation = validationJson ?? {};
  const meta = typeof validation.learningMeta === 'object' && validation.learningMeta !== null
    ? validation.learningMeta as Record<string, unknown>
    : validation;

  return {
    questionType: String(meta.questionType ?? meta.type ?? '').trim(),
    difficulty: String(meta.difficulty ?? '').trim(),
    choices: getStringArray(meta.choices),
    answer: String(meta.answer ?? meta.correctAnswer ?? '').trim(),
    explanation: String(meta.explanation ?? '').trim(),
    requirements: getStringArray(meta.requirements),
    successCriteria: getStringArray(meta.successCriteria),
  };
}

function formatQuestionType(value?: string) {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'multiple_choice') return '객관식';
  if (normalized === 'fill_blank') return '빈칸';
  if (normalized === 'short_answer') return '단답형';
  if (normalized === 'code') return '코드형';

  return value || 'short_answer';
}

function formatNormalizedAnswer(value?: string) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function MissionSection({
  isDarkMode = false,
  title = '미션',
  description,
  emptyText = '아직 연결된 미션이 없습니다.',
  actionLabel = '풀어보기',
  learningType = 'mission',
  activeMissionId,
  completedMissionIds,
  onOpenEditor,
  onProblemCorrect,
  missions,
}: MissionSectionProps) {
  const [revealedAnswerIds, setRevealedAnswerIds] = useState<Set<number>>(new Set());
  const [problemAnswers, setProblemAnswers] = useState<Record<number, string>>({});
  const [answerResults, setAnswerResults] = useState<Record<number, AnswerResult>>({});
  const steps = missions && missions.length > 0
    ? missions.map((mission, index) => {
        const meta = getMissionMeta(mission.validationJson);

        return {
          id: mission.id,
          title: `${index + 1}. ${mission.title}`,
          fileName: mission.fileName,
          summary: mission.description,
          explanation: mission.guideContent,
          missionType: mission.missionType ?? mission.type,
          meta: {
            ...meta,
            choices: meta.choices ?? [],
            requirements: meta.requirements ?? [],
            successCriteria: meta.successCriteria ?? [],
          },
        };
      })
    : [];
  const updateProblemAnswer = (missionId: number, answer: string) => {
    setProblemAnswers((current) => ({ ...current, [missionId]: answer }));
    setAnswerResults((current) => {
      const next = { ...current };
      delete next[missionId];
      return next;
    });
    setRevealedAnswerIds((current) => {
      const next = new Set(current);
      next.delete(missionId);
      return next;
    });
  };

  const checkAnswer = (missionId: number, answer?: string) => {
    const userAnswer = formatNormalizedAnswer(problemAnswers[missionId]);
    const correctAnswer = formatNormalizedAnswer(answer);
    const result: AnswerResult = !userAnswer ? 'empty' : userAnswer === correctAnswer ? 'correct' : 'incorrect';

    setAnswerResults((current) => ({
      ...current,
      [missionId]: result,
    }));
    setRevealedAnswerIds((current) => new Set(current).add(missionId));

    if (result === 'correct') {
      void onProblemCorrect?.(missionId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm leading-6 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
          {description}
        </p>
      )}

      {steps.length > 0 ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div
            className={`min-w-0 rounded-md border p-3 transition-colors duration-300 ${
              isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="space-y-2">
              {steps.map((step) => {
                const isCompleted = completedMissionIds?.has(step.id) ?? false;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onOpenEditor?.(step.fileName ?? 'main.java', step.id)}
                    className={`w-full min-w-0 rounded-md border px-3 py-3 text-left transition-colors duration-300 ${
                      isCompleted
                        ? isDarkMode
                          ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : step.id === activeMissionId
                          ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#5B21B6]'
                          : isDarkMode
                            ? 'border-[#334155] bg-[#0F172A] text-[#CBD5E1] hover:bg-[#1E293B]'
                            : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 break-words text-[13px] font-semibold leading-relaxed">{step.title}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-[#7C3AED]/10 text-[#7C3AED]'
                        }`}
                      >
                        {isCompleted ? '완료' : actionLabel}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {learningType === 'problem' && step.meta.questionType ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {formatQuestionType(step.meta.questionType)}
                        </span>
                      ) : null}
                      {step.meta.difficulty ? (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                          {step.meta.difficulty}
                        </span>
                      ) : null}
                    </div>
                    {step.summary && <p className="mt-2 break-words text-[12px] leading-relaxed opacity-90">{step.summary}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            {steps.map((step) => {
              const isCompleted = completedMissionIds?.has(step.id) ?? false;
              const isActive = step.id === activeMissionId;
              const isAnswerRevealed = revealedAnswerIds.has(step.id);
              const answerResult = answerResults[step.id];
              const currentAnswer = problemAnswers[step.id] ?? '';
              const hasMissionMeta = step.meta.requirements.length > 0 || step.meta.successCriteria.length > 0;

              return (
                <article
                  key={`detail-${step.id}`}
                  className={`min-w-0 rounded-md border p-5 transition-colors duration-300 ${
                    isActive
                      ? isDarkMode
                        ? 'border-violet-500 bg-violet-950/20'
                        : 'border-violet-200 bg-violet-50/40'
                      : isDarkMode
                        ? 'border-[#334155] bg-[#1E293B]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#7C3AED]">
                      {learningType === 'problem'
                        ? `${step.meta.questionType || 'short_answer'} · ${step.meta.difficulty || 'intermediate'}`
                        : `${step.meta.questionType || 'implementation'} · ${step.meta.difficulty || 'intermediate'}`}
                    </span>
                    {isCompleted ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">완료</span>
                    ) : null}
                  </div>

                  <h3 className={`break-words text-xl font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {step.title.replace(/^\d+\.\s*/, '')}
                  </h3>

                  {step.summary ? (
                    <p className={`mt-3 break-words text-sm leading-7 [overflow-wrap:anywhere] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                      {step.summary}
                    </p>
                  ) : null}

                  {learningType === 'problem' ? (
                    <div className="mt-4 space-y-4">
                      {step.meta.choices.length > 0 ? (
                        <div className="space-y-2">
                          {step.meta.choices.map((choice, index) => (
                            <label
                              key={`${step.id}-${choice}-${index}`}
                              className={`flex min-w-0 items-start gap-3 rounded-md border px-4 py-3 text-sm leading-6 ${
                                isDarkMode ? 'border-[#334155] bg-[#0F172A] text-[#E2E8F0]' : 'border-[#E2E8F0] bg-white text-[#334155]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`problem-${step.id}`}
                                checked={currentAnswer === choice}
                                onChange={() => updateProblemAnswer(step.id, choice)}
                                className="mt-1 accent-[#7C3AED]"
                              />
                              <span className="min-w-0 break-words">{choice}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={currentAnswer}
                          onChange={(event) => updateProblemAnswer(step.id, event.target.value)}
                          rows={4}
                          placeholder="답안을 입력하세요."
                          className={`w-full min-w-0 resize-y rounded-md border px-4 py-3 text-sm outline-none transition focus:border-[#7C3AED] ${
                            isDarkMode ? 'border-[#334155] bg-[#0F172A] text-white placeholder:text-[#64748B]' : 'border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8]'
                          }`}
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => checkAnswer(step.id, step.meta.answer)}
                          className="h-10 rounded-md bg-[#7C3AED] px-4 text-sm font-bold text-white transition hover:bg-[#6D28D9]"
                        >
                          정답 확인
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditor?.(step.fileName ?? 'main.java', step.id)}
                          className="h-10 rounded-md border border-violet-200 bg-white px-4 text-sm font-bold text-[#7C3AED] transition hover:bg-violet-50"
                        >
                          관련 코드 열기
                        </button>
                      </div>

                      {isAnswerRevealed && (step.meta.answer || step.meta.explanation || answerResult) ? (
                        <div className={`space-y-3 rounded-md border p-4 text-sm leading-6 ${
                          answerResult === 'correct'
                            ? isDarkMode ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : answerResult === 'incorrect'
                              ? isDarkMode ? 'border-rose-500/50 bg-rose-950/20 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-900'
                              : isDarkMode ? 'border-amber-500/50 bg-amber-950/20 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'
                        }`}>
                          {answerResult ? (
                            <p className="text-base font-bold">
                              {answerResult === 'correct' ? '정답입니다.' : answerResult === 'incorrect' ? '오답입니다.' : '답안을 먼저 선택하거나 입력해주세요.'}
                            </p>
                          ) : null}
                          {step.meta.answer ? (
                            <div>
                              <p className="font-bold text-[#7C3AED]">정답</p>
                              <p className="mt-1 break-words">{step.meta.answer}</p>
                            </div>
                          ) : null}
                          {step.meta.explanation ? (
                            <div>
                              <p className="font-bold text-[#7C3AED]">해설</p>
                              <p className="mt-1 break-words">{step.meta.explanation}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {hasMissionMeta ? (
                        <div className="grid min-w-0 grid-cols-1 gap-4">
                          {step.meta.requirements.length > 0 ? (
                            <div className={`min-w-0 break-words rounded-md border p-4 [overflow-wrap:anywhere] ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
                              <p className="mb-3 text-base font-bold text-[#7C3AED]">수행 요구</p>
                              <MarkdownTextView content={step.meta.requirements.map((item) => `- ${item}`).join('\n')} isDarkMode={isDarkMode} />
                            </div>
                          ) : null}
                          {step.meta.successCriteria.length > 0 ? (
                            <div className={`min-w-0 break-words rounded-md border p-4 [overflow-wrap:anywhere] ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
                              <p className="mb-3 text-base font-bold text-[#7C3AED]">완료 기준</p>
                              <MarkdownTextView content={step.meta.successCriteria.map((item) => `- ${item}`).join('\n')} isDarkMode={isDarkMode} />
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {step.explanation ? (
                        <div className={`min-w-0 rounded-md border p-4 ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
                          <p className="mb-3 text-base font-bold text-[#7C3AED]">미션 가이드</p>
                          <MarkdownTextView content={step.explanation} isDarkMode={isDarkMode} />
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditor?.(step.fileName ?? 'main.java', step.id)}
                          className="h-10 rounded-md bg-[#7C3AED] px-4 text-sm font-bold text-white transition hover:bg-[#6D28D9]"
                        >
                          관련 코드 열기
                        </button>
                        <span className={`flex h-10 items-center rounded-md px-3 text-xs font-semibold ${isDarkMode ? 'bg-[#0F172A] text-[#94A3B8]' : 'bg-white text-[#64748B]'}`}>
                          제출은 코드 실행기에서 진행됩니다.
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-md border px-4 py-8 text-center text-sm transition-colors duration-300 ${
            isDarkMode ? 'border-[#334155] bg-[#1E293B] text-[#94A3B8]' : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
          }`}
        >
          {emptyText}
        </div>
      )}
    </div>
  );
}
