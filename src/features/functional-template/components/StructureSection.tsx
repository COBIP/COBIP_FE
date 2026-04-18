import { Layers } from 'lucide-react';

export function StructureSection() {
  const points = [
    { title: 'POINT 1', subtitle: '클라이언트 요청', desc: '사용자가 로그인 요청을 보냅니다.' },
    { title: 'POINT 2', subtitle: '서버 검증', desc: '서버는 데이터베이스에서 사용자를 찾습니다.' },
    { title: 'POINT 3', subtitle: '토큰 발급', desc: 'JWT 토큰을 생성하여 반환합니다.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">구조 설명</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {points.map((point, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm font-bold text-purple-600 mb-2">{point.title}</p>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{point.subtitle}</h3>
            <p className="text-sm text-gray-600">{point.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}