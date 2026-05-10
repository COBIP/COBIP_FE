import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAPI } from '@/api/services/LoginService';
import { authService } from '@/api/services/UserService';
import { useUserStore } from '@/store/UseUserStore';
import { type LoginRequest } from '@/types/LoginType';
import { getRoleFromAccessToken, type TokenRole } from '@/utils/AuthToken';

export const useAuthMutation = () => {
    const router = useRouter();
    const setLoginSession = useUserStore((state) => state.setLoginSession);
    const [isLoading, setIsLoading] = useState(false);

    const mutateLogin = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const authResponse = await loginAPI(data);

            if (authResponse.accessToken) {
                let role: TokenRole | null = authResponse.role ?? getRoleFromAccessToken(authResponse.accessToken);
                let nickname = authResponse.nickname ?? null;
                let profileImage = authResponse.profileImageUrl ?? null;

                try {
                    const profile = await authService.getMyProfile(authResponse.accessToken);
                    role = profile?.role ?? role;
                    nickname = profile?.nickname ?? nickname;
                    profileImage = profile?.profileImageUrl ?? null;
                } catch (profileError) {
                    console.warn('프로필 조회 실패, 로그인 응답 값으로 진행합니다.', profileError);
                }

                setLoginSession(authResponse.accessToken, nickname ?? 'User', profileImage, role);
                alert("로그인 성공!");
                router.replace(role === 'ADMIN' ? "/admin" : "/");
            } else {
                alert("로그인에 실패했습니다.");
            }
        } catch (error) {
            console.error("로그인 실패:", error);
            alert("로그인에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return { mutateLogin, isLoading };
};
