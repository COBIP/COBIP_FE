import axiosInstance from '@/api/AxiosInstance';
import { type UserProfile, type UserProfileUpdatePayload } from '@/types/UserTypes';

export const authService = {
    getMyProfile: async (token?: string): Promise<UserProfile> => {
        const response = await axiosInstance.get('/api/v1/users/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        return response.data.data;
    },

    updateMyProfile: async (payload: UserProfileUpdatePayload): Promise<UserProfile> => {
        const response = await axiosInstance.patch('/api/v1/users/me', payload);
        return response.data.data;
    },
};
