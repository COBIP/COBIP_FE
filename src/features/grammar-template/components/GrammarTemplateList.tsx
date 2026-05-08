import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { GRAMMAR_TEMPLATES } from '@/features/grammar-template/Constants';
import { GrammarTemplateCard } from './GrammarTemplateCard';
import { Header } from '@/features/main-home/components/Header';

interface GrammarTemplateListProps {
  onSelectTemplate: (templateId: string) => void;
}

const FILTERS = ['전체', '인기', '추천', '신규'] as const;
type Filter = typeof FILTERS[number];

export function GrammarTemplateList({ onSelectTemplate }: GrammarTemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('전체');

  const filteredTemplates = GRAMMAR_TEMPLATES.filter((t) => {
    // 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q) &&
        !t.tags.some((tag) => tag.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    // 필터 버튼
    if (activeFilter === '인기') return t.badge === '인기';
    if (activeFilter === '추천') return t.badge === '추천';
    if (activeFilter === '신규') return t.badge === '신규';
    return true; // 전체
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 메인 페이지와 동일한 헤더 */}
      <Header />

      {/* 페이지 타이틀 */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  문법 템플릿
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                언어별 문법을 체계적으로 학습하고 코드 실행 흐름을 시각화해보세요.
              </p>
            </div>

            {/* 검색창 */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="템플릿 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* 필터 버튼 */}
        <div className="flex items-center gap-2 mb-8">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 템플릿 그리드 (4열) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <GrammarTemplateCard
              key={template.id}
              template={template}
              onClick={onSelectTemplate}
            />
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
