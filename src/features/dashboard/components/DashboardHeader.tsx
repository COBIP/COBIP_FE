import { Bell, Settings, User } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  userProgress?: number;
}

export function DashboardHeader({
  userName = 'Alex',
  userProgress = 5,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            반가워요, {userName}님! 이번 주 상위 {userProgress}%의 열정 학습자입니다.
          </p>
          <h1 className="text-3xl font-bold text-gray-900">학습 대시보드</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            리포트 다운로드
          </button>

          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
            학습 이어가기
          </button>

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
      </div>
    </header>
  );
}