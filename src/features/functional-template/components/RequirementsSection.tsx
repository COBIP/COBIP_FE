"use client";

interface RequirementsSectionProps {
  isDarkMode?: boolean;
  content?: string;
}

export function RequirementsSection({ isDarkMode = false, content }: RequirementsSectionProps) {
  const requirements = content
    ? content.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-[#1E293B]'
      }`}>
        요구사항
      </h2>

      <div className="space-y-4">
        {requirements.length > 0 ? (
          requirements.map((req, index) => (
            <div key={req} className={`p-6 rounded-lg border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shrink-0 transition-colors duration-300 bg-[#7C3AED]`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-[#1E293B]'
                  }`}>
                    {req}
                  </h3>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`rounded-lg border p-6 text-center text-sm ${isDarkMode ? 'border-[#334155] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}