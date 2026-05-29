'use client';

import type { TemplateSidebarProps } from '@/app/types/TemplateTypes';

const menus = [
  { id: 'overview', label: '개요' },
  { id: 'requirements', label: '요구사항' },
  { id: 'flow', label: '흐름/구조' },
  { id: 'api-spec', label: 'API 명세' },
  { id: 'source-code', label: '전체 코드' },
  { id: 'problem', label: '문제' },
  { id: 'mission', label: '미션' },
  { id: 'core-question', label: '핵심 질문' },
  { id: 'next-recommendation', label: '다음 추천' },
];

export function FunctionalTemplateSidebar({ activeMenu, onMenuChange }: TemplateSidebarProps) {
  return (
    <aside className="flex w-48 flex-col border-r border-gray-200 bg-white p-6">
      <nav className="flex-1 space-y-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => onMenuChange(menu.id)}
            className={`w-full rounded-lg px-4 py-2 text-left transition ${
              activeMenu === menu.id
                ? 'border-l-4 border-purple-600 bg-purple-100 font-semibold text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {menu.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
