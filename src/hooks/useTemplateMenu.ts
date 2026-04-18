"use client";

import { useState } from 'react';

export function useTemplateMenu(initialMenu: string = 'design-intent') {
  const [activeMenu, setActiveMenu] = useState(initialMenu);

  const menus = [
    { id: 'design-intent', label: '설계 의도' },
    { id: 'source-code', label: '전체 소스코드' },
    { id: 'mission', label: '미션 / 문제' },
    { id: 'requirements', label: '요구사항' },
    { id: 'structure', label: '구조 설명' },
    { id: 'interview', label: '면접 질문' },
  ];

  return { activeMenu, setActiveMenu, menus };
}