'use client';

import { createElement } from 'react';
import Link from 'next/link';
import { BadgeCheck, CalendarDays, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { PRICING_PLANS, type PricingPlan } from '@/features/pricing/Constants';
import { useSubscriptionManagement } from '@/features/my-page/hooks/UseSubscriptionManagement';
import type { Subscription } from '@/features/my-page/types/DashboardTypes';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '이용 중',
  CANCELED: '해지 예정',
  CANCELLED: '해지 예정',
  EXPIRED: '만료됨',
  PENDING: '처리 중',
  PAUSED: '일시 중지',
};

function getPlanName(subscription: Subscription | null) {
  const rawPlanName = subscription?.planName?.trim().toLowerCase() ?? '';

  if (rawPlanName.includes('pro')) return 'Pro';
  if (rawPlanName.includes('plus')) return 'Plus';
  return 'Free';
}

function getPlan(subscription: Subscription | null): PricingPlan {
  const planName = getPlanName(subscription);
  return PRICING_PLANS.find((plan) => plan.name === planName) ?? PRICING_PLANS[0];
}

function getStatusLabel(subscription: Subscription | null) {
  if (!subscription) return '확인 중';
  if (subscription.active) return '이용 중';

  const status = subscription.status?.trim().toUpperCase();
  if (status) return STATUS_LABELS[status] ?? status;

  return '무료 이용 중';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getPeriodLabel(subscription: Subscription | null) {
  if (!subscription?.startedAt && !subscription?.expiredAt) return '기간 정보 없음';
  return `${formatDate(subscription.startedAt)} - ${formatDate(subscription.expiredAt)}`;
}

export function SubscriptionPage() {
  const { error, isLoading, subscription } = useSubscriptionManagement();
  const currentPlan = getPlan(subscription);
  const statusLabel = getStatusLabel(subscription);
  const isFreePlan = currentPlan.name === 'Free' && !subscription?.active;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-purple-600" />
        <p className="text-sm font-medium text-gray-500">구독 정보를 불러오고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">구독관리</h1>
          <p className="mt-2 text-sm text-gray-500">현재 플랜과 결제 일정을 확인합니다.</p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          플랜 보기
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-purple-100 bg-white p-6 lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">현재 플랜</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <h2 className="text-4xl font-bold text-gray-950">{currentPlan.name}</h2>
                <span className="rounded-lg bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                  {statusLabel}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">{currentPlan.description}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-right">
              <p className="text-xs font-semibold text-gray-500">월 구독료</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {currentPlan.price === '0' ? '무료' : `${currentPlan.price}원`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-950">결제 일정</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">이용 기간</span>
              <span className="text-right font-semibold text-gray-900">{getPeriodLabel(subscription)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">다음 결제일</span>
              <span className="font-semibold text-gray-900">{formatDate(subscription?.nextPaymentAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">상태</span>
              <span className="font-semibold text-gray-900">{statusLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-950">현재 플랜 혜택</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {currentPlan.features.map((feature) => (
            <div key={feature.text} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              {createElement(feature.icon, {
                className: 'mt-0.5 h-4 w-4 shrink-0 text-purple-600',
              })}
              <span className="text-sm leading-6 text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      {isFreePlan && (
        <section className="rounded-lg border border-amber-100 bg-amber-50 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">무료 플랜을 이용 중입니다</h2>
                <p className="mt-1 text-sm leading-6 text-amber-800">더 많은 템플릿과 AI 기능이 필요하면 플랜을 비교해보세요.</p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              업그레이드
            </Link>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-950">플랜 비교</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = plan.name === currentPlan.name;

            return (
              <div
                key={plan.name}
                className={`rounded-lg border bg-white p-5 ${isCurrent ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-950">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">현재 플랜</span>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-950">
                  {plan.price === '0' ? '무료' : `${plan.price}원`}
                  <span className="ml-1 text-sm font-medium text-gray-500">/ 월</span>
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">{plan.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
