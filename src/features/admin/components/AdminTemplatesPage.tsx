'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type {
  AdminAccessLevel,
  AdminDifficulty,
  AdminTemplateDetail,
  AdminTemplateSummary,
  AdminVisibility,
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

const difficulties: AdminDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const visibilities: AdminVisibility[] = ['PUBLIC', 'PRIVATE'];
const accessLevels: AdminAccessLevel[] = ['FREE', 'PREMIUM'];

export function AdminTemplatesPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<AdminDifficulty | ''>('');
  const [visibility, setVisibility] = useState<AdminVisibility | ''>('');
  const [accessLevel, setAccessLevel] = useState<AdminAccessLevel | ''>('');
  const [ownerId, setOwnerId] = useState('');
  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<PageResponse<AdminTemplateSummary> | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AdminTemplateDetail | null>(null);
  const [adminMemo, setAdminMemo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setTemplates(
        await adminService.getTemplates({
          keyword,
          category,
          difficulty: difficulty || undefined,
          visibility: visibility || undefined,
          accessLevel: accessLevel || undefined,
          ownerId: ownerId ? Number(ownerId) : undefined,
          page,
          size: 20,
          sort: 'createdAt,desc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessLevel, category, difficulty, keyword, ownerId, page, visibility]);

  useEffect(() => {
    queueMicrotask(() => void loadTemplates());
  }, [loadTemplates]);

  const handleSelect = async (templateId: number) => {
    setError('');
    setMessage('');

    try {
      const detail = await adminService.getTemplate(templateId);
      setSelectedTemplate(detail);
      setAdminMemo('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '기능 템플릿 상세를 불러오지 못했습니다.');
    }
  };

  const handleExposureChange = async (
    template: AdminTemplateSummary | AdminTemplateDetail,
    nextVisibility: AdminVisibility,
    nextAccessLevel: AdminAccessLevel,
  ) => {
    setError('');

    try {
      const updated = await adminService.updateTemplateExposure(template.id, {
        visibility: nextVisibility,
        accessLevel: nextAccessLevel,
      });
      setMessage('기능 템플릿 노출 정보를 변경했습니다.');
      setSelectedTemplate((currentTemplate) =>
        currentTemplate?.id === updated.id ? { ...currentTemplate, ...updated } : currentTemplate,
      );
      await loadTemplates();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '노출 정보 변경에 실패했습니다.');
    }
  };

  const handleModeration = async (action: 'BLIND' | 'DELETE') => {
    if (!selectedTemplate || !confirm(`${action} 제재를 적용할까요?`)) {
      return;
    }

    setError('');

    try {
      await adminService.moderateContent({
        targetType: 'TEMPLATE',
        targetId: selectedTemplate.id,
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
      <AdminPageTitle title="기능 템플릿 노출 관리" description="템플릿 공개 상태와 접근 등급을 관리합니다." />
      <div className="space-y-4">
        <AdminCard>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_9rem_10rem_10rem_10rem_8rem_auto]">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="템플릿 검색"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="category"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as AdminDifficulty | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">난이도 전체</option>
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as AdminVisibility | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">공개 전체</option>
              {visibilities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={accessLevel}
              onChange={(event) => setAccessLevel(event.target.value as AdminAccessLevel | '')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">등급 전체</option>
              {accessLevels.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              placeholder="ownerId"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setPage(0);
                void loadTemplates();
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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">총 {formatNumber(templates?.totalElements ?? 0)}개</p>
            {isLoading && <p className="text-sm text-slate-500">불러오는 중</p>}
          </div>

          {!templates?.content.length ? (
            <AdminEmpty message="기능 템플릿이 없습니다." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3">템플릿</th>
                    <th className="py-3">분류</th>
                    <th className="py-3">노출</th>
                    <th className="py-3">등급</th>
                    <th className="py-3">소유자</th>
                    <th className="py-3">지표</th>
                    <th className="py-3">생성일</th>
                    <th className="py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.content.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <p className="font-semibold">{template.title}</p>
                        <p className="text-xs text-slate-500">#{template.id}</p>
                      </td>
                      <td className="py-3">
                        {template.category} · {template.difficulty}
                      </td>
                      <td className="py-3">
                        <select
                          value={template.visibility}
                          onChange={(event) =>
                            void handleExposureChange(
                              template,
                              event.target.value as AdminVisibility,
                              template.accessLevel,
                            )
                          }
                          className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                        >
                          {visibilities.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          value={template.accessLevel}
                          onChange={(event) =>
                            void handleExposureChange(
                              template,
                              template.visibility,
                              event.target.value as AdminAccessLevel,
                            )
                          }
                          className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                        >
                          {accessLevels.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        {template.ownerNickname}
                        <span className="ml-1 text-xs text-slate-400">({template.ownerId})</span>
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        조회 {formatNumber(template.viewCount)} · 즐겨찾기 {formatNumber(template.favoriteCount)}
                      </td>
                      <td className="py-3">{formatDateTime(template.createdAt)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/templates/${template.id}/practice`}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            실습
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleSelect(template.id)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            상세
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPagination page={page} totalPages={templates?.totalPages ?? 1} onPageChange={setPage} />
        </AdminCard>
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-4">
          <AdminCard className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{selectedTemplate.title}</h3>
                <p className="text-sm text-slate-500">#{selectedTemplate.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedTemplate(null)} className="text-sm font-semibold">
                닫기
              </button>
            </div>
            <p className="text-sm text-slate-700">{selectedTemplate.description || '설명 없음'}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <dt className="text-slate-500">노출</dt>
              <dd className="font-medium">{selectedTemplate.visibility}</dd>
              <dt className="text-slate-500">접근 등급</dt>
              <dd className="font-medium">{selectedTemplate.accessLevel}</dd>
              <dt className="text-slate-500">파일 URL</dt>
              <dd className="break-all font-medium">{selectedTemplate.fileUrl || '-'}</dd>
              <dt className="text-slate-500">썸네일</dt>
              <dd className="break-all font-medium">{selectedTemplate.thumbnailUrl || '-'}</dd>
              <dt className="text-slate-500">수정일</dt>
              <dd className="font-medium">{formatDateTime(selectedTemplate.updatedAt)}</dd>
            </dl>

            <div className="mt-5 rounded-md bg-slate-50 p-4">
              <h4 className="text-sm font-bold text-slate-900">콘텐츠 제재</h4>
              <textarea
                value={adminMemo}
                onChange={(event) => setAdminMemo(event.target.value)}
                placeholder="관리자 메모"
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleModeration('BLIND')}
                  className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700"
                >
                  BLIND
                </button>
                <button
                  type="button"
                  onClick={() => void handleModeration('DELETE')}
                  className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  DELETE
                </button>
              </div>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
