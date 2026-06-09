'use client';

import { useEffect, useState } from 'react';
import { subscriptionService } from '@/api/services/SubscriptionService';
import type { Subscription } from '@/features/my-page/types/DashboardTypes';

export const useSubscriptionManagement = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await subscriptionService.getMySubscription();
        if (isMounted) setSubscription(data);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : '구독 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadSubscription();

    return () => {
      isMounted = false;
    };
  }, []);

  return { error, isLoading, subscription };
};
