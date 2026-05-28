'use client';

import { useEffect, useMemo, useState } from 'react';
import { myLearningService, type PageResponse } from '@/api/services/MyLearningService';
import type { LearningProgress } from '@/features/my-page/types/DashboardTypes';

export type StudyFilter = 'all' | 'inProgress' | 'completed';

const PAGE_SIZE = 10;

function selectLearningItems(items: LearningProgress[], filter: StudyFilter) {
  if (filter === 'completed') return items.filter((item) => item.completed);
  if (filter === 'inProgress') return items.filter((item) => !item.completed);
  return items;
}

export const useMyLearning = () => {
  const [response, setResponse] = useState<PageResponse<LearningProgress> | null>(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<StudyFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchLearningProgress = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await myLearningService.getLearningProgress(page, PAGE_SIZE);
        if (isMounted) setResponse(data);
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : '내 학습 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchLearningProgress();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const learningItems = useMemo(() => response?.content ?? [], [response?.content]);
  const filteredItems = useMemo(() => selectLearningItems(learningItems, filter), [filter, learningItems]);

  const summary = useMemo(() => {
    const completedCount = learningItems.filter((item) => item.completed).length;
    const totalProgress = learningItems.reduce((sum, item) => sum + item.progressPercent, 0);
    const totalStudySeconds = learningItems.reduce((sum, item) => sum + (Number(item.studySeconds) || 0), 0);

    return {
      totalCount: response?.totalElements ?? learningItems.length,
      pageItemCount: learningItems.length,
      completedCount,
      inProgressCount: learningItems.length - completedCount,
      averageProgress: learningItems.length > 0 ? Math.round(totalProgress / learningItems.length) : 0,
      totalStudySeconds,
    };
  }, [learningItems, response?.totalElements]);

  return {
    error,
    filter,
    filteredItems,
    isLoading,
    page,
    response,
    summary,
    setFilter,
    setPage,
  };
};
