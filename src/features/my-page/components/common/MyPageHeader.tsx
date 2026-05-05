import { Bell, Settings, User } from 'lucide-react';
import Link from "next/link";

export default function MyPageHeader(){
    return(
        <header className="bg-white border-b border-[#e5e2e1] flex justify-between items-center px-10 h-16 w-full fixed top-0 z-50 shadow-sm font-manrope antialiased tracking-tight">            
            <div className="flex items-center gap-8">
                <div className="text-2xl font-black tracking-tighter text-[#6938d6]">
                    <COBIP/>
                </div>
                <nav className="hidden md:flex gap-6">
                    <HeaderLink pageLink='/#' title='문법 템플릿'/>
                    <HeaderLink pageLink='/#' title='기능 템플릿'/>
                    <HeaderLink pageLink='/#' title='자료 구조'/>
                    <HeaderLink pageLink='/#' title='코테집'/>
                    <HeaderLink pageLink='/#' title='커뮤니티'/>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Bell size={20} className="text-gray-600" />
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Settings size={20} className="text-gray-600" />
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <User size={20} className="text-gray-600" />
                </button>
            </div>
        </header>
    );
}

interface LinkProps {
    pageLink: string; 
    title: string;
}

function HeaderLink(props: LinkProps){
    return(
        <Link 
            href={props.pageLink}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg">
                {props.title}
        </Link>
    );
}

function COBIP(){
    return(
        <Link href="/main-home" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <div className="w-8 h-8 bg-[#D7C9FB] rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                    <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
                </svg>
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">COBIP</span>
        </Link>
    );
}