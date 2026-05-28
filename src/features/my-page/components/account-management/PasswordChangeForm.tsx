'use client';

import { type FormEvent, useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import type { PasswordChangePayload } from '@/api/services/AccountManagementService';

interface PasswordChangeFormProps {
  isSaving: boolean;
  message: string;
  onSubmit: (payload: PasswordChangePayload) => Promise<boolean>;
}

export function PasswordChangeForm({ isSaving, message, onSubmit }: PasswordChangeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const closeModal = () => {
    if (isSaving) return;
    setIsOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setValidationMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationMessage('모든 비밀번호 항목을 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    const isSuccess = await onSubmit({ currentPassword, newPassword });
    if (!isSuccess) return;

    closeModal();
    window.alert('비밀번호가 변경되었습니다.');
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-950">비밀번호 변경</h2>
            <p className="mt-1 text-sm text-gray-500">현재 비밀번호 확인 후 새 비밀번호로 변경합니다.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700"
        >
          비밀번호 변경
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-950">비밀번호 변경</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">현재 비밀번호</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">새 비밀번호</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">새 비밀번호 확인</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </label>

              <p className="text-xs text-gray-500">영문, 숫자, 특수문자 조합 8자 이상으로 입력해 주세요.</p>

              {(validationMessage || message) && (
                <p className="text-sm font-semibold text-red-600">{validationMessage || message}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? '변경 중...' : '변경하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
