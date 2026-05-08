const FILTER_CATEGORIES = [
    { id: 'testType', label: '테스트 구분', options: ['전체', '기본 코딩테스트', '실무 코드테스트', '대기업 코딩 테스트'] },
    { id: 'difficulty', label: '난이도', options: ['전체', '입문', '초급', '중급', '고급'] },
    { id: 'language', label: '언어', options: ['전체', 'Spring', 'Java', 'React', 'Kotlin', 'Vue.js', 'Nest', 'Python'] },
    { id: 'type', label: '유형', options: ['전체', '구현', '문자열', '배열', '정렬', 'DFS/BFS', 'DP', 'SQL'] },
];

// 부모(page.tsx)한테서 받을 속성(Props) 정의
interface CodingTestFilterProps {
    selectedFilters: { [key: string]: string };
    onFilterChange: (categoryId: string, option: string) => void;
}

const getBorderColor = (id: string) => {
    switch (id) {
        case 'testType': return 'border-blue-500';
        case 'difficulty': return 'border-emerald-500';
        case 'language': return 'border-violet-500';
        case 'type': return 'border-amber-500';
        default: return 'border-gray-300';
    }
};

export const CodingTestFilter = ({ selectedFilters, onFilterChange }: CodingTestFilterProps) => {
    return (
        <>
            {/* 상단 헤더 & 검색 바 */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">코딩 테스트 연습</h1>
                    <p className="text-lg text-gray-600">다양한 언어와 알고리즘 문제를 통해 실력을 향상시키세요.</p>
                </div>
                    <div className="w-full md:w-80 relative group">
                <input 
                    className="w-full h-11 pl-11 pr-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 transition-all shadow-sm" 
                    placeholder="문제 제목 또는 번호 검색" 
                    type="text"
                />
                    <svg className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* 가로형 다중 필터 시스템 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 flex flex-col gap-4 shadow-sm">
                {FILTER_CATEGORIES.map((category, index) => (
                    <div 
                        key={category.id} 
                        className={`flex flex-col md:flex-row md:items-center gap-4 ${index !== FILTER_CATEGORIES.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
                    >

                        {/* 카테고리 제목: 좌측 보더 포인트 추가 */}
                        <div className={`w-32 flex-shrink-0 border-l-4 pl-3 ${getBorderColor(category.id)}`}>
                            <span className="text-sm font-bold text-gray-800">{category.label}</span>
                        </div>
                                                
                        <div className="flex flex-wrap gap-2">
                            {category.options.map((option) => {

                                // 현재 내 카테고리의 선택된 값이 이 버튼의 값과 같은지 확인
                                const isSelected = selectedFilters[category.id] === option;
                                
                                return (
                                    <button 
                                        key={option} 
                                        onClick={() => onFilterChange(category.id, option)} // 클릭하면 부모한테 알려줌
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                        isSelected 
                                            ? 'bg-violet-600 text-white' // 선택됐을 때 보라색
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700' // 안 선택됐을 때 회색
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};