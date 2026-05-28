'use client';

import { type FormEvent, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { WithdrawalPayload } from '@/api/services/AccountManagementService';

interface WithdrawalSectionProps {
  isSaving: boolean;
  message: string;
  onWithdraw: (payload: WithdrawalPayload) => Promise<boolean>;
}

export function WithdrawalSection({ isSaving, message, onWithdraw }: WithdrawalSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const closeModal = () => {
    if (isSaving) return;
    setIsOpen(false);
    setCurrentPassword('');
    setConfirmation('');
    setReason('');
    setValidationMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationMessage('');

    if (!currentPassword) {
      setValidationMessage('현재 비밀번호를 입력해 주세요.');
      return;
    }

    if (confirmation.trim() !== '확인') {
      setValidationMessage('확인 문구를 정확히 입력해 주세요.');
      return;
    }

    if (!reason.trim()) {
      setValidationMessage('탈퇴 사유를 입력해 주세요.');
      return;
    }

    const isConfirmed = window.confirm('정말 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!isConfirmed) return;

    await onWithdraw({ currentPassword, reason: reason.trim() });
  };

  return (
    <section className="rounded-lg border border-red-100 bg-red-50 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-950">회원 탈퇴</h2>
            <p className="mt-1 text-sm leading-6 text-red-700">
              탈퇴 후 계정은 삭제 처리되며 다시 로그인할 수 없습니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
        >
          회원 탈퇴
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-red-950">회원 탈퇴</h3>
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
              <p className="rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">
                탈퇴를 진행하려면 현재 비밀번호, 확인 문구, 탈퇴 사유를 입력해 주세요.
              </p>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">현재 비밀번호</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">확인 문구</span>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="확인"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <span className="text-xs text-gray-500">회원 탈퇴를 계속하려면 확인을 입력해 주세요.</span>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">탈퇴 사유</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <span className="block text-right text-xs text-gray-400">{reason.length}/500</span>
              </label>

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
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? '탈퇴 처리 중...' : '탈퇴 진행'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
