import { Lightbulb, Gift, Star, Zap } from 'lucide-react';

export function GrammarRightSidebar() {
  return (
    <div className="w-48 bg-white border-l border-gray-200 flex flex-col h-full p-3 space-y-2.5 overflow-y-auto">
      <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 border border-purple-200 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={15} className="text-purple-600" />
          <h3 className="text-xs font-bold text-purple-900">AI 어시스턴트</h3>
        </div>
        <p className="text-[11px] text-purple-800 leading-relaxed">
          이 단계에서는 배열의 각 요소를 순회하는 방법을 배우고 있습니다. 변수 값의 변화를 주의 깊게 관찰하세요.
        </p>
      </div>

      <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-2.5 border border-green-200 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Gift size={15} className="text-green-600" />
          <h3 className="text-xs font-bold text-green-900">현재 보너스</h3>
        </div>
        <p className="text-[11px] text-green-800 font-semibold">+50 포인트</p>
        <p className="text-[11px] text-green-700">이 단계를 완료하면 추가 보너스를 획득합니다.</p>
      </div>

      <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Star size={15} className="text-blue-600" />
          <h3 className="text-xs font-bold text-blue-900">학습 포인트</h3>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-blue-800">총 포인트</span>
            <span className="text-xs font-bold text-blue-600">1,250</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-blue-800">이번 주</span>
            <span className="text-xs font-bold text-blue-600">320</span>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-2.5 border border-amber-200 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb size={15} className="text-amber-600" />
          <h3 className="text-xs font-bold text-amber-900">언어 꿀팁</h3>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Python의 for 루프는 다른 언어와 달리 인덱스 대신 요소 자체를 직접 순회합니다. 이를 활용하면 더 간결한 코드를 작성할 수 있습니다.
        </p>
      </div>
    </div>
  );
}