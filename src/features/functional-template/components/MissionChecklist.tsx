'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface MissionChecklistProps {
  isDarkMode?: boolean;
}

export function MissionChecklist({ isDarkMode = false }: MissionChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: '함수 정의하기', completed: false },
    { id: '2', label: 'main.py에서 함수 호출하기', completed: false },
    { id: '3', label: '출력 결과 확인하기', completed: false },
    { id: '4', label: '코드 리뷰 받기', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <div className="space-y-6">
      {/* 진행률 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#1E293B]'
            }`}
          >
            미션 진행 상황
          </h3>
          <span className="text-sm font-semibold text-[#7C3AED]">
            {completedCount} / {items.length}
          </span>
        </div>
        <div
          className={`w-full rounded-full h-2 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'
          }`}
        >
          <div
            className="bg-[#7C3AED] h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer group ${
              isDarkMode
                ? 'border-[#334155] hover:bg-[#334155]'
                : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            <div className="shrink-0">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="w-5 h-5 rounded accent-[#7C3AED] cursor-pointer"
              />
            </div>
            <span
              className={`flex-1 text-sm font-medium transition-all duration-300 ${
                item.completed
                  ? isDarkMode
                    ? 'text-[#64748B] line-through'
                    : 'text-[#94A3B8] line-through'
                  : isDarkMode
                  ? 'text-white'
                  : 'text-[#1E293B]'
              }`}
            >
              {item.label}
            </span>
            {item.completed && (
              <Check className="w-4 h-4 text-[#7C3AED]" />
            )}
          </label>
        ))}
      </div>

      {/* 완료 버튼 */}
      {completedCount === items.length && (
        <button className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
        }`}>
          미션 제출하기
        </button>
      )}
    </div>
  );
}
