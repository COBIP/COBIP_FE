export default function BlogTab() {
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