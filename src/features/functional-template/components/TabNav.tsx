'use client';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
  onMarkComplete?: () => void;
}

export function TabNav({ activeTab, onTabChange, isDarkMode = false, onMarkComplete }: TabNavProps) {
  const tabs = [
    { id: 'design-intent', label: '설계의도' },
    { id: 'structure', label: '구조설명' },
    { id: 'requirements', label: '요구사항' },
    { id: 'mission', label: '미션/문제' },
    { id: 'interview', label: '면접질문' },
  ];

  return (
    <div
      className={`flex items-center justify-between px-6 py-3 border-b transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#0F172A] border-[#334155]'
          : 'bg-white border-[#F1F5F9]'
      }`}
    >
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative font-medium text-sm transition-all duration-300 pb-3 ${
              activeTab === tab.id
                ? 'text-[#7C3AED]'
                : isDarkMode
                ? 'text-[#94A3B8] hover:text-white'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onMarkComplete}
        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shrink-0 ml-6 ${
          isDarkMode
            ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
        }`}
      >
        학습 완료
      </button>
    </div>
  );
}
