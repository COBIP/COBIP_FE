import { Flag } from 'lucide-react';
import { useState } from 'react';

export function MissionSection() {
  const [currentStep, setCurrentStep] = useState('step1');
  const steps = [
    { id: 'step1', title: 'STEP 1', subtitle: '빈칸 채우기' },
    { id: 'step2', title: 'STEP 2', subtitle: '오류 찾기' },
    { id: 'step3', title: 'STEP 3', subtitle: '코드 작성' },
    { id: 'step4', title: 'STEP 4', subtitle: '심화 과제' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flag className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">미션 / 문제</h2>
      </div>
      <div className="flex gap-6">
        <div className="w-40 space-y-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentStep === step.id
                  ? 'bg-purple-50 border-l-4 border-purple-600'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-xs font-bold">{step.title}</div>
              <div className="text-sm">{step.subtitle}</div>
            </button>
          ))}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700">문제 내용이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}