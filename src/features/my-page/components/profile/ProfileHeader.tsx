'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useUser'; // 혹은 파일명에 맞게 useAuth/useUser 임포트
import { getSafeProfileImageUrl } from '@/features/my-page/components/profile-edit/ProfileImageOptions';

export default function ProfileHeader() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-[180px] w-full bg-gray-100 rounded-[16px] animate-pulse"></div>;
    }

    const nickName = user?.nickname || "사용자 이름 없음";
    const profileImage = getSafeProfileImageUrl(user?.profileImageUrl);

    return (
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white border border-[#cbc3d7] rounded-[16px] shadow-[0px_4px_20px_rgba(18,18,18,0.04)]">
            
            {/* 왼쪽 영역: 프로필 이미지 + 닉네임 */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                
                {/* 1. 이미지 컨테이너: flex-shrink-0으로 찌그러짐 방지 */}
                <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-violet-100 ring-4 ring-white relative">
                        <Image
                            src={profileImage}
                            alt="프로필 이미지"
                            fill
                            loading="eager"
                            sizes="(max-width: 768px) 112px, 128px"
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute bottom-1 right-1 flex items-center justify-center w-8 h-8 bg-[#6938d6] text-white rounded-full border-2 border-white cursor-pointer hover:bg-[#8255f0]">
                        <Camera size={16} /> 
                    </div>
                </div>

                {/* 3. 닉네임 텍스트: leading-none으로 텍스트 여백을 없애서 시각적 중앙 정렬 */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-[#1c1b1b] leading-none translate-y-[2px]">
                        {nickName}
                    </h1>
                </div>
            </div>

            {/* 4. 버튼: flex-shrink-0 추가 */}
            <Link
                href="/my-page/profile/edit"
                className="flex items-center gap-2 px-6 h-12 flex-shrink-0 bg-[#6938d6] text-white rounded-[12px] text-[14px] font-semibold tracking-wide hover:bg-[#8255f0] transition-all active:scale-95 mt-4 md:mt-0"
            >
                <Edit2 size={18} />
                프로필 수정
            </Link>
            
        </section>
    );
}
