
'use client';

import type { TemplatePracticeMissionApiResponse } from '@/api/services/FunctionalTemplateService';

interface MissionSectionProps {
  isDarkMode?: boolean;
  onOpenEditor?: (fileName: string) => void;
  missions?: Array<TemplatePracticeMissionApiResponse & { fileName?: string }>;
}

export function MissionSection({ isDarkMode = false, onOpenEditor, missions }: MissionSectionProps) {
  const steps = missions && missions.length > 0
    ? missions.map((mission, index) => ({
        id: String(mission.id),
        title: `${index + 1}. ${mission.title}`,
        fileName: mission.fileName,
        summary: mission.description,
        explanation: mission.guideContent,
        validationJson: mission.validationJson,
      }))
    : [];

  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        미션/문제
      </h2>

      {steps.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className={`rounded-md border p-3 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="space-y-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => onOpenEditor?.(step.fileName ?? 'auth.ts')}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors duration-300 ${
                    isDarkMode
                      ? 'border-[#334155] bg-[#0F172A] text-[#CBD5E1] hover:bg-[#1E293B]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="text-[13px] font-semibold">{step.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed opacity-90">{step.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className={`rounded-md border p-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <p className={`text-[14px] leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
              }`}>
                미션 상세 내용은 API 응답에 포함된 값만 렌더링합니다.
              </p>
            </div>

            <div className={`rounded-md border p-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <h3 className={`mb-2 text-[15px] font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
              }`}>
                가이드
              </h3>
              <p className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                선택된 미션의 검증 조건은 백엔드 응답에 따라 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-md border px-4 py-8 text-center text-sm transition-colors duration-300 ${
          isDarkMode ? 'border-[#334155] bg-[#1E293B] text-[#94A3B8]' : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
        }`}>
          데이터 없음
        </div>
      )}
    </div>
  );
}