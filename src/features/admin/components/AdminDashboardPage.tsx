'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import type { AdminOperationStatistics } from '@/types/AdminTypes';
import { AdminCard, AdminError, AdminPageTitle, formatNumber } from './AdminShell';

const statisticItems: Array<{ key: keyof AdminOperationStatistics; label: string }> = [
  { key: 'userCount', label: '전체 사용자 수' },
  { key: 'activeSubscriptionCount', label: '활성 구독 수' },
  { key: 'templateCount', label: '기능 템플릿 수' },
  { key: 'publicTemplateCount', label: '공개 템플릿 수' },
  { key: 'premiumTemplateCount', label: '프리미엄 템플릿 수' },
  { key: 'grammarTemplateCount', label: '문법 템플릿 수' },
  { key: 'publishedGrammarTemplateCount', label: '게시된 문법 템플릿 수' },
  { key: 'learningProgressCount', label: '학습 진행 수' },
  { key: 'completedLearningProgressCount', label: '완료 학습 수' },
  { key: 'totalSolvedCount', label: '전체 풀이 수' },
  { key: 'totalCorrectCount', label: '전체 정답 수' },
  { key: 'totalStudySeconds', label: '전체 학습 시간(초)' },
  { key: 'certificateCount', label: '수료증 수' },
  { key: 'activityHistoryCount', label: '활동 로그 수' },
];

export function AdminDashboardPage() {
  const [statistics, setStatistics] = useState<AdminOperationStatistics | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setIsLoading(true);
      setError('');

      try {
        setStatistics(await adminService.getOverview());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : '관리자 통계를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    queueMicrotask(() => void loadOverview());
  }, []);

  return (
    <div>
      <AdminPageTitle title="관리자 대시보드" description="운영 핵심 지표를 한 화면에서 확인합니다." />
      <AdminError message={error} />

      {isLoading ? (
        <AdminCard className="text-sm text-slate-500">통계를 불러오는 중입니다.</AdminCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statisticItems.map((item) => (
            <AdminCard key={item.key}>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {formatNumber(statistics?.[item.key] ?? 0)}
              </p>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
