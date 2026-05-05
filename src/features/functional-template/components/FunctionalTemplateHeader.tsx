'use client';

import React, { useState } from 'react';
import { Bookmark, MessageSquare, Settings, Flame, Code2 } from 'lucide-react';

interface FunctionalTemplateHeaderProps {
  templateTitle: string;
  breadcrumb: string;
  consecutiveDays: number;
  onBookmarkClick: () => void;
  onSettingsClick: () => void;
}

export function FunctionalTemplateHeader({
  templateTitle,
  breadcrumb,
  consecutiveDays,
  onBookmarkClick,
  onSettingsClick,
}: FunctionalTemplateHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 네비게이션 경로 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-semibold">{breadcrumb}</span>
          <span className="text-gray-400 text-xl">›</span>
        </div>

        {/* 중앙: 연속학습 표시 */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {consecutiveDays > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{consecutiveDays}일 연속</span>
            </div>
          )}
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center gap-4">
          {/* GURU AI Chat */}
          <button className="flex items-center gap-2 px-4 py-2 border border-purple-200 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors">
            <Code2 className="w-4 h-4" />
            <span className="text-sm font-medium">GURU AI Chat</span>
          </button>

          {/* 무제한 수강하기 */}
          <button className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium">
            무제한 수강하기
          </button>

          {/* 프로필 */}
          <button className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* 설정 */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
