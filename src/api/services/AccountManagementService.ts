import axiosInstance from '@/api/AxiosInstance';

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface WithdrawalPayload {
  currentPassword: string;
  reason: string;
}

export const accountManagementService = {
  changePassword: async (payload: PasswordChangePayload): Promise<void> => {
    await axiosInstance.patch('/api/v1/users/me/password', payload);
  },

  withdraw: async (payload: WithdrawalPayload): Promise<void> => {
    await axiosInstance.delete('/api/v1/users/me', { data: payload });
  },
};
