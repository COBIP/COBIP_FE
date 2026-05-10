import axiosInstance from '@/api/AxiosInstance';
import { type UserProfile } from '@/types/UserTypes';

export const authService = {
    // 내 프로필 가져오기
    getMyProfile: async (token: string): Promise<UserProfile> => {
        const response = await axiosInstance.get('/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    },

    // 추후 로그인, 회원가입 API도 여기에 추가하면 깔끔합니다!
};
