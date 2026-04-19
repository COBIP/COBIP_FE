import { LayoutDashboard, User } from 'lucide-react';

interface DashboardSidebarProps {
  activeMenu?: string;
}

export function DashboardSidebar({
  activeMenu = 'dashboard',
}: DashboardSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'profile', label: '내 정보', icon: User },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">COBIP</p>
            <p className="text-xs text-gray-500">CODE BUILD IN PROGRESS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-semibold border-l-4 border-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-purple-600 rounded-lg p-4 text-white text-center">
          <p className="text-xs font-semibold mb-2">프로 플랜</p>
          <p className="text-xs mb-3">200개 이상의 강의 학습</p>
          <button className="w-full bg-white text-purple-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">
            더 알아보기
          </button>
        </div>
      </div>
    </aside>
  );
}