"use client";

import { TemplateSidebarProps } from '@/app/types/template.types';

export function FunctionalTemplateSidebar({
  activeMenu,
  onMenuChange,
}: TemplateSidebarProps) {
  const menus = [
    { id: 'design-intent', label: '설계 의도' },
    { id: 'source-code', label: '전체 소스코드' },
    { id: 'mission', label: '미션 / 문제' },
    { id: 'requirements', label: '요구사항' },
    { id: 'structure', label: '구조 설명' },
    { id: 'interview', label: '면접 질문' },
  ];

  return (
    <aside className="w-48 bg-white border-r border-gray-200 p-6 flex flex-col">
      <nav className="space-y-2 flex-1">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onMenuChange(menu.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeMenu === menu.id
                ? 'bg-purple-100 text-purple-700 font-semibold border-l-4 border-purple-600'
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