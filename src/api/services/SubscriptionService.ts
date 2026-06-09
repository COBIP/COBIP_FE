import axiosInstance from '@/api/AxiosInstance';
import type { Subscription } from '@/features/my-page/types/DashboardTypes';

const DEFAULT_SUBSCRIPTION: Subscription = {
  planName: null,
  status: null,
  startedAt: null,
  expiredAt: null,
  nextPaymentAt: null,
  active: false,
};

export const subscriptionService = {
  getMySubscription: async (): Promise<Subscription> => {
    const response = await axiosInstance.get('/api/v1/users/me/dashboard');
    return response.data.data?.subscription ?? DEFAULT_SUBSCRIPTION;
  },
};
