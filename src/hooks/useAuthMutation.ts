import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAPI } from '@/api/services/LoginService';
import { useUserStore } from '@/store/useUserStore';
import { LoginRequest } from '@/types/LoginType';

export const useAuthMutation = () => {
    const router = useRouter();
    const setLoginSession = useUserStore((state) => state.setLoginSession);
    const [isLoading, setIsLoading] = useState(false);

    const mutateLogin = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await loginAPI(data);
            
            // 백엔드 응답 구조에 맞춰 토큰 추출
            const token = response.data?.accessToken; 
            if (token) {
                setLoginSession(token);
                alert("로그인 성공!");
                router.push("/dashboard");
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