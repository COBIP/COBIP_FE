'use client';

import { useState } from 'react';

import { fetchAiInterviewFeedback, type AiInterviewFeedbackResponse } from '@/api/services/AiService';

import { MarkdownTextView } from './MarkdownTextView';

interface InterviewQuestion {
  question: string;
  answerHint?: string | null;
  answer_hint?: string | null;
}

interface InterviewSectionProps {
  isDarkMode?: boolean;
  questions?: Array<string | InterviewQuestion>;
}

export function InterviewSection({ isDarkMode = false, questions }: InterviewSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackResults, setFeedbackResults] = useState<Record<string, AiInterviewFeedbackResponse>>({});
  const [feedbackLoadingKey, setFeedbackLoadingKey] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const visibleQuestions = questions && questions.length > 0
    ? questions
        .map((item) =>
          typeof item === 'string'
            ? { question: item.trim(), answerHint: '' }
            : {
                question: item.question.trim(),
                answerHint: (item.answerHint ?? item.answer_hint ?? '').trim(),
              },
        )
        .filter((item) => item.question.length > 0)
    : [];

  const buildQuestionKey = (question: string, index: number) => `${index}-${question}`;

  const buildKeyPoints = (question: string, answerHint?: string | null) => {
    const points = (answerHint ?? '')
      .split(/\n|\.|,|·/)
      .map((point) => point.replace(/^[-*#\s]+/, '').trim())
      .filter((point) => point.length > 0)
      .slice(0, 6);

    return points.length > 0 ? points : [question];
  };

  const handleFeedback = async (question: string, answerHint: string | null | undefined, index: number) => {
    const questionKey = buildQuestionKey(question, index);
    const userAnswer = answers[questionKey]?.trim();

    if (!userAnswer) return;

    try {
      setFeedbackError(null);
      setFeedbackLoadingKey(questionKey);
      const result = await fetchAiInterviewFeedback({
        question,
        keyPoints: buildKeyPoints(question, answerHint),
        userAnswer,
      });
      setFeedbackResults((current) => ({ ...current, [questionKey]: result }));
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'AI 피드백 생성에 실패했습니다.');
    } finally {
      setFeedbackLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        핵심 질문
      </h2>

      <div className="space-y-3">
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((item, idx) => {
            const questionKey = buildQuestionKey(item.question, idx);
            const feedback = feedbackResults[questionKey];

            return (
            <div key={`${item.question}-${idx}`} className={`rounded-lg border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-[13px] font-semibold text-[#7C3AED]">
                    Q{idx + 1}
                  </span>
                  <h3 className={`text-[14px] font-medium leading-relaxed ${
                    isDarkMode ? 'text-white' : 'text-[#1E293B]'
                  }`}>
                    {item.question}
                  </h3>
                </div>
                <span className={`text-[12px] ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  {openIndex === idx ? '닫기' : '열기'}
                </span>
              </button>

              {openIndex === idx && (
                <div className={`border-t px-4 py-3 text-[14px] leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'border-[#334155] text-[#CBD5E1]' : 'border-[#E2E8F0] text-[#475569]'
                }`}>
                  <div className="mb-4 space-y-3">
                    <textarea
                      value={answers[questionKey] ?? ''}
                      onChange={(event) => setAnswers((current) => ({ ...current, [questionKey]: event.target.value }))}
                      placeholder="내 답안을 작성한 뒤 AI 피드백을 받아보세요."
                      className={`min-h-24 w-full resize-y rounded-lg border px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none ${
                        isDarkMode
                          ? 'border-[#334155] bg-[#0F172A] text-white placeholder:text-[#64748B]'
                          : 'border-[#E2E8F0] bg-white text-[#1E293B] placeholder:text-[#94A3B8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => void handleFeedback(item.question, item.answerHint, idx)}
                      disabled={!answers[questionKey]?.trim() || feedbackLoadingKey === questionKey}
                      className="inline-flex h-9 items-center rounded-lg bg-[#7C3AED] px-3 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-50"
                    >
                      {feedbackLoadingKey === questionKey ? '피드백 생성 중' : 'AI 피드백 받기'}
                    </button>
                    {feedbackError && feedbackLoadingKey === null && (
                      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {feedbackError}
                      </p>
                    )}
                    {feedback && (
                      <div className={`rounded-lg border px-4 py-3 text-sm ${
                        isDarkMode ? 'border-[#4C1D95] bg-[#1E1B4B] text-[#DDD6FE]' : 'border-[#DDD6FE] bg-white text-[#334155]'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={isDarkMode ? 'font-bold text-white' : 'font-bold text-[#1E293B]'}>AI 피드백</p>
                          <span className="rounded-md bg-[#EDE9FE] px-2 py-0.5 text-xs font-semibold text-[#6D28D9]">
                            {feedback.score}점
                          </span>
                        </div>
                        <p className="mt-2 leading-6">{feedback.feedback}</p>
                        {feedback.missingKeyPoints.length > 0 && (
                          <div className="mt-3">
                            <p className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-[#1E293B]'}>보완할 포인트</p>
                            <ul className="mt-1 list-disc space-y-1 pl-5">
                              {feedback.missingKeyPoints.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.improvedAnswer && (
                          <div className={`mt-3 rounded-md p-3 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
                            <p className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-[#1E293B]'}>개선 답안</p>
                            <p className="mt-1 leading-6">{feedback.improvedAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {item.answerHint ? (
                    <div className="space-y-2">
                      <p className={`text-[12px] font-semibold ${
                        isDarkMode ? 'text-[#C4B5FD]' : 'text-[#6D28D9]'
                      }`}>
                        모범 답안 예시
                      </p>
                      <MarkdownTextView
                        content={item.answerHint}
                        isDarkMode={isDarkMode}
                        compact
                        className={isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}
                      />
                    </div>
                  ) : (
                    <p className={isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
                      모범 답안 예시가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
            );
          })
        ) : (
          <div className={`rounded-lg border p-6 text-center text-sm ${isDarkMode ? 'border-[#334155] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
