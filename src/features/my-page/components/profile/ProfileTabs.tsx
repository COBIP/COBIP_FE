'use client';

import { useState } from 'react';

export default function ProfileTabs() {
    const [activeTab, setActiveTab] = useState('홈');
    const tabs = ['홈', '클립', '로드맵', '게시글', '블로그'];


    const renderContent = () => {
        switch (activeTab) {
            case '홈':
                return <Home />;
            case '클립':
                return <Clip />;
            case '로드맵':
                return <Roadmap />;
            case '게시글':
                return <Post />;
            case '블로그':
                return <Blog />;
            default:
                return <Home />;
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-white border border-[#cbc3d7] rounded-[16px] shadow-[0px_4px_20px_rgba(18,18,18,0.04)] overflow-hidden"> 
            <div className="flex px-4 border-b border-[#cbc3d7] overflow-x-auto shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-[14px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
                        activeTab === tab 
                            ? "text-[#6938d6] border-b-2 border-[#6938d6]" 
                            : "text-[#494454] hover:text-[#1c1b1b]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            {/* 카테고리 */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

function Home(){
    return(
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6938d6]">info</span>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">소개</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    작성하기
                </button>
            </div>
            
            <div className="flex flex-col flex-1 items-center justify-center py-8 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <span className="material-symbols-outlined text-[30px] text-[#494454]/40">edit_note</span>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">소개글이 비어있어요</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">
                    나만의 스킬, 깃허브 링크 등으로 소개글을 채워보세요.
                </p>
            </div>
        </div>
    );
}

function Clip() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6938d6]">movie</span>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">클립</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]">video_call</span>
                    업로드
                </button>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center py-12 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <span className="material-symbols-outlined text-[30px] text-[#494454]/40">movie_off</span>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">등록된 클립이 없습니다</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">당신의 멋진 순간을 짧은 영상으로 공유해보세요.</p>
            </div>
        </div>
    );
}

/* --- 3. 로드맵 컴포넌트 --- */
function Roadmap() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6938d6]">map</span>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">로드맵</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]">add_road</span>
                    설계하기
                </button>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center py-12 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <span className="material-symbols-outlined text-[30px] text-[#494454]/40">route</span>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">생성된 로드맵이 없습니다</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">목표를 향한 나만의 학습 경로를 시각화해보세요.</p>
            </div>
        </div>
    );
}

/* --- 4. 게시글 컴포넌트 --- */
function Post() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6938d6]">article</span>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">게시글</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    글쓰기
                </button>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center py-12 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <span className="material-symbols-outlined text-[30px] text-[#494454]/40">history_edu</span>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">작성한 게시글이 없습니다</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">다양한 주제로 사람들과 소통을 시작해보세요.</p>
            </div>
        </div>
    );
}

/* --- 5. 블로그 컴포넌트 --- */
function Blog() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6938d6]">rss_feed</span>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">블로그</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]">post_add</span>
                    포스팅
                </button>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center py-12 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <span className="material-symbols-outlined text-[30px] text-[#494454]/40">menu_book</span>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">블로그 포스트가 없습니다</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">학습 기록이나 기술적인 통찰을 기록해보세요.</p>
            </div>
        </div>
    );
}