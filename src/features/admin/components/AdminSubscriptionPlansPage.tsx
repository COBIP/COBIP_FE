'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type { PageResponse, SubscriptionPlan, SubscriptionPlanPayload } from '@/types/AdminTypes';
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageTitle,
  AdminPagination,
  formatDateTime,
  formatNumber,
} from './AdminShell';

const emptyPlan: SubscriptionPlanPayload = {
  code: '',
  name: '',
  description: '',
  priceAmount: 0,
  currency: 'KRW',
  durationDays: 30,
  benefitDescription: '',
  visible: true,
  displayOrder: 0,
};

export function AdminSubscriptionPlansPage() {
  const [keyword, setKeyword] = useState('');
  const [visible, setVisible] = useState('');
  const [page, setPage] = useState(0);
  const [plans, setPlans] = useState<PageResponse<SubscriptionPlan> | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [form, setForm] = useState<SubscriptionPlanPayload>(emptyPlan);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPlans = useCallback(async () => {
    setError('');

    try {
      setPlans(
        await adminService.getSubscriptionPlans({
          keyword,
          visible: visible === '' ? undefined : visible === 'true',
          page,
          size: 20,
          sort: 'displayOrder,asc',
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '구독 플랜 목록을 불러오지 못했습니다.');
    }
  }, [keyword, page, visible]);

  useEffect(() => {
    queueMicrotask(() => void loadPlans());
  }, [loadPlans]);

  const selectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
    setForm({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceAmount: plan.priceAmount,
      currency: plan.currency,
      durationDays: plan.durationDays,
      benefitDescription: plan.benefitDescription,
      visible: plan.visible,
      displayOrder: plan.displayOrder,
    });
  };

  const savePlan = async () => {
    setError('');
    setMessage('');

    try {
      const saved = selectedPlanId
        ? await adminService.updateSubscriptionPlan(selectedPlanId, form)
        : await adminService.createSubscriptionPlan(form);

      setSelectedPlanId(saved.id);
      selectPlan(saved);
      setMessage('구독 플랜을 저장했습니다.');
      await loadPlans();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '구독 플랜 저장에 실패했습니다.');
    }
  };

  const deletePlan = async () => {
    if (!selectedPlanId || !confirm('선택한 플랜을 삭제할까요?')) {
      return;
    }

    try {
      await adminService.deleteSubscriptionPlan(selectedPlanId);
      setSelectedPlanId(null);
      setForm(emptyPlan);
      setMessage('구독 플랜을 삭제했습니다.');
      await loadPlans();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '구독 플랜 삭제에 실패했습니다.');
    }
  };

  const toggleVisible = async (plan: SubscriptionPlan) => {
    setError('');

    try {
      await adminService.updateSubscriptionPlanVisibility(plan.id, !plan.visible);
      await loadPlans();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '노출 여부 변경에 실패했습니다.');
    }
  };

  return (
    <div>
      <AdminPageTitle title="구독 플랜 관리" description="플랜 가격, 혜택, 노출 여부와 정렬 순서를 관리합니다." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <AdminCard>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_12rem_auto]">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="플랜 검색"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={visible}
                onChange={(event) => setVisible(event.target.value)}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">노출 전체</option>
                <option value="true">노출</option>
                <option value="false">숨김</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setPage(0);
                  void loadPlans();
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
              <p className="text-sm font-semibold">총 {formatNumber(plans?.totalElements ?? 0)}개</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanId(null);
                  setForm(emptyPlan);
                }}
                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
                새 플랜
              </button>
            </div>

            {!plans?.content.length ? (
              <AdminEmpty message="구독 플랜이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3">코드</th>
                      <th className="py-3">이름</th>
                      <th className="py-3">가격</th>
                      <th className="py-3">기간</th>
                      <th className="py-3">노출</th>
                      <th className="py-3">정렬</th>
                      <th className="py-3">수정일</th>
                      <th className="py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plans.content.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono text-xs">{plan.code}</td>
                        <td className="py-3 font-semibold">{plan.name}</td>
                        <td className="py-3">
                          {formatNumber(plan.priceAmount)} {plan.currency}
                        </td>
                        <td className="py-3">{plan.durationDays}일</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => void toggleVisible(plan)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                          >
                            {plan.visible ? '노출' : '숨김'}
                          </button>
                        </td>
                        <td className="py-3">{plan.displayOrder}</td>
                        <td className="py-3">{formatDateTime(plan.updatedAt)}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => selectPlan(plan)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <AdminPagination page={page} totalPages={plans?.totalPages ?? 1} onPageChange={setPage} />
          </AdminCard>
        </div>

        <AdminCard>
          <h3 className="mb-4 text-lg font-bold">{selectedPlanId ? '플랜 수정' : '플랜 생성'}</h3>
          <div className="space-y-3">
            <input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="code"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="name"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="description"
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={form.priceAmount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priceAmount: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                type="number"
                value={form.durationDays}
                onChange={(event) =>
                  setForm((current) => ({ ...current, durationDays: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                type="number"
                value={form.displayOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
            <textarea
              value={form.benefitDescription}
              onChange={(event) => setForm((current) => ({ ...current, benefitDescription: event.target.value }))}
              placeholder="benefitDescription"
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))}
              />
              노출
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void savePlan()}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              저장
            </button>
            {selectedPlanId && (
              <button
                type="button"
                onClick={() => void deletePlan()}
                className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
              >
                삭제
              </button>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
