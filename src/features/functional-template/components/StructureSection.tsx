"use client";

interface StructureSectionProps {
  isDarkMode?: boolean;
  content?: string;
}

export function StructureSection({ isDarkMode = false, content }: StructureSectionProps) {
  const sections = content
    ? content.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    : [];

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
        {sections.length > 0 ? (
          <div className={`space-y-3 text-base leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-[#E2E8F0]' : 'text-[#1E293B]'
          }`}>
            {sections.map((section) => (
              <p key={section}>{section}</p>
            ))}
          </div>
        ) : (
          <div className={`flex min-h-32 items-center justify-center text-sm ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}