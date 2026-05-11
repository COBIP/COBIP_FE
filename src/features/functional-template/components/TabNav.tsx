'use client';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
}

const tabs = [
  { id: 'design-intent', label: '설계의도' },
  { id: 'structure', label: '구조설명' },
  { id: 'requirements', label: '요구사항' },
  { id: 'mission', label: '미션' },
  { id: 'problem', label: '문제' },
  { id: 'interview', label: '면접질문' },
];

export function TabNav({ activeTab, onTabChange, isDarkMode = false }: TabNavProps) {
  return (
    <div
      className={`flex items-center border-b px-6 transition-colors duration-300 ${
        isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-[#F1F5F9] bg-white'
      }`}
    >
      <div className="flex gap-7 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative h-12 shrink-0 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-[#7C3AED]'
                : isDarkMode
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#7C3AED]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
