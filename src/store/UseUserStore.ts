import { create } from 'zustand';
import { getRoleFromAccessToken, type TokenRole } from '@/utils/AuthToken';

interface UserState {
  isLoggedIn: boolean;
  accessToken: string | null;
  nickname: string | null;
  profileImage: string | null;
  role: TokenRole | null;
  setLoginSession: (
    token: string,
    nickname?: string,
    profileImage?: string | null,
    role?: TokenRole | null,
  ) => void;
  clearSession: () => void;
}

const getInitialSession = () => {
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      accessToken: null,
      nickname: null,
      profileImage: null,
      role: null,
    };
  }

  const accessToken = localStorage.getItem('accessToken') ?? localStorage.getItem('access_token');
  const nickname = localStorage.getItem('nickname');
  const profileImage = localStorage.getItem('profileImage');
  const storedRole = localStorage.getItem('userRole') as TokenRole | null;

  if (!accessToken) {
    return {
      isLoggedIn: false,
      accessToken: null,
      nickname: null,
      profileImage: null,
      role: null,
    };
  }

  return {
    isLoggedIn: true,
    accessToken,
    nickname: nickname || 'User',
    profileImage,
    role: storedRole ?? getRoleFromAccessToken(accessToken),
  };
};

export const useUserStore = create<UserState>((set) => ({
  ...getInitialSession(),

  setLoginSession: (token: string, nickname = 'User', profileImage = null, role = null) => {
    set({ isLoggedIn: true, accessToken: token, nickname, profileImage, role });

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('nickname', nickname);

      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      } else {
        localStorage.removeItem('profileImage');
      }

      if (role) {
        localStorage.setItem('userRole', role);
      } else {
        localStorage.removeItem('userRole');
      }
    }
  },

  clearSession: () => {
    set({ isLoggedIn: false, accessToken: null, nickname: null, profileImage: null, role: null });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('nickname');
      localStorage.removeItem('profileImage');
      localStorage.removeItem('userRole');
    }
  },
}));
