import { useState, useEffect } from 'react';
import { type UserProfile } from '@/types/UserTypes';
import { authService } from '@/api/services/UserService';

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
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
            } catch (err: any) {
                console.error("인증 실패:", err);
                setError("인증 세션이 만료되었습니다.");
                localStorage.removeItem('accessToken'); // 만료된 토큰 청소
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        window.location.href = '/';
    };

    return { user, loading, error, logout };
};