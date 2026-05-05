import MyPageHeader from "@/features/my-page/components/common/MyPageHeader"; 
import MyPageSidebar from "@/features/my-page/components/common/MyPageSidebar";

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <MyPageHeader />
        <MyPageSidebar />
    
        <div className="flex flex-col flex-1 min-w-0 pt-16 md:pl-64">
            <main className="p-4 md:p-8">{children}</main>
        </div>
    </div>
  );
}