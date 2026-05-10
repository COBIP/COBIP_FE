'use client';

import Image from 'next/image';
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

interface MyPageSidebarProps {
    user: {
        nickName: string;
        image?: string;
    };
}

export default function MyPageSidebar({ user }: MyPageSidebarProps) {
    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-t border-[#e5e2e1] bg-white flex flex-col p-6 z-40 hidden md:flex ">
            
            {/* 프로필 출력 */}
            <div className="flex flex-col items-center pb-6 border-b border-[#e5e2e1]">
                <div className="w-16 h-16 bg-[#f0edec] rounded-full flex items-center justify-center mb-3 shadow-md border-4 border-[#e5e2e1] overflow-hidden">
                    {user.image ? (
                        <Image 
                            src={user.image || "/default-profile.png"} 
                            alt="프로필 이미지" 
                            width={60} 
                            height={60} 
                            className="rounded-full"
                        />                    
                    ) : (
                        <User size={20} className="text-gray-600" />
                    )}
                </div>
                <h2 className="text-lg font-bold text-[#1c1b1b]">{user.nickName}</h2>
            </div>

            {/* 사이드바 */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <SidebarLink href="/my-page/profile" icon={<UserCog size={20} />} title="프로필" />
                <SidebarLink href="/my-page/dashboard" icon={<LayoutDashboard size={20} />} title="대시보드" />
                <SidebarLink href="/my-page/my-learning" icon={<BookOpen size={20} />} title="내학습" />
                <SidebarLink href="/my-page/subscription" icon={<CreditCard size={20} />} title="구독관리" />
                <SidebarLink href="/my-page/review-note" icon={<FileEdit size={20} />} title="오답노트" />
                <SidebarLink href="/my-page/archive" icon={<Archive size={20} />} title="보관함" />
                <SidebarLink href="/my-page/posts" icon={<FileText size={20} />} title="작성한 게시글" />
                <SidebarLink href="/my-page/settings" icon={<Settings size={20} />} title="계정관리" />
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
    
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${
                isActive 
                ? "bg-[#f4effc] text-[#6938d6] font-bold" 
                : "text-[#494454] hover:bg-[#f9f8fe] hover:text-[#6938d6]"
            }`}
        >
            {icon}
            <span>{title}</span>
        </Link>
    );
}