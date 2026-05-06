'use client';

import { useState } from 'react';

interface MissionSectionProps {
  isDarkMode?: boolean;
  onOpenEditor?: (fileName: string) => void;
}

export function MissionSection({ isDarkMode = false, onOpenEditor }: MissionSectionProps) {
  const steps = [
    {
      id: 'step1',
      title: '1. 빈칸 채우기',
      fileName: 'mission1.ts',
      summary: 'JWT의 header, payload, [ ] 구조를 익히는 입문 단계입니다.',
      explanation: 'JWT는 세 부분으로 구성되며, 빈칸을 채워 구조를 정확히 기억하는 것이 목표입니다.',
      snippet: `const parts = ['header', 'payload', ''];\n// TODO: 마지막 부분을 채워 JWT 구조를 완성하세요`,
      rows: [
        ['입력', '[header, payload, ?]'],
        ['출력', 'header.payload.signature'],
      ],
    },
    {
      id: 'step2',
      title: '2. 오류 찾기',
      fileName: 'mission2.ts',
      summary: 'exp 체크 로직의 방향이 잘못된 버그를 찾는 단계입니다.',
      explanation: '만료 여부는 현재 시간과 exp 값을 비교해야 하는데, 조건식이 반대로 작성된 예시를 확인합니다.',
      snippet: `if (exp > Date.now()) {\n  return true;\n}\n// TODO: 조건식 방향을 바로잡으세요`,
      rows: [
        ['문제', '만료 시간이 아직 남았는지 확인하는 조건 오류'],
        ['수정', 'Date.now() > exp 로 변경'],
      ],
    },
    {
      id: 'step3',
      title: '3. 코드 작성',
      fileName: 'auth.ts',
      summary: '실제 auth.ts의 verifyToken 함수를 구현하는 메인 미션입니다.',
      explanation: 'signature 검증, exp 체크, payload 복원을 모두 연결해야 합니다.',
      snippet: `export function verifyToken(token: string, secret: string) {\n  // TODO: token 분리\n  // TODO: signature 검증\n  // TODO: exp 만료 검사\n  // TODO: payload 반환\n}`,
      rows: [
        ['핵심', 'split(".") -> 검증 -> 디코딩 -> 반환'],
        ['결과', '유효한 payload 객체'],
      ],
    },
    {
      id: 'step4',
      title: '4. 심화 과제',
      fileName: 'mission4.ts',
      summary: 'refresh token과 role 기반 조건을 붙여 한 단계 확장합니다.',
      explanation: '검증된 payload를 실제 권한 처리와 결합해 보는 고급 단계입니다.',
      snippet: `const result = await advancedMission(token, secret);\n// TODO: role과 refresh flow를 확장하세요`,
      rows: [
        ['확장', '권한(role) 확인, refresh flow, 에러 분기'],
        ['완성', '검증 후 부가 정책 연결'],
      ],
    },
  ] as const;

  const [activeStep, setActiveStep] = useState<(typeof steps)[number]>(steps[2]);

  const handleOpenEditor = () => {
    onOpenEditor?.(activeStep.fileName);
  };

  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        미션/문제
      </h2>

      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className={`rounded-md border p-3 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="space-y-2">
            {steps.map((step) => {
              const isActive = activeStep.id === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors duration-300 ${
                    isActive
                      ? isDarkMode
                        ? 'border-[#7C3AED] bg-[#2D1B69] text-white'
                        : 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                      : isDarkMode
                      ? 'border-[#334155] bg-[#0F172A] text-[#CBD5E1] hover:bg-[#1E293B]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="text-[13px] font-semibold">{step.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed opacity-90">{step.summary}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className={`rounded-md border p-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="mb-2 flex items-start gap-2.5">
              <span className={`text-[18px] font-bold shrink-0 transition-colors duration-300 ${
                isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
              }`}>
                {activeStep.title}
              </span>
            </div>
            <p className={`text-[14px] leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
            }`}>
              {activeStep.explanation}
            </p>
          </div>

          <div className={`rounded-md border p-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <h3 className={`mb-2 text-[15px] font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
            }`}>
              code
            </h3>
            <pre className={`overflow-x-auto rounded-md border p-3 text-[13px] leading-relaxed ${
              isDarkMode ? 'border-[#334155] bg-[#0F172A] text-[#E2E8F0]' : 'border-[#E2E8F0] bg-white text-[#1E293B]'
            }`}>
              <code>{activeStep.snippet}</code>
            </pre>
          </div>

          <div className={`rounded-md border p-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <h3 className={`mb-2 text-[15px] font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
            }`}>
              입출력 예시
            </h3>
            <table className={`w-full text-[13px] ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
              <tbody>
                {activeStep.rows.map(([left, right]) => (
                  <tr key={left} className={`border-t ${isDarkMode ? 'border-[#334155]' : 'border-[#E2E8F0]'}`}>
                    <td className="w-24 py-2 font-semibold">{left}</td>
                    <td className="py-2">{right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleOpenEditor}
            className={`inline-flex items-center rounded-md px-3 py-2 text-[13px] font-semibold shadow-sm transition-all duration-300 ${
              isDarkMode
                ? 'bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[#7C3AED]/25 hover:-translate-y-px hover:shadow-md'
                : 'bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[#7C3AED]/20 hover:-translate-y-px hover:shadow-md'
            }`}
          >
            코드 에디터 열고 도전하기
          </button>
        </div>
      </div>
    </div>
  );
}