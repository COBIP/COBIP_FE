import { type SignUpRequest, type ApiResponse } from '@/types/AuthTypes';

import axiosInstance from '@/api/AxiosInstance';
import {
    EmailVerificationSendRequest,
    EmailVerificationConfirmRequest
} from '@/types/AuthTypes';

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


export const sendEmailCodeApi = async (data: EmailVerificationSendRequest) => {
    // ⚠️ 주의: '/api/v1/auth/email/send' 부분은 백엔드 설정에 따라 다를 수 있습니다.
    // Swagger UI를 확인하시고 정확한 주소로 변경해 주세요!
    const response = await axiosInstance.post('/api/v1/auth/email/send', data);
    return response.data;
};

// ✨ 2. 이메일 인증번호 확인(검증) API
export const verifyEmailCodeApi = async (data: EmailVerificationConfirmRequest) => {
    // ⚠️ 주의: 여기도 백엔드 Swagger를 확인하고 정확한 엔드포인트로 맞춰주세요.
    const response = await axiosInstance.post('/api/v1/auth/email/verify', data);
    return response.data;
};