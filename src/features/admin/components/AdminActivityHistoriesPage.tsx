'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type { AdminActivityHistory, PageResponse } from '@/types/AdminTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const activityTypes = [
  'TEMPLATE_CREATED',
  'TEMPLATE_UPDATED',
  'TEMPLATE_DELETED',
  'TEMPLATE_FAVORITED',
  'TEMPLATE_UNFAVORITED',
  'TEMPLATE_FILE_UPLOADED',
  'TEMPLATE_THUMBNAIL_UPLOADED',
  'ADMIN_USER_STATUS_CHANGED',
  'REPORT_STATUS_CHANGED',
  'CONTENT_MODERATED',
  'CERTIFICATE_ISSUED',
  'USER_WITHDRAWN',
];

export function AdminActivityHistoriesPage() {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(0);
  const [histories, setHistories] = useState<PageResponse<AdminActivityHistory> | null>(null);
  const [error, setError] = useState('');

  const loadHistories = useCallback(async () => {
    setError('');

    try {
      setHistories(
        await adminService.getActivityHistories({
          userId: userId ? Number(userId) : undefined,
          type: type || undefined,
          targetType: targetType || undefined,
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '관리자 활동 로그를 불러오지 못했습니다.');
    }
  }, [page, targetType, type, userId]);

  useEffect(() => {
    queueMicrotask(() => void loadHistories());
  }, [loadHistories]);

  return (
    <div>
      <AdminPageTitle title="관리자 활동 로그" description="관리자가 수행한 운영 작업을 감사 로그로 조회합니다." />
      <div className="space-y-4">
        <AdminCard>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[10rem_1fr_10rem_auto]">
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="userId"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">type 전체</option>
              {activityTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              value={targetType}
              onChange={(event) => setTargetType(event.target.value)}
              placeholder="targetType"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setPage(0);
                void loadHistories();
              }}
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
            >
              검색
            </button>
          </div>
        </AdminCard>

        <AdminError message={error} />

        <AdminCard>
          <p className="mb-3 text-sm font-semibold">총 {formatNumber(histories?.totalElements ?? 0)}건</p>
          {!histories?.content.length ? (
            <AdminEmpty message="활동 로그가 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3">ID</th>
                    <th className="py-3">사용자</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">메시지</th>
                    <th className="py-3">대상</th>
                    <th className="py-3">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {histories.content.map((history) => (
                    <tr key={history.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs">{history.id}</td>
                      <td className="py-3">
                        {history.userNickname}
                        <p className="text-xs text-slate-500">
                          {history.userEmail} · #{history.userId}
                        </p>
                      </td>
                      <td className="py-3 font-mono text-xs">{history.type}</td>
                      <td className="py-3">{history.message}</td>
                      <td className="py-3">
                        {history.targetType ?? '-'} {history.targetId ? `#${history.targetId}` : ''}
                      </td>
                      <td className="py-3">{formatDateTime(history.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPagination page={page} totalPages={histories?.totalPages ?? 1} onPageChange={setPage} />
        </AdminCard>
      </div>
    </div>
  );
}
