import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from 'next/image';
import { Menu, Globe, HelpCircle, Key, UserCheck, LogOut, User, CreditCard } from "lucide-react";
import { useUserStore } from "@/store/UseUserStore";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isLoggedIn, nickname, profileImage, clearSession } = useUserStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // 클라이언트 마운트 체크
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

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

  const getInitial = () => {
    if (!nickname) return 'U';
    return nickname.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    clearSession();
    closeMenu();
  };

  // 클라이언트에서만 렌더링
  if (!isMounted) {
    return null;
  }

  return (
    <header className="border-b border-gray-100 bg-white/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="relative">
        {/* 로고 - 화면 좌측 끝에 가깝게 */}
        <div className="absolute left-6 top-0 h-16 flex items-center">
          <Link href="/main-home" className="flex items-center cursor-pointer transition hover:opacity-80">
            <span className="text-xl font-bold tracking-tight text-slate-950">COBIP</span>
          </Link>
        </div>

        {/* 우측 버튼 그룹 - 화면 우측 끝에 가깝게 */}
        <div className="absolute right-2 top-0 h-16 flex items-center gap-3" ref={menuRef}>
          {!isLoggedIn ? (
            <button aria-label="로그인" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <button
              aria-label="프로필"
              className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm hover:shadow-md transition"
            >
              {profileImage ? (
                <Image src={profileImage} alt="profile" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                getInitial()
              )}
            </button>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* 드롭다운 메뉴 (절대 위치는 우측 버튼 그룹 기준) */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={closeMenu} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 z-40 py-1.5 overflow-hidden">
                {!isLoggedIn ? (
                  <div className="px-3 pb-1.5 border-b border-gray-100">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Key className="w-4 h-4 text-gray-400" />
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      회원가입
                    </Link>
                  </div>
                ) : (
                  <div className="px-3 pb-1.5 border-b border-gray-100">
                    <Link
                      href="/my-page/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      프로필
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-gray-400" />
                      로그아웃
                    </button>
                  </div>
                )}

                <div className="md:hidden px-3 py-2 border-b border-gray-100 space-y-1">
                  {[
                    { href: "/grammar-template", label: "문법 템플릿" },
                    { href: "/functional-template-hub", label: "기능 템플릿" },
                    { href: "/coding-test", label: "코테집" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="px-3 pt-1.5 space-y-1">
                  <Link
                    href="/pricing"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    요금제
                  </Link>
                  <Link
                    href="#"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 text-gray-400" />
                    커뮤니티
                  </Link>
                  <Link
                    href="#"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-normal text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    도움말센터
                  </Link>
                </div>
              </div>
            </>
          )}
        
        </div>

        {/* 중앙: max-width 컨테이너에 네비게이션 */}
        <div className="ml-32 mr-28 px-6">
          <div className="h-16 flex items-center">
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/grammar-template", label: "문법 템플릿" },
                { href: "/functional-template-hub", label: "기능 템플릿" },
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
          </div>
        </div>
      </div>
    </header>
  );
}

