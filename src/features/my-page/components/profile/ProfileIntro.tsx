import { FileSignature, Info } from 'lucide-react';

export default function ProfileIntro() {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={24} className="text-[#6938d6]" />
          <h3 className="text-[24px] font-semibold text-[#1c1b1b]">소개</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbc3d7]/60 bg-[#fcf9f8] px-6 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0edec] text-[#494454]/50">
          <FileSignature size={30} />
        </div>
        <h4 className="mb-2 text-[22px] font-bold text-[#1c1b1b]">아직 소개글이 작성되지 않았어요</h4>
        <p className="max-w-md text-[16px] leading-7 text-[#494454]">
          자기소개, 관심 분야, 학습 목표를 채우면 프로필에서 더 자연스럽게 보여줄 수 있어요.
        </p>
      </div>
    </div>
  );
}
