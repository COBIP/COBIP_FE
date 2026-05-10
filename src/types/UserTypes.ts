import { type TokenRole } from '@/utils/AuthToken';

export interface UserProfile {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    role: TokenRole;
    createdAt: string;
    updatedAt?: string;
}
