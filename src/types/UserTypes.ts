// src/types/UserTypes.ts
import { type TokenRole } from '@/utils/AuthToken';

export interface UserProfile {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    role: TokenRole;
    createdAt: string;
}

// ✨ 프로필 수정 요청용 타입 추가
export interface MyProfileUpdateRequest {
    nickname: string;
    profileImageUrl: string | null;
}