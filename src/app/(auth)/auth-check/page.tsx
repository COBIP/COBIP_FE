'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AuthCheckPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 1. 로컬 스토리지에서 토큰 삭제
    localStorage.removeItem('accessToken');
    
    // 2. 유저 상태 초기화
    setUser(null);
    
    // 3. 페이지 새로고침 또는 메인 페이지로 이동
    window.location.href = '/'; 
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError("로그인 정보가 없습니다.");
      setLoading(false);
      return;
    }

    // 백엔드 v1 API 호출 (순규 님의 UserController 경로 반영)
    axios.get('http://localhost:8080/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      // MyProfileResponse 규격 데이터 저장
      setUser(res.data.data); 
    })
    .catch(err => {
      console.error("인증 실패:", err);
      setError("인증 세션이 만료되었습니다.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">인증 상태 확인 중...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">COBIP 인증 시스템</h1>
        {user && (
          <button 
            onClick={handleLogout}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
          >
            로그아웃
          </button>
        )}
      </div>

      {user ? (
        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          <div className="flex items-center gap-6 mb-8">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="프로필" className="w-20 h-20 rounded-full object-cover border-2 border-blue-100" />
            ) : (
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-inner">
                {user.nickname?.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.nickname} 님</h2>
              <p className="text-blue-500 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">계정 고유 번호</span>
              <span className="font-mono text-gray-700">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">COBIP 가입 일자</span>
              <span className="text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ● 보안 연결 활성화됨
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-8 text-center border border-red-50">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            로그인 하러 가기
          </button>
        </div>
      )}
    </div>
  );
}