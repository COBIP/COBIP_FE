'use client';

import { useAuth } from '@/hooks/useUser'; // 방금 만든 훅 가져오기

export default function AuthCheckPage() {
  // 로직은 훅에게 맡기고 결과만 받아옵니다!
  const { user, loading, error, logout } = useAuth();

  if (loading) return <div>인증 상태 확인 중...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      {user ? (
        <div>
          <h1>환영합니다, {user.nickname}님!</h1>
          {/* ... UI 코드 ... */}
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <div>
          <h1>로그인이 필요합니다</h1>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}