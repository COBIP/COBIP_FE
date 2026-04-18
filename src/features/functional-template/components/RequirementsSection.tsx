import { FileText } from 'lucide-react';

export function RequirementsSection() {
  const requirements = [
    'Node.js 18 이상 설치',
    'JWT 토큰 기반 인증 구현',
    'bcryptjs를 이용한 비밀번호 암호화',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">요구사항</h2>
      </div>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <ul className="space-y-3">
          {requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-700">
              <span className="text-purple-600 font-bold">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}