'use client';

import BlogTab from '@/features/my-page/components/profile/tabs/BlogTab'
import HomeTab from '@/features/my-page/components/profile/tabs/HomeTab'
import PostTab from '@/features/my-page/components/profile/tabs/PostTab'
import ClipTab from '@/features/my-page/components/profile/tabs/ClipTab'
import RoadmapTab from '@/features/my-page/components/profile/tabs/RoadmapTab'


import { useState } from 'react';

export default function ProfileTabs() {
    const [activeTab, setActiveTab] = useState('홈');
    const tabs = ['홈', '클립', '로드맵', '게시글', '블로그'];


    const renderContent = () => {
        switch (activeTab) {
            case '홈':
                return <HomeTab />;
            case '클립':
                return <ClipTab />;
            case '로드맵':
                return <RoadmapTab />;
            case '게시글':
                return <PostTab />;
            case '블로그':
                return <BlogTab />;
            default:
                return <HomeTab />;
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