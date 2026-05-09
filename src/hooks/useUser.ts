import { useState, useEffect } from 'react';
import { type UserProfile } from '@/types/UserTypes';
import { authService } from '@/api/services/UserService';

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setLoading] = useState(true); // 1. 변수명 변경
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError("로그인 정보가 없습니다.");
                setLoading(false);
                return;
            }

            try {
                const profileData = await authService.getMyProfile(token);
                setUser(profileData);
            } catch (err: unknown) { // 1. any를 unknown으로 변경 (TS 보안 규칙 준수)
                if (err instanceof Error) {
                    console.error("인증 실패:", err.message);
                } else {
                    console.error("알 수 없는 에러 발생:", err);
                }

                setError("인증 세션이 만료되었습니다.");
                localStorage.removeItem('accessToken'); // 만료된 토큰 청소
            } finally {
                setLoading(false); // 2. loading 대신 setIsLoading 사용 (Prefix 규칙 준수)
            }
        };

        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        window.location.href = '/';
    };

    return { user, isLoading, error, logout };
};