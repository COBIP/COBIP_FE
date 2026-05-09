import axios from 'axios';
import { type UserProfile } from '@/types/UserTypes';

const API_URL = 'http://localhost:8080/api/v1/users';

export const authService = {
    // 내 프로필 가져오기
    getMyProfile: async (token: string): Promise<UserProfile> => {
        const response = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    },

    // 추후 로그인, 회원가입 API도 여기에 추가하면 깔끔합니다!
};