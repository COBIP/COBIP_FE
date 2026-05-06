import { Clapperboard, UploadCloud , VideoOff } from 'lucide-react';

export default function ClipTab() {
    return (
        <div className="flex flex-col flex-1 p-6">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <Clapperboard size={24} className="text-[#6938d6]"/>
                    <h3 className="text-[24px] font-semibold text-[#1c1b1b]">클립</h3>
                </div>
                <button className="flex items-center gap-2 text-[#6938d6] hover:bg-violet-50 px-4 py-2 rounded-lg text-[14px] font-semibold">
                    <UploadCloud size={20}/>
                    업로드
                </button>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center py-12 text-center bg-[#fcf9f8] border-2 border-dashed border-[#cbc3d7]/50 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-[#f0edec] rounded-full">
                    <VideoOff size={30}/>
                </div>
                <h4 className="text-[24px] font-semibold text-[#1c1b1b] mb-1">등록된 클립이 없습니다</h4>
                <p className="max-w-sm text-[16px] font-normal text-[#494454]">당신의 멋진 순간을 짧은 영상으로 공유해보세요.</p>
            </div>
        </div>
    );
}