"use client";

interface StructureSectionProps {
  isDarkMode?: boolean;
}

export function StructureSection({ isDarkMode = false }: StructureSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        구조설명
      </h2>

      <div className={`p-6 rounded-lg border transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}>
        <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
        }`}>
          AuthService를 통한 비즈니스 로직 분리
        </h3>
        <p className={`text-base leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
        }`}>
          인증 로직을 별도의 <span className="font-semibold">AuthService</span> 클래스로 분리하여 코드 재사용성과 유지보수성을 극대화합니다.
        </p>
      </div>

      <div className={`p-6 rounded-lg border transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}>
        <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'
        }`}>
          미들웨어를 이용한 세션 검증 로직
        </h3>
        <div className={`space-y-3 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
        }`}>
          <p className="flex items-start gap-3">
            <span className="font-bold text-[#7C3AED] shrink-0">1.</span>
            <span>클라이언트 요청 → 미들웨어에서 Token 검증</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="font-bold text-[#7C3AED] shrink-0">2.</span>
            <span>Token이 유효하면 AuthService.verifyToken() 실행</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="font-bold text-[#7C3AED] shrink-0">3.</span>
            <span>Token 만료 시 Refresh Token으로 재발급</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="font-bold text-[#7C3AED] shrink-0">4.</span>
            <span>모든 검증 통과 후 API 엔드포인트 실행</span>
          </p>
        </div>
      </div>
    </div>
  );
}