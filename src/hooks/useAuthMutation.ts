import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAPI } from '@/api/services/LoginService';
import { authService } from '@/api/services/UserService';
import { useUserStore } from '@/store/UseUserStore';
import { type LoginRequest } from '@/types/LoginType';

export const useAuthMutation = () => {
    const router = useRouter();
    const setLoginSession = useUserStore((state) => state.setLoginSession);
    const [isLoading, setIsLoading] = useState(false);

    const mutateLogin = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            // 로그인 응답에는 닉네임이 없을 수 있으므로, 성공 후 내 프로필을 다시 조회합니다.
            const authResponse = await loginAPI(data);

            if (authResponse.accessToken) {
                let nickname = authResponse.nickname ?? null;
                let profileImage: string | null = null;

                try {
                    const profile = await authService.getMyProfile(authResponse.accessToken);
                    nickname = profile?.nickname ?? nickname;
                    profileImage = profile?.profileImageUrl ?? null;
                } catch (profileError) {
                    console.warn('프로필 조회 실패, 로그인 응답 값으로 진행합니다:', profileError);
                }

                setLoginSession(authResponse.accessToken, nickname ?? 'User', profileImage);
                alert("로그인 성공!");
                router.push("/my-page/profile");
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