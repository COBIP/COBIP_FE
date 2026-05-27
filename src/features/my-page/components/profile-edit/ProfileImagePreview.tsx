'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface ProfileImagePreviewProps {
  imageUrl: string;
  nickname: string;
}

export function ProfileImagePreview({ imageUrl, nickname }: ProfileImagePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-7">
      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-sm">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${nickname || '사용자'} 프로필 이미지`}
            fill
            loading="eager"
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <User className="h-14 w-14 text-gray-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">{nickname || '닉네임 미입력'}</p>
        <p className="mt-1 text-xs text-gray-500">이미지 URL을 입력하면 미리보기가 바뀝니다.</p>
      </div>
    </div>
  );
}
