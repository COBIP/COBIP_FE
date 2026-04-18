"use client";

import { Lightbulb } from 'lucide-react';

export function DesignIntentSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">설계 의도</h2>
      </div>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <p className="text-gray-700 leading-relaxed">
          이 템플릿은 사용자 인증 시스템의 기본 구조를 보여줍니다.
        </p>
      </div>
    </div>
  );
}