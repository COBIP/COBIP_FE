'use client';

import { useUserStore } from '@/store/useUserStore'; // 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCheckPage() {
    const { isLoggedIn, accessToken, clearSession } = useUserStore();
    const router = useRouter();
    
    // Next.js 하이드레이션(서버-클라이언트 불일치) 에러 방지용 상태
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogout = () => {
        // Zustand 스토어와 localStorage에서 정보를 삭제합니다 
        clearSession();
        alert("로그아웃 되었습니다. 메인 페이지로 이동합니다.");
        // 메인(랜딩) 페이지로 이동 
        router.push("/"); 
    };

    // 마운트 전에는 아무것도 렌더링하지 않음 (localStorage 접근 때문)
    if (!isMounted) return null;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>🔐 인증 상태 확인 테스트</h1>
            <hr />
            
            <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
                <p>
                    <strong>로그인 메시지:</strong> {isLoggedIn ? "✅ 로그인 상태입니다." : "❌ 로그인되지 않았습니다."}
                </p>
                <p style={{ wordBreak: 'break-all' }}>
                    <strong>현재 Access Token:</strong> <br />
                    <code style={{ backgroundColor: '#f0f0f0', display: 'block', padding: '10px', marginTop: '5px' }}>
                        {accessToken || "토큰 없음"}
                    </code>
                </p>
            </div>

            {isLoggedIn ? (
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    로그아웃 및 메인으로 이동
                </button>
            ) : (
                <button 
                    onClick={() => router.push("/login")}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    로그인 페이지로 이동
                </button>
            )}
        </div>
    );
}