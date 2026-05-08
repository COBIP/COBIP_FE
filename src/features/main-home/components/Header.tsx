import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Globe, HelpCircle, LogIn, UserPlus } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="border-b border-gray-100 bg-white/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/main-home" className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:shadow-lg group-hover:shadow-purple-300 transition-shadow">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
              </svg>
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">COBIP</span>
          </Link>

          {/* 네비게이션 (데스크탑) */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/grammar-template", label: "문법 템플릿" },
              { href: "/functional-template-hub", label: "기능 템플릿" },
              { href: "/playground", label: "실습환경" },
              { href: "/coding-test", label: "코테집" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-[15px] font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50/60 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측: 햄버거 버튼 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`
                flex items-center gap-2 px-3.5 py-2.5 rounded-full border transition-all cursor-pointer
                ${isMenuOpen
                  ? "border-purple-300 bg-purple-50 shadow-sm"
                  : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
                }
              `}
            >
              <Menu className="w-4 h-4 text-gray-700" />
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <>
                {/* 오버레이 (모바일) */}
                <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={closeMenu} />

                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 z-40 py-1.5 overflow-hidden">
                  {/* 사용자 영역 */}
                  <div className="px-3 pb-1.5 border-b border-gray-100">
                    <Link
                    href="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                      <LogIn className="w-3.5 h-3.5 text-gray-400" />
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                      <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                      회원가입
                    </Link>
                  </div>

                  {/* 모바일 전용 네비게이션 */}
                  <div className="md:hidden px-3 py-1.5 border-b border-gray-100">
                    {[
                      { href: "/grammar-template", label: "문법 템플릿" },
                      { href: "/functional-template-hub", label: "기능 템플릿" },
                      { href: "/playground", label: "실습환경" },
                      { href: "/coding-test", label: "코테집" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-2.5 py-1.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
          </div>

                  {/* 서비스 메뉴 */}
                  <div className="px-3 pt-1.5">
                    <Link
                      href="#"
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      커뮤니티
                    </Link>
                    <Link
                      href="#"
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      도움말센터
                    </Link>
      </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

