import { Lightbulb, Gift, Star, Zap } from 'lucide-react';

interface GrammarRightSidebarProps {
  levelTitle?: string;
}

export function GrammarRightSidebar({
  levelTitle = '변수 선언',
}: GrammarRightSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col space-y-4 overflow-y-auto border-l border-gray-200 bg-white p-6">
      <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4 space-y-2">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={18} className="text-purple-600" />
          <h3 className="text-sm font-bold text-purple-900">AI 어시스턴트</h3>
        </div>
        <p className="text-xs text-purple-800 leading-relaxed">
          현재 {levelTitle} 단계를 학습하고 있습니다. 코드의 각 라인을 주의 깊게 관찰하세요.
        </p>
      </div>

      <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4 space-y-2">
        <div className="mb-3 flex items-center gap-2">
          <Gift size={18} className="text-green-600" />
          <h3 className="text-sm font-bold text-green-900">현재 보너스</h3>
        </div>
        <p className="text-xs font-semibold text-green-800">+50 포인트</p>
        <p className="text-xs text-green-700">이 단계를 완료하면 추가 보너스를 획득합니다.</p>
      </div>

      <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 space-y-2">
        <div className="mb-3 flex items-center gap-2">
          <Star size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-blue-900">학습 포인트</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-800">총 포인트</span>
            <span className="text-sm font-bold text-blue-600">1,250</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-800">이번 주</span>
            <span className="text-sm font-bold text-blue-600">320</span>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4 space-y-2">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-600" />
          <h3 className="text-sm font-bold text-amber-900">언어 꿀팁</h3>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Python의 변수는 동적 타입입니다. 같은 변수에 다른 타입의 값을 할당할 수 있습니다.
        </p>
      </div>
    </div>
  );
}