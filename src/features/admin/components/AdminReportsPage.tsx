'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type {
  AdminModerationAction,
  AdminReportDetail,
  AdminReportStatus,
  AdminReportSummary,
  AdminReportTargetType,
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

const reportStatuses: AdminReportStatus[] = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'];
const targetTypes: AdminReportTargetType[] = ['TEMPLATE', 'GRAMMAR_TEMPLATE', 'COMMENT', 'USER'];

export function AdminReportsPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AdminReportStatus | ''>('');
  const [targetType, setTargetType] = useState<AdminReportTargetType | ''>('');
  const [page, setPage] = useState(0);
  const [reports, setReports] = useState<PageResponse<AdminReportSummary> | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminReportDetail | null>(null);
  const [nextStatus, setNextStatus] = useState<AdminReportStatus>('REVIEWING');
  const [adminMemo, setAdminMemo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadReports = useCallback(async () => {
    setError('');

    try {
      setReports(
        await adminService.getReports({
          keyword,
          status: status || undefined,
          targetType: targetType || undefined,
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '신고 목록을 불러오지 못했습니다.');
    }
  }, [keyword, page, status, targetType]);

  useEffect(() => {
    queueMicrotask(() => void loadReports());
  }, [loadReports]);

  const selectReport = async (reportId: number) => {
    setError('');
    setMessage('');

    try {
      const detail = await adminService.getReport(reportId);
      setSelectedReport(detail);
      setNextStatus(detail.status);
      setAdminMemo(detail.adminMemo ?? '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '신고 상세를 불러오지 못했습니다.');
    }
  };

  const updateReportStatus = async () => {
    if (!selectedReport) {
      return;
    }

    try {
      const updated = await adminService.updateReportStatus(selectedReport.id, {
        status: nextStatus,
        adminMemo,
      });
      setSelectedReport(updated);
      setMessage('신고 처리 상태를 변경했습니다.');
      await loadReports();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '신고 상태 변경에 실패했습니다.');
    }
  };

  const moderateTarget = async (action: AdminModerationAction) => {
    if (
      !selectedReport ||
      (selectedReport.targetType !== 'TEMPLATE' && selectedReport.targetType !== 'GRAMMAR_TEMPLATE') ||
      !confirm(`${selectedReport.targetType} #${selectedReport.targetId}에 ${action} 제재를 적용할까요?`)
    ) {
      return;
    }

    try {
      await adminService.moderateContent({
        targetType: selectedReport.targetType,
        targetId: selectedReport.targetId,
        action,
        adminMemo,
      });
      setMessage('콘텐츠 제재를 적용했습니다.');
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : '콘텐츠 제재에 실패했습니다.');
    }
  };

  return (
    <div>
      <AdminPageTitle title="신고 관리" description="신고 상세를 확인하고 처리 상태 및 콘텐츠 제재를 적용합니다." />
      <div className="space-y-4">
        <AdminCard>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_12rem_14rem_auto]">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="신고 검색"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as AdminReportStatus | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">상태 전체</option>
              {reportStatuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value as AdminReportTargetType | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">대상 전체</option>
              {targetTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setPage(0);
                void loadReports();
              }}
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
            >
              검색
            </button>
          </div>
        </AdminCard>

        <AdminError message={error} />
        {message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <AdminCard>
          <p className="mb-3 text-sm font-semibold">총 {formatNumber(reports?.totalElements ?? 0)}건</p>
          {!reports?.content.length ? (
            <AdminEmpty message="신고가 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3">ID</th>
                    <th className="py-3">신고자</th>
                    <th className="py-3">대상</th>
                    <th className="py-3">사유</th>
                    <th className="py-3">상태</th>
                    <th className="py-3">처리자</th>
                    <th className="py-3">신고일</th>
                    <th className="py-3 text-right">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.content.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs">{report.id}</td>
                      <td className="py-3">
                        {report.reporterNickname}
                        <p className="text-xs text-slate-500">{report.reporterEmail}</p>
                      </td>
                      <td className="py-3">
                        {report.targetType} #{report.targetId}
                      </td>
                      <td className="py-3">{report.reason}</td>
                      <td className="py-3">{report.status}</td>
                      <td className="py-3">{report.processedByNickname ?? '-'}</td>
                      <td className="py-3">{formatDateTime(report.createdAt)}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void selectReport(report.id)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold"
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
          <AdminPagination page={page} totalPages={reports?.totalPages ?? 1} onPageChange={setPage} />
        </AdminCard>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-4">
          <AdminCard className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">신고 #{selectedReport.id}</h3>
                <p className="text-sm text-slate-500">
                  {selectedReport.targetType} #{selectedReport.targetId}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedReport(null)} className="text-sm font-semibold">
                닫기
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-slate-500">신고자</dt>
              <dd className="font-medium">
                {selectedReport.reporterNickname} ({selectedReport.reporterEmail})
              </dd>
              <dt className="text-slate-500">사유</dt>
              <dd className="font-medium">{selectedReport.reason}</dd>
              <dt className="text-slate-500">설명</dt>
              <dd className="font-medium">{selectedReport.description || '-'}</dd>
              <dt className="text-slate-500">상태</dt>
              <dd className="font-medium">{selectedReport.status}</dd>
              <dt className="text-slate-500">처리일</dt>
              <dd className="font-medium">{formatDateTime(selectedReport.processedAt)}</dd>
            </dl>

            <div className="mt-5 space-y-3 rounded-md bg-slate-50 p-4">
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as AdminReportStatus)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {reportStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <textarea
                value={adminMemo}
                onChange={(event) => setAdminMemo(event.target.value)}
                placeholder="관리자 메모"
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void updateReportStatus()}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  상태 저장
                </button>
                {(selectedReport.targetType === 'TEMPLATE' || selectedReport.targetType === 'GRAMMAR_TEMPLATE') && (
                  <>
                    <button
                      type="button"
                      onClick={() => void moderateTarget('BLIND')}
                      className="rounded-md border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700"
                    >
                      BLIND
                    </button>
                    <button
                      type="button"
                      onClick={() => void moderateTarget('DELETE')}
                      className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      DELETE
                    </button>
                  </>
                )}
              </div>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
