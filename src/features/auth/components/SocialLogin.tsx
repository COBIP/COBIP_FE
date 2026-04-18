
import Image from 'next/image';

export default function SocialLogin(){
    return (
        <div className="grid grid-cols-1 gap -3">
            <button
                className="flex items-center justify-center gap-2 w-full h-11 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200 mb-3"
                type="button"
            >
                <span>Google</span>
            </button>

            <button
                className="flex items-center justify-center gap-2 w-full h-11 px-4 text-xs font-semibold text-[#3c1e1e] bg-[#FEE500] border border-[#FEE500] rounded-xl hover:bg-[#FADA00] transition-colors duration-200 mb-3"
                    type="button"
            >
                <span>Kakao</span>
            </button>

            <button
                className="flex items-center justify-center gap-2 w-full h-11 px-4 text-xs font-semibold text-white bg-[#03C75A] border border-[#03C75A] rounded-xl hover:bg-[#02b351] transition-colors duration-200"
                type="button"
            >
                <span>Naver</span>
            </button>
        </div>
    );
}
