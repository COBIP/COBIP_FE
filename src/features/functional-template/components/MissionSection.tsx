'use client';

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
  missions?: Array<TemplatePracticeMissionApiResponse & { fileName?: string }>;
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
  missions,
}: MissionSectionProps) {
  const steps = missions && missions.length > 0
    ? missions.map((mission, index) => ({
        id: mission.id,
        title: `${index + 1}. ${mission.title}`,
        fileName: mission.fileName,
        summary: mission.description,
        explanation: mission.guideContent,
        missionType: mission.missionType ?? mission.type,
      }))
    : [];
  const selectedStep = steps.find((step) => step.id === activeMissionId) ?? steps[0];
  const guideTitle = learningType === 'problem' ? '문제 풀이 방식' : '미션 수행 방식';
  const guideText = learningType === 'problem'
    ? '문제를 선택하면 연결된 파일이 코드 실행기에 열립니다. 객관식, 빈칸, 단답형처럼 빠르게 풀며 이해도를 점검해보세요.'
    : '미션을 선택하면 연결된 실습 파일이 코드 실행기에 열립니다. 안내와 완료 조건을 확인한 뒤 실제 기능을 구현하고 제출해보세요.';
  const detailTitle = learningType === 'problem' ? '풀이 가이드' : '미션 가이드';

  return (
    <div className="space-y-4">
      <h2 className={`text-[22px] font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm leading-6 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
          {description}
        </p>
      )}

      {steps.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div
            className={`rounded-md border p-3 transition-colors duration-300 ${
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
                    className={`w-full rounded-md border px-3 py-3 text-left transition-colors duration-300 ${
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
                      <span className="text-[13px] font-semibold">{step.title}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-[#7C3AED]/10 text-[#7C3AED]'
                        }`}
                      >
                        {isCompleted ? '완료' : actionLabel}
                      </span>
                    </div>
                    {step.summary && <p className="mt-1 text-[12px] leading-relaxed opacity-90">{step.summary}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-md border p-4 transition-colors duration-300 ${
                isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
              }`}
            >
              <h3 className="mb-2 text-[15px] font-semibold text-[#7C3AED]">{guideTitle}</h3>
              <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'}`}>
                {guideText}
              </p>
            </div>

            <div
              className={`rounded-md border p-4 transition-colors duration-300 ${
                isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
              }`}
            >
              <h3 className="mb-2 text-[15px] font-semibold text-[#7C3AED]">{detailTitle}</h3>
              <div className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                {selectedStep?.explanation ? (
                  <MarkdownTextView content={selectedStep.explanation} isDarkMode={isDarkMode} />
                ) : (
                  <p>관리자 실습 관리에서 guideContent를 입력하면 여기에 표시됩니다.</p>
                )}
              </div>
            </div>
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
