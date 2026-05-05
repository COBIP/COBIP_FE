'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    BookOpen, 
    FileEdit, 
    Archive, 
    FileText, 
    CreditCard, 
    UserCog, 
    Settings,
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
                <SidebarLink href="/profile" icon={<UserCog size={20} />} title="프로필" />
                <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} title="대시보드" />
                <SidebarLink href="/my-learning" icon={<BookOpen size={20} />} title="내학습" />
                <SidebarLink href="/subscription" icon={<CreditCard size={20} />} title="구독관리" />
                <SidebarLink href="/review-note" icon={<FileEdit size={20} />} title="오답노트" />
                <SidebarLink href="/archive" icon={<Archive size={20} />} title="보관함" />
                <SidebarLink href="/posts" icon={<FileText size={20} />} title="작성한 게시글" />
                <SidebarLink href="/settings" icon={<Settings size={20} />} title="계정관리" />
            </nav>
            
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