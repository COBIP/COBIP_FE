import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          {/* 로고 */}
          <Link href="/main-home" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="w-8 h-8 bg-[#D7C9FB] rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
              </svg>
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">COBIP</span>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex gap-6">
            <Link href="/grammar-template" className="text-sm text-gray-600 hover:text-purple-700 transition">
              문법 템플릿
            </Link>
            <Link href="/functional-template-hub" className="text-sm text-gray-600 hover:text-purple-700 transition">
              기능 템플릿
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-700 transition">
              커뮤니티
            </a>
          </nav>

          {/* 로그인/회원가입 버튼 */}
          <div className="flex gap-2">
            <Link
              href="/login"
              className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition cursor-pointer flex items-center justify-center"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
