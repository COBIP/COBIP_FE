'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Activity, 
    UserCog, 
    Settings, 
    HelpCircle, 
    LogOut,
    User
} from "lucide-react";

export default function MyPageSidebar() {
    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-[#e5e2e1] bg-white flex flex-col p-6 z-40 hidden md:flex">
            

            <div className="flex flex-col items-center pb-6 border-b border-[#e5e2e1]">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-md border-4 border-[#e5e2e1]">
                    <User size={20} className="text-gray-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1c1b1b]">순규</h2>
            </div>


            <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <div className="text-[11px] font-bold text-[#7a7486] mb-2 px-4 tracking-wider">내 학습</div>
                <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} title="대시보드" />
                <SidebarLink href="#" icon={<Activity size={20} />} title="최근 활동" />

                <div className="text-[11px] font-bold text-[#7a7486] mb-2 px-4 mt-6 tracking-wider">설정 및 관리</div>
                <SidebarLink href="#" icon={<UserCog size={20} />} title="프로필 설정" />
                <SidebarLink href="#" icon={<Settings size={20} />} title="계정 관리" />

                <div className="text-[11px] font-bold text-[#7a7486] mb-2 px-4 mt-6 tracking-wider">고객 지원</div>
                <SidebarLink href="#" icon={<HelpCircle size={20} />} title="문의하기" />
            </nav>


            <div className="mt-auto pt-4 border-t border-[#e5e2e1] space-y-2">
                <button className="w-full flex items-center gap-3 text-[#494454] px-4 py-3 hover:bg-[#f6f3f2] rounded-xl transition-colors text-sm font-medium">
                    <LogOut size={20} />
                    <span>로그아웃</span>
                </button>
            </div>
            
        </aside>
    );
}


interface SidebarLinkProps {
    href: string;
    title: string;
    icon: React.ReactNode;
}

function SidebarLink({ href, title, icon }: SidebarLinkProps) {
    const pathname = usePathname();
    
    // 현재소가 이 메뉴와 일치하는지 확인 (대시보드는 완전 일치, 나머지는 하위 경로 포함)
    const isActive = href === '/my-page' ? pathname === href : pathname?.startsWith(href);

    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${
                isActive 
                ? "bg-[#f0edec] text-[#6938d6] font-bold" 
                : "text-[#494454] hover:bg-[#fcf9f8] hover:text-[#6938d6]"
            }`}
        >
            {icon}
            <span>{title}</span>
        </Link>
    );
}