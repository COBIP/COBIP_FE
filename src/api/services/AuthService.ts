import {
    type SignUpRequest,
    type ApiResponse,
    type EmailVerificationSendRequest,
    type EmailVerificationConfirmRequest
} from '@/types/AuthTypes';

import axiosInstance from '@/api/AxiosInstance';
import { API_BASE_URL } from '@/api/services/ApiConfig';

const AUTH_API_URL = `${API_BASE_URL}/api/v1/auth`;

export const signUpApi = async (data: SignUpRequest): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${AUTH_API_URL}/signup`, {
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


// ✨ 1. 이메일 인증번호 발송 요청 API (수정 완료!)
export const sendEmailCodeApi = async (data: EmailVerificationSendRequest) => {
    // AuthController.java의 @PostMapping("/email-verifications") 매핑
    const response = await axiosInstance.post('/api/v1/auth/email-verifications', data);
    return response.data;
};

// ✨ 2. 이메일 인증번호 확인 API (수정 완료!)
export const verifyEmailCodeApi = async (data: EmailVerificationConfirmRequest) => {
    // AuthController.java의 @PostMapping("/email-verifications/confirm") 매핑
    const response = await axiosInstance.post('/api/v1/auth/email-verifications/confirm', data);
    return response.data;
};
