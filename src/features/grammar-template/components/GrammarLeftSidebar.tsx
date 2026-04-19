import { BookOpen, Target } from 'lucide-react';

interface GrammarLeftSidebarProps {
  currentTopic: string;
}

export function GrammarLeftSidebar({ currentTopic }: GrammarLeftSidebarProps) {
  const topics = [
    { id: 'variables', title: '변수 선언' },
    { id: 'conditions', title: '조건문' },
    { id: 'loops', title: '반복문' },
    { id: 'functions', title: '함수' },
  ];

  const currentTopicData = topics.find((t) => t.id === currentTopic);

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">학습 목차</h3>
        </div>
        <nav className="space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`w-full text-left px-4 py-3 rounded-lg transition text-sm ${
                currentTopic === topic.id
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">현재 목표</h3>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900 leading-relaxed">
            {currentTopicData?.title}에 대해 배우고 실습합니다. 코드를 직접 작성하고 실행 결과를 확인해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}