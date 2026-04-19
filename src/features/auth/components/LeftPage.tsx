import Link from "next/link"; // ✨ 1. Link 컴포넌트 불러오기

export default function LoginHero() {
    return(
        <div>
            {/* ✨ 2. 최상단 div를 Link로 변경하고 href="/" 추가 */}
            <Link href="/main-home" className="absolute top-12 left-12 flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <div className="w-8 h-8 bg-[#D7C9FB] rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                        <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
                    </svg>
                </div>
                <h2 className="text-slate-900 text-2xl font-bold tracking-tight">COBIP</h2>
            </Link>

            {/* ── 아래 텍스트 영역은 그대로 유지 ── */}
            <div className="relative z-10 max-w-lg">
                <div className="mb-8 flex gap-2">
                    <span className="inline-block px-3 py-1 bg-[#D7C9FB]/30 text-[#6B4EAB] text-xs font-bold rounded-full uppercase tracking-widest">
                        Self-Directed Learning
                    </span>
                </div>

                <h1 className="text-slate-900 text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                    Elevate your <br />
                    <span className="text-[#6B4EAB]">code architecture.</span>
                </h1>

                <h2 className="text-slate-800 text-3xl font-bold mb-6">Master your architectural patterns.</h2>
                
                <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                    Interactive learning platform designed for developers to build production-ready architecture and streamline the development process.
                </p>
            </div>

        </div>
    );
}