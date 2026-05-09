import axiosInstance from '@/api/AxiosInstance';

// 백엔드 LoginRequest DTO에 맞춘 프론트엔드 타입
export interface LoginRequest {
    email: string;
    password: string;
}

export const loginAPI = async (data: LoginRequest) => {
    // 백엔드 AuthController의 응답 형식(ApiResponse<AuthResponse>)에 맞춰 호출
    const response = await axiosInstance.post('/api/v1/auth/login', data);
    return response.data; // 성공 시 data 안에 토큰 정보가 들어있습니다.
};