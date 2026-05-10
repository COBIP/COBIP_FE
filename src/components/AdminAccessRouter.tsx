'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkAccessTokenExpired, getRoleFromAccessToken } from '@/utils/AuthToken';

const publicPaths = ['/login', '/signup', '/auth-check'];

export function AdminAccessRouter() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token || checkAccessTokenExpired(token)) {
      return;
    }

    const role = getRoleFromAccessToken(token);

    if (role !== 'ADMIN') {
      return;
    }

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isAdminPath = pathname.startsWith('/admin');

    if (!isPublicPath && !isAdminPath) {
      router.replace('/admin');
    }
  }, [pathname, router]);

  return null;
}
