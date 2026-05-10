import { type TokenRole } from '@/utils/AuthToken';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    nickname?: string;
    profileImageUrl?: string | null;
    role?: TokenRole;
}
