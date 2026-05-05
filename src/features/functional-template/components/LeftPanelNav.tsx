'use client';

interface LeftPanelNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'design-intent', label: '설계의도' },
  { id: 'structure', label: '구조설명' },
  { id: 'requirements', label: '요구사항' },
  { id: 'mission', label: '미션/문제' },
  { id: 'interview', label: '면접질문' },
];

export function LeftPanelNav({ activeTab, onTabChange }: LeftPanelNavProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200 px-6 py-3 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
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
