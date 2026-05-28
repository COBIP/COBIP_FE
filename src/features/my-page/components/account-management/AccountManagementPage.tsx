'use client';

import { PasswordChangeForm } from '@/features/my-page/components/account-management/PasswordChangeForm';
import { WithdrawalSection } from '@/features/my-page/components/account-management/WithdrawalSection';
import { useAccountManagement } from '@/features/my-page/hooks/UseAccountManagement';

export function AccountManagementPage() {
  const {
    changePassword,
    isPasswordSaving,
    isWithdrawing,
    passwordMessage,
    withdrawalMessage,
    withdraw,
  } = useAccountManagement();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">계정 관리</h1>
        <p className="mt-2 text-sm text-gray-500">비밀번호 변경과 회원 탈퇴를 관리합니다.</p>
      </div>

      <PasswordChangeForm
        isSaving={isPasswordSaving}
        message={passwordMessage}
        onSubmit={changePassword}
      />

      <WithdrawalSection
        isSaving={isWithdrawing}
        message={withdrawalMessage}
        onWithdraw={withdraw}
      />
    </div>
  );
}
