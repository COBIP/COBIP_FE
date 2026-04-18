"use client";

import { MessageCircle } from 'lucide-react';

export function InterviewSection() {
  const questions = [
    'JWT 토큰의 장점과 단점은 무엇인가요?',
    '리프레시 토큰과 액세스 토큰의 차이는?',
    '비밀번호를 평문으로 저장하면 안 되는 이유는?',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">면접 질문 리스트</h2>
      </div>
      <div className="space-y-3">
        {questions.map((question, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl text-purple-300">❝</span>
              <p className="text-gray-700">{question}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}