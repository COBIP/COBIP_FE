import { CheckCircle2, Circle } from 'lucide-react';

interface GrammarLeftSidebarProps {
  currentTopic?: string;
  activeLevel?: string;
  onLevelChange?: (level: string) => void;
}

export function GrammarLeftSidebar({
  currentTopic = 'variables',
  activeLevel,
  onLevelChange,
}: GrammarLeftSidebarProps) {
  const selectedTopic = activeLevel || currentTopic;
  const topics = [
    { id: 'variables', label: '변수 선언', completed: true },
    { id: 'conditions', label: '조건문', completed: true },
    { id: 'loops', label: '반복문', completed: false },
    { id: 'functions', label: '함수', completed: false },
  ];

  return (
    <div className="flex h-full w-56 flex-col space-y-6 border-r border-gray-200 bg-white p-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">학습 목차</h3>
        <nav className="space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onLevelChange?.(topic.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                selectedTopic === topic.id
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {topic.completed ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={18} className="text-gray-400 shrink-0" />
              )}
              <span className="text-sm">{topic.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-bold text-gray-900">현재 단계 목표</h3>
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-900">반복문 기초</p>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• for 루프 이해</li>
            <li>• 변수 상태 추적</li>
            <li>• 배열 순회</li>
          </ul>
        </div>
      </div>
    </div>
  );
}