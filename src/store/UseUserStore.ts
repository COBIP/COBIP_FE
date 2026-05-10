import { create } from 'zustand';

interface UserState {
  isLoggedIn: boolean;
  accessToken: string | null;
  setLoginSession: (token: string) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  accessToken: null,

  setLoginSession: (token: string) => {
    set({ isLoggedIn: true, accessToken: token });
    // Next.js 환경에서는 클라이언트 사이드에서만 localStorage에 접근하도록 보장하는 것이 좋습니다.
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
    }
  },

  clearSession: () => {
    set({ isLoggedIn: false, accessToken: null });
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
    }
  },
}));
