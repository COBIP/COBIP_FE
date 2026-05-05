import MyPageHeader from "@/features/my-page/components/common/MyPageHeader"; 
import MyPageSidebar from "@/features/my-page/components/common/MyPageSidebar";

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const user = {
    nickName: "nickName",
    image: "이미지" 
  };

  return (
    <div className="flex min-h-screen bg-[#fcf9f8]">
        <MyPageHeader />
        <MyPageSidebar user={user} />
    
        <div className="flex flex-col flex-1 min-w-0 pt-16 md:pl-64">
            <main className="flex flex-col flex-1 p-4 md:p-8">{children}</main>
        </div>
    </div>
  );
}