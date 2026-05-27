'use client';

import Image from 'next/image';
import { PROFILE_IMAGE_OPTIONS } from '@/features/my-page/components/profile-edit/ProfileImageOptions';

interface ProfileImageSelectorProps {
  selectedImageUrl: string;
  isSaving: boolean;
  onImageSelect: (imageUrl: string) => void;
}

export function ProfileImageSelector({
  selectedImageUrl,
  isSaving,
  onImageSelect,
}: ProfileImageSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800">프로필 이미지</p>
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {PROFILE_IMAGE_OPTIONS.map((option) => {
          const isSelected = selectedImageUrl === option.src;

          return (
            <button
              key={option.src}
              type="button"
              onClick={() => onImageSelect(option.src)}
              disabled={isSaving}
              className={`flex flex-col items-center gap-2 rounded-md border p-3 text-xs font-semibold transition ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Image
                src={option.src}
                alt={`${option.label} 프로필 이미지`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        public/profile에 준비된 이미지 중 하나를 선택합니다.
      </p>
    </div>
  );
}
