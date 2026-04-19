import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 템플릿 슬라이더 컴포넌트
 * 
 * 디자인: 좌우 화살표를 가진 회전식 템플릿 카드
 * - 부드러운 스크롤 애니메이션 (0.4초 ease-in-out)
 * - 호버 효과 (스케일 1 → 1.02, 그림자 강화)
 */

interface Template {
  id: number;
  title: string;
  category: string;
  rating: number;
}

interface TemplateSliderProps {
  templates: Template[];
}

export default function TemplateSlider({ templates }: TemplateSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // 템플릿 카드 너비 + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <div className="relative">
      {/* 좌측 화살표 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 md:-ml-6 bg-white rounded-full p-2 shadow-lg hover:shadow-xl hover:bg-secondary transition"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
      )}

      {/* 슬라이더 컨테이너 */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {templates.map(template => (
          <div
            key={template.id}
            className="flex-shrink-0 w-72 group cursor-pointer"
          >
            {/* 템플릿 카드 */}
            <div className="h-48 bg-primary rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <div className="text-sm font-medium opacity-75">Template</div>
                <div className="text-lg font-bold">{template.id}</div>
              </div>
            </div>

            {/* 템플릿 정보 */}
            <div className="mt-3 px-1">
              <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                {template.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                  {template.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  ⭐ {template.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 우측 화살표 */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 md:-mr-6 bg-white rounded-full p-2 shadow-lg hover:shadow-xl hover:bg-secondary transition"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      )}
    </div>
  );
}
