import MyPageHeader from "@/features/my-page/components/common/MyPageHeader"; 
import MyPageSidebar from "@/features/my-page/components/common/MyPageSidebar";
import { Manrope } from 'next/font/google';

// 1. Manrope 폰트 설정
const manrope = Manrope({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const user = {
    nickName: "nickName",
    image: "/test.png" 
  };

  return (
    // 2. 최상위 div에 폰트 클래스 삽입
    <div className={`flex min-h-screen bg-[#fcf9f8] ${manrope.className}`}>
        <MyPageHeader />
        <MyPageSidebar user={user} />
    
        <div className="flex flex-col flex-1 min-w-0 pt-16 md:pl-64">
            <main className="flex flex-col flex-1 p-4 md:p-8">{children}</main>
        </div>
    </div>
  );
}