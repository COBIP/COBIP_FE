import axiosInstance from '@/api/AxiosInstance';
import { type UserProfile } from '@/types/UserTypes';

export const authService = {
    getMyProfile: async (token?: string): Promise<UserProfile> => {
        const response = await axiosInstance.get('/api/v1/users/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        return response.data.data;
    },
};
