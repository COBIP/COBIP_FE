'use client';

interface LeftPanelNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'design-intent', label: '설계의도' },
  { id: 'structure', label: '구조설명' },
  { id: 'requirements', label: '요구사항' },
  { id: 'mission', label: '미션' },
  { id: 'problem', label: '문제' },
  { id: 'interview', label: '면접질문' },
];

export function LeftPanelNav({ activeTab, onTabChange }: LeftPanelNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-gray-200 px-6 py-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
