import { useEffect, useState } from 'react';
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
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [templates, setTemplates] = useState<GrammarTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

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
      } catch (error) {
        console.error('문법 템플릿 목록 조회 실패:', error);
        if (!isCancelled) {
          setTemplates([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchTemplates();

    return () => {
      isCancelled = true;
    };
  }, [activeFilter, isLoggedIn, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <header className="border-b border-[#E2E8F0] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#7C3AED]" />
                <h1 className="text-[28px] font-bold tracking-tight text-[#1E293B]">문법 템플릿</h1>
              </div>
              <p className="text-sm text-[#64748B]">
                문법 개념을 챕터별로 학습하고 코드 실행과 제출 흐름으로 바로 확인해보세요.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="템플릿 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#1E293B] transition placeholder:text-[#94A3B8] focus:border-[#C4B5FD] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {DIFFICULTY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                activeFilter === filter.value
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white shadow-sm'
                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#D8B4FE] hover:bg-[#F8FAFC]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
            <span className="ml-2 text-sm text-[#64748B]">불러오는 중...</span>
          </div>
        ) : null}

        {!isLoading && templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <GrammarTemplateCard
                key={template.id}
                template={template}
                onClick={onSelectTemplate}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#64748B]">검색 결과가 없습니다.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
