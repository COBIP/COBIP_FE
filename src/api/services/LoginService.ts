import axiosInstance from '@/api/AxiosInstance';

// 백엔드 LoginRequest DTO에 맞춘 프론트엔드 타입
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    nickname?: string;
}

export const loginAPI = async (data: LoginRequest): Promise<LoginResponse> => {
    // 백엔드 AuthController의 응답 형식: ApiResponse<AuthResponse>
    // response.data = { success, message, data: { accessToken, refreshToken, nickname?, ... } }
    const response = await axiosInstance.post('/api/v1/auth/login', data);
    
    // 백엔드 data 필드 (AuthResponse)를 바로 반환
    if (response.data?.data) {
        return response.data.data;
    }
    
    throw new Error('로그인 응답이 올바르지 않습니다.');
};