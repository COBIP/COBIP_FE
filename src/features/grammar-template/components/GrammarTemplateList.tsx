import { useState, useEffect } from 'react';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { grammarTemplateService } from '@/api/services/GrammarTemplateService';
import { useUserStore } from '@/store/UseUserStore';
import type { GrammarTemplateItem } from '@/features/grammar-template/Constants';
import { GrammarTemplateCard } from './GrammarTemplateCard';
import { Header } from '@/features/main-home/components/Header';

interface GrammarTemplateListProps {
  onSelectTemplate: (templateId: number) => void;
}

const DIFFICULTY_FILTERS = [
  { label: '전체', value: '' },
  { label: '초급', value: 'BEGINNER' },
  { label: '중급', value: 'INTERMEDIATE' },
  { label: '고급', value: 'ADVANCED' },
] as const;

export function GrammarTemplateList({ onSelectTemplate }: GrammarTemplateListProps) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [templates, setTemplates] = useState<GrammarTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

    /** API에서 템플릿 목록 불러오기 */
    useEffect(() => {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }

      let isCancelled = false;

    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const result = await grammarTemplateService.getTemplates({
          keyword: searchQuery || undefined,
          difficulty: activeFilter || undefined,
          page: 0,
          size: 50,
        });
        if (!isCancelled) {
          setTemplates(result.content);
        }
      } catch (err) {
        console.error('문법 템플릿 목록 조회 실패:', err);
        if (!isCancelled) setTemplates([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchTemplates();

        return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter]);

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
        {/* 필터 버튼 (난이도별) */}
        <div className="flex items-center gap-2 mb-8">
          {DIFFICULTY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

                {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">불러오는 중...</span>
          </div>
        )}

                {/* 템플릿 그리드 (4열) */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <GrammarTemplateCard
                key={template.id}
                template={template}
                onClick={onSelectTemplate}
              />
            ))}
          </div>
        )}

                {/* 결과 없음 */}
        {!isLoading && templates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
