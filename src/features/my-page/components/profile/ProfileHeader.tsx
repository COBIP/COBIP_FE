import Image from 'next/image';

interface ProfileHeaderProps {
    nickName: string;
    profileImage: string;
}

export default function ProfileHeader({ nickName, profileImage }: ProfileHeaderProps) {
    return (
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white border border-[#cbc3d7] rounded-[16px] shadow-[0px_4px_20px_rgba(18,18,18,0.04)]">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-violet-100 ring-4 ring-white">
                        <Image 
                            src={profileImage || "https://placehold.jp/150x150.png"} 
                            alt="프로필 이미지"
                            width={150} // 실제 표시될 가로 크기
                            height={150} // 실제 표시될 세로 크기
                            className="rounded-full" // 기존 스타일 유지
                        />                      
                    </div>
                    <div className="absolute bottom-1 right-1 flex items-center justify-center w-8 h-8 bg-[#6938d6] text-white rounded-full border-2 border-white cursor-pointer hover:bg-[#8255f0]">
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    </div>
                </div>
                <div>
                    <h1 className="text-[32px] font-bold tracking-tight text-[#1c1b1b]">{nickName}</h1>
                </div>
            </div>
            <button className="flex items-center gap-2 px-6 h-12 bg-[#6938d6] text-white rounded-[12px] text-[14px] font-semibold tracking-wide hover:bg-[#8255f0] transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">edit</span>
                프로필 수정
            </button>
        </section>
    );
};