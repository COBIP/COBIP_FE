"use client";

interface RequirementsSectionProps {
  isDarkMode?: boolean;
}

export function RequirementsSection({ isDarkMode = false }: RequirementsSectionProps) {
  const requirements = [
    { num: 1, title: '8자리 이상 비밀번호 필수', desc: '대문자, 소문자, 숫자, 특수문자 포함' },
    { num: 2, title: '소셜 로그인 연동', desc: 'Google, GitHub, Naver OAuth 2.0 지원' },
    { num: 3, title: '토큰 만료 시 자동 재발급 로직 구현', desc: '백그라운드에서 Refresh Token 자동 갱신' },
  ];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        요구사항
      </h2>

      <div className="space-y-4">
        {requirements.map((req) => (
          <div key={req.num} className={`p-6 rounded-lg border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#1E293B] border-[#334155]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shrink-0 transition-colors duration-300 bg-[#7C3AED]`}>
                {req.num}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-[#1E293B]'
                }`}>
                  {req.title}
                </h3>
                <p className={`text-sm mt-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}>
                  {req.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}