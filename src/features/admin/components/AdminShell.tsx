'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createElement, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  FileCode2,
  Flag,
  LayoutDashboard,
  LogOut,
  Receipt,
  Shield,
  Users,
} from 'lucide-react';
import { adminService } from '@/api/services/AdminService';
import { useUserStore } from '@/store/UseUserStore';
import { checkAccessTokenExpired, getRoleFromAccessToken } from '@/utils/AuthToken';

const adminNavItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '사용자 관리', icon: Users },
  { href: '/admin/grammar-templates', label: '문법 템플릿', icon: BookOpen },
  { href: '/admin/templates', label: '기능 템플릿', icon: FileCode2 },
  { href: '/admin/subscription-plans', label: '구독 플랜', icon: Receipt },
  { href: '/admin/reports', label: '신고 관리', icon: Flag },
  { href: '/admin/activity-histories', label: '활동 로그', icon: Activity },
];

function getStoredToken() {
  return localStorage.getItem('accessToken');
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearSession = useUserStore((state) => state.clearSession);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token || checkAccessTokenExpired(token)) {
      clearSession();
      router.replace('/login');
      return;
    }

    const role = getRoleFromAccessToken(token);

    if (role === 'USER') {
      router.replace('/login');
      return;
    }

    if (role === 'ADMIN') {
      queueMicrotask(() => setIsAllowed(true));
      return;
    }

    queueMicrotask(async () => {
      try {
        await adminService.getOverview();
        setIsAllowed(true);
      } catch {
        router.replace('/login');
      }
    });
  }, [clearSession, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-semibold text-white">
        관리자 권한을 확인하는 중입니다.
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useUserStore((state) => state.clearSession);

  const pageTitle = useMemo(() => {
    const item =
      adminNavItems
        .filter((navItem) => navItem.href === pathname || pathname.startsWith(`${navItem.href}/`))
        .sort((a, b) => b.href.length - a.href.length)[0] ?? adminNavItems[0];

    return item.label;
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-500 text-slate-950">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">COBIP Admin</p>
            <p className="text-xs text-slate-400">운영 관리</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold ${
                  isActive ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {createElement(icon, { size: 17 })}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            <LogOut size={17} />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="min-h-screen pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-950">{pageTitle}</h1>
            <p className="text-xs font-medium text-slate-500">관리자 API 기반 운영 콘솔</p>
          </div>
        </header>

        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-md border border-slate-200 bg-white p-5 ${className}`}>{children}</section>;
}

export function AdminError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>;
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function AdminPageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(page - 1, 0))}
        disabled={page <= 0}
        className="h-9 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-sm font-medium text-slate-500">
        {page + 1} / {Math.max(totalPages, 1)}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
        className="h-9 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}
