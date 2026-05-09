import axios from 'axios';
import { useUserStore } from '@/store/UseUserStore';

const axiosInstance = axios.create({
    // 실제 서버 주소나 환경 변수로 변경하세요
    baseURL: 'http://localhost:8080', 
    timeout: 5000,
});

// API 요청을 보내기 직전에 가로채는 인터셉터
axiosInstance.interceptors.request.use(
    (config) => {
        // Zustand 스토어에서 상태를 직접 가져옵니다
        const token = useUserStore.getState().accessToken;
        
        // 토큰이 있다면 Header에 Bearer 방식으로 추가
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;