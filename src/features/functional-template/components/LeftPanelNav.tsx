'use client';

interface LeftPanelNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'requirements', label: '요구사항' },
  { id: 'flow', label: '흐름/구조' },
  { id: 'api-spec', label: 'API 명세' },
  { id: 'source-code', label: '전체 코드' },
  { id: 'problem', label: '문제' },
  { id: 'mission', label: '미션' },
  { id: 'core-question', label: '핵심 질문' },
  { id: 'next-recommendation', label: '다음 추천' },
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
