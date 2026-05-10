'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/api/services/UserService';
import { checkAccessTokenExpired } from '@/utils/AuthToken';

const publicPaths = ['/login', '/signup', '/auth-check'];

export function AdminAccessRouter() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token || checkAccessTokenExpired(token)) {
      return;
    }

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isAdminPath = pathname.startsWith('/admin');

    if (isPublicPath || isAdminPath) {
      return;
    }

    queueMicrotask(async () => {
      try {
        const profile = await authService.getMyProfile(token);
        localStorage.setItem('userRole', profile.role);

        if (profile.role === 'ADMIN') {
          router.replace('/admin');
        }
      } catch {
        localStorage.removeItem('userRole');
      }
    });
  }, [pathname, router]);

  return null;
}
