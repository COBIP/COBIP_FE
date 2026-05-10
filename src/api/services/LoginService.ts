import axiosInstance from '@/api/AxiosInstance';
import { type TokenRole } from '@/utils/AuthToken';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    nickname?: string;
    profileImageUrl?: string | null;
    role?: TokenRole;
}

export const loginAPI = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/api/v1/auth/login', data);

    if (response.data?.data) {
        return response.data.data;
    }

    throw new Error('로그인 응답이 올바르지 않습니다.');
};
