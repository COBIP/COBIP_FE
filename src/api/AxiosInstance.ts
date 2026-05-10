import axios from 'axios';
import { useUserStore } from '@/store/UseUserStore';
import { API_BASE_URL } from '@/api/services/ApiConfig';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

// 인증이 필요 없는 경로 (로그인/회원가입/이메일 인증 등)
const publicPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/signup',
    '/api/v1/auth/email-verification',
    '/api/v1/auth/email-verifications',
    '/api/v1/auth/password-reset',
];

// API 요청을 보내기 직전에 가로채는 인터셉터
axiosInstance.interceptors.request.use(
    (config) => {
        // 공개 경로는 인증 토큰을 붙이지 않음
        const isPublicPath = publicPaths.some(path => config.url?.includes(path));
        
        if (!isPublicPath) {
            // Zustand 스토어에서 상태를 직접 가져옵니다
            const token = useUserStore.getState().accessToken;

            // 토큰이 있다면 Header에 Bearer 방식으로 추가
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
