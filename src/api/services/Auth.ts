import { SignUpRequest, ApiResponse } from '@/types/Auth.type';

// axiosInstance가 src/api/axiosInstance.ts에 세팅되어 있다고 가정합니다.
// 만약 아직 없다면, fetch를 사용하거나 axios 인스턴스를 하나 만들어주세요.
const BASE_URL = 'http://localhost:8080/api/v1/auth';

export const signUpApi = async (data: SignUpRequest): Promise<ApiResponse<any>> => {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('회원가입 요청에 실패했습니다.');
    }

    return response.json();
};