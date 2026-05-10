import {
    type SignUpRequest,
    type ApiResponse,
    type EmailVerificationSendRequest,
    type EmailVerificationConfirmRequest
} from '@/types/AuthTypes';

import axios from 'axios';
import axiosInstance from '@/api/AxiosInstance';
import { API_BASE_URL } from '@/api/services/ApiConfig';

const AUTH_API_URL = `${API_BASE_URL}/api/v1/auth`;
const EMAIL_VERIFICATION_TIMEOUT_MS = 15000;

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
    try {
        const response = await axiosInstance.post<ApiResponse<unknown>>('/api/v1/auth/email-verifications', data, {
            timeout: EMAIL_VERIFICATION_TIMEOUT_MS,
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            throw new Error('인증번호 발송 응답이 지연되고 있습니다. 잠시 후 메일함을 확인하거나 다시 시도해주세요.');
        }

        throw error;
    }
};

// ✨ 2. 이메일 인증번호 확인 API (수정 완료!)
export const verifyEmailCodeApi = async (data: EmailVerificationConfirmRequest) => {
    // AuthController.java의 @PostMapping("/email-verifications/confirm") 매핑
    const response = await axiosInstance.post<ApiResponse<unknown>>('/api/v1/auth/email-verifications/confirm', data);
    return response.data;
};
