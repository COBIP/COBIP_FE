import { type SignUpRequest, type ApiResponse } from '@/types/AuthTypes';

const BASE_URL = 'http://localhost:8080/api/v1/auth';

export const signUpApi = async (data: SignUpRequest): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    // 1. 에러가 나든 성공하든 일단 백엔드의 응답 결과를 파싱합니다.
    const result = await response.json();

    if (!response.ok) {
        // 2. 백엔드에서 보내준 에러 메시지(result.message)가 있으면 그걸 띄우고, 없으면 기본 메시지를 띄웁니다.
        throw new Error(result.message || '회원가입 요청에 실패했습니다.');
    }

    return result;
};