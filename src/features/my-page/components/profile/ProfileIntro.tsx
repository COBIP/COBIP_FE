import { Info, Sparkles } from 'lucide-react';

export default function ProfileIntro() {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={24} className="text-[#6938d6]" />
          <h3 className="text-[24px] font-semibold text-[#1c1b1b]">소개</h3>
        </div>
      </div>

      <div className="rounded-lg border border-[#cbc3d7]/70 bg-[#fcf9f8] p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4effc] text-[#6938d6]">
          <Sparkles size={22} />
        </div>
        <h4 className="mb-3 text-[22px] font-bold text-[#1c1b1b]">꾸준히 배우고, 직접 만들어보는 개발자입니다.</h4>
        <p className="max-w-3xl text-[16px] leading-7 text-[#494454]">
          기능 템플릿과 문법 학습을 통해 아이디어를 실제 서비스 흐름으로 연결하는 과정을 좋아합니다.
          작은 실습도 끝까지 완성해보며, 배운 내용을 다음 프로젝트에 바로 적용하는 방식으로 성장하고 있어요.
        </p>
      </div>
    </div>
  );
}
