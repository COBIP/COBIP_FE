'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import {
  accountManagementService,
  type PasswordChangePayload,
  type WithdrawalPayload,
} from '@/api/services/AccountManagementService';
import { useUserStore } from '@/store/UseUserStore';

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }
  }

  return fallback;
}

function getCurrentPasswordErrorMessage(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  return message === '이메일 또는 비밀번호가 올바르지 않습니다.'
    ? '현재 비밀번호가 올바르지 않습니다.'
    : message;
}

export function useAccountManagement() {
  const clearSession = useUserStore((state) => state.clearSession);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  const changePassword = async (payload: PasswordChangePayload) => {
    setIsPasswordSaving(true);
    setPasswordMessage('');

    try {
      await accountManagementService.changePassword(payload);
      return true;
    } catch (changeError) {
      setPasswordMessage(getCurrentPasswordErrorMessage(changeError, '비밀번호 변경에 실패했습니다.'));
      return false;
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const withdraw = async (payload: WithdrawalPayload) => {
    setIsWithdrawing(true);
    setWithdrawalMessage('');

    try {
      await accountManagementService.withdraw(payload);
      clearSession();
      window.location.assign('/');
      return true;
    } catch (withdrawError) {
      setWithdrawalMessage(getCurrentPasswordErrorMessage(withdrawError, '회원 탈퇴에 실패했습니다.'));
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    changePassword,
    isPasswordSaving,
    isWithdrawing,
    passwordMessage,
    withdrawalMessage,
    withdraw,
  };
}
