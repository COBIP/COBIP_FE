'use client'; // 클릭 등 상호작용이 들어갈 수 있으므로 클라이언트 컴포넌트 처리

export const CodingTestSidebar = () => {
    return (
        <aside className="w-64 flex-shrink-0 border-r border-outline-variant pr-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-h3 font-h3 text-on-surface">목차</h2>
            <span className="material-symbols-outlined cursor-pointer">close</span>
        </div>

        <ul className="space-y-2 mb-6 border-b border-outline-variant pb-6">
            <li className="bg-surface-variant p-2 rounded-md font-bold cursor-pointer">
            1. 기본 코딩테스트
            </li>
            <li className="p-2 hover:bg-surface-container-low rounded-md cursor-pointer">
            2. 실무 코드테스트
            </li>
            <li className="p-2 hover:bg-surface-container-low rounded-md cursor-pointer">
            3. 대기업 코딩테스트
            </li>
        </ul>

        {/* 난이도 필터 */}
        <div className="mb-6 border-b border-outline-variant pb-6">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
            <h3 className="font-h3 text-body-lg">난이도</h3>
            <span className="material-symbols-outlined">expand_more</span>
            </div>
            <div className="space-y-2 flex flex-col pl-2">
            {['입문', '초급', '중급', '고급'].map((level) => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox text-primary rounded" />
                <span>{level}</span>
                </label>
            ))}
            </div>
        </div>

        {/* 언어 필터 */}
        <div className="mb-6 border-b border-outline-variant pb-6">
            <div className="flex justify-between items-center mb-3 cursor-pointer">
            <h3 className="font-h3 text-body-lg">언어</h3>
            <span className="material-symbols-outlined">expand_more</span>
            </div>
            <div className="space-y-2 flex flex-col pl-2">
            {['Python', 'Java', 'JavaScript', 'C++'].map((lang) => (
                <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox text-primary rounded" />
                <span>{lang}</span>
                </label>
            ))}
            </div>
        </div>

        {/* 유형 필터 */}
        <div>
            <div className="flex justify-between items-center mb-3 cursor-pointer">
            <h3 className="font-h3 text-body-lg">유형</h3>
            <span className="material-symbols-outlined">expand_more</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-2">
            {['구현', 'DFS/BFS', '문자열', 'DP', '배열', 'SQL', '정렬'].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox text-primary rounded" />
                <span className="text-sm">{type}</span>
                </label>
            ))}
            </div>
        </div>
        </aside>
    );
};