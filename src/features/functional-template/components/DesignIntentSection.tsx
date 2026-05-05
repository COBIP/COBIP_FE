"use client";

interface DesignIntentSectionProps {
  isDarkMode?: boolean;
}

export function DesignIntentSection({ isDarkMode = false }: DesignIntentSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className={`text-[20px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        설계의도
      </h2>

      <div className={`rounded-[8px] border p-4 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}>
        <p className={`text-[14px] leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
        }`}>
          인증 아키텍처에서 JWT는 서버 확장성과 응답 속도 측면에서 유리하지만, 토큰 탈취와 만료 정책 관리라는 운영상의 부담이 함께 존재합니다. 이 레슨은 JWT의 장점과 단점을 함께 살피고, Refresh Token으로 보완하는 구조를 설명합니다.
        </p>

        <p className={`mt-3 text-[14px] leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'
        }`}>
          실무에서는 로그인 직후의 빠른 응답, 상태 비저장 서버, 토큰 재발급 흐름이 동시에 맞물려야 합니다. 따라서 본 구성은 보안과 사용자 경험의 균형을 맞추는 최소 단위의 인증 패턴을 보여줍니다.
        </p>

        <div className={`mt-4 rounded-[8px] border-l-4 border-[#7C3AED] p-3 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#334155]' : 'bg-purple-50'
        }`}>
          <p className={`text-[13px] font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-[#CBD5E1]' : 'text-[#7C3AED]'
          }`}>
            💡 주요 이점
          </p>
          <ul className={`mt-2 space-y-1 text-[13px] transition-colors duration-300 ${
            isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
          }`}>
            <li>✓ 토큰 탈취 시 제한된 손상 범위</li>
            <li>✓ 상태 비저장(Stateless) 서버 운영 가능</li>
            <li>✓ 마이크로서비스 아키텍처 지원</li>
            <li>✓ 자동 만료 및 재발급 로직 구현 용이</li>
          </ul>
        </div>
      </div>
    </div>
  );
}