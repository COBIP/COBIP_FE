import { create } from 'zustand';

interface UserState {
  isLoggedIn: boolean;
  accessToken: string | null;
  nickname: string | null;
  profileImage: string | null;
  setLoginSession: (token: string, nickname?: string, profileImage?: string | null) => void;
  clearSession: () => void;
}

const getInitialSession = () => {
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      accessToken: null,
      nickname: null,
      profileImage: null,
    };
  }

  const accessToken = localStorage.getItem('accessToken');
  const nickname = localStorage.getItem('nickname');
  const profileImage = localStorage.getItem('profileImage');

  if (!accessToken) {
    return {
      isLoggedIn: false,
      accessToken: null,
      nickname: null,
      profileImage: null,
    };
  }

  return {
    isLoggedIn: true,
    accessToken,
    nickname: nickname || 'User',
    profileImage,
  };
};

export const useUserStore = create<UserState>((set) => ({
  ...getInitialSession(),

  setLoginSession: (token: string, nickname = 'User', profileImage = null) => {
    set({ isLoggedIn: true, accessToken: token, nickname, profileImage });
    // Next.js 환경에서는 클라이언트 사이드에서만 localStorage에 접근하도록 보장하는 것이 좋습니다.
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('nickname', nickname);
        if (profileImage) {
          localStorage.setItem('profileImage', profileImage);
        } else {
          localStorage.removeItem('profileImage');
        }
    }
  },

  clearSession: () => {
    set({ isLoggedIn: false, accessToken: null, nickname: null, profileImage: null });
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nickname');
        localStorage.removeItem('profileImage');
    }
  },
}));
