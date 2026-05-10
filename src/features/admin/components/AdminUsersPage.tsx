'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type {
  AdminUserDetail,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
  PageResponse,
} from '@/types/AdminTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const userStatuses: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED', 'DELETED'];

export function AdminUsersPage() {
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<AdminUserRole | ''>('');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [emailVerified, setEmailVerified] = useState('');
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<PageResponse<AdminUserSummary> | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setUsers(
        await adminService.getUsers({
          keyword,
          role: role || undefined,
          status: status || undefined,
          emailVerified: emailVerified === '' ? undefined : emailVerified === 'true',
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '사용자 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [emailVerified, keyword, page, role, status]);

  useEffect(() => {
    queueMicrotask(() => void loadUsers());
  }, [loadUsers]);

  const handleSearch = () => {
    setPage(0);
    void loadUsers();
  };

  const handleSelectUser = async (userId: number) => {
    setError('');

    try {
      setSelectedUser(await adminService.getUser(userId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '사용자 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleStatusChange = async (nextStatus: AdminUserStatus) => {
    if (!selectedUser) {
      return;
    }

    try {
      const updatedUser = await adminService.updateUserStatus(selectedUser.id, nextStatus);
      setSelectedUser(updatedUser);
      await loadUsers();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '사용자 상태 변경에 실패했습니다.');
    }
  };

  return (
    <div>
      <AdminPageTitle title="사용자 관리" description="사용자를 검색하고 계정 상태를 변경합니다." />
      <div className="space-y-4">
        <AdminCard>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_10rem_10rem_10rem_auto]">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="email 또는 nickname 검색"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminUserRole | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">전체 role</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as AdminUserStatus | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">전체 상태</option>
              {userStatuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={emailVerified}
              onChange={(event) => setEmailVerified(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">이메일 인증 전체</option>
              <option value="true">인증</option>
              <option value="false">미인증</option>
            </select>
            <button
              type="button"
              onClick={handleSearch}
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
            >
              검색
            </button>
          </div>
        </AdminCard>

        <AdminError message={error} />

        <AdminCard>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              총 {formatNumber(users?.totalElements ?? 0)}명
            </p>
            {isLoading && <p className="text-sm text-slate-500">불러오는 중</p>}
          </div>

          {!users?.content.length ? (
            <AdminEmpty message="조건에 맞는 사용자가 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3">ID</th>
                    <th className="py-3">이메일</th>
                    <th className="py-3">닉네임</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">상태</th>
                    <th className="py-3">인증</th>
                    <th className="py-3">가입일</th>
                    <th className="py-3 text-right">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.content.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs">{user.id}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.nickname}</td>
                      <td className="py-3">{user.role}</td>
                      <td className="py-3">{user.status}</td>
                      <td className="py-3">{user.emailVerified ? 'Y' : 'N'}</td>
                      <td className="py-3">{formatDateTime(user.createdAt)}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void handleSelectUser(user.id)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPagination page={page} totalPages={users?.totalPages ?? 1} onPageChange={setPage} />
        </AdminCard>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-4">
          <AdminCard className="w-full max-w-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{selectedUser.nickname}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-sm font-semibold">
                닫기
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-slate-500">ID</dt>
              <dd className="font-medium">{selectedUser.id}</dd>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium">{selectedUser.role}</dd>
              <dt className="text-slate-500">상태</dt>
              <dd className="font-medium">{selectedUser.status}</dd>
              <dt className="text-slate-500">이메일 인증</dt>
              <dd className="font-medium">{selectedUser.emailVerified ? '인증' : '미인증'}</dd>
              <dt className="text-slate-500">가입일</dt>
              <dd className="font-medium">{formatDateTime(selectedUser.createdAt)}</dd>
              <dt className="text-slate-500">수정일</dt>
              <dd className="font-medium">{formatDateTime(selectedUser.updatedAt)}</dd>
            </dl>

            <div className="mt-5 flex gap-2">
              {userStatuses.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => void handleStatusChange(option)}
                  disabled={selectedUser.status === option}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  {option}
                </button>
              ))}
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
