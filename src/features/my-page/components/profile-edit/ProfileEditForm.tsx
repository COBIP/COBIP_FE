'use client';

import { ArrowLeft, Check, Loader2, Pencil, Save, X } from 'lucide-react';
import Link from 'next/link';
import { ProfileImageSelector } from '@/features/my-page/components/profile-edit/ProfileImageSelector';
import { ProfileImagePreview } from '@/features/my-page/components/profile-edit/ProfileImagePreview';

interface ProfileEditFormProps {
  email: string;
  nickname: string;
  profileImageUrl: string;
  isNicknameEditing: boolean;
  nicknameMessage: string;
  nicknameMessageType: 'error' | 'success' | '';
  formMessage: string;
  formMessageType: 'error' | 'success' | '';
  isSaving: boolean;
  onStartNicknameEdit: () => void;
  onNicknameSave: () => void;
  onNicknameCancel: () => void;
  onNicknameChange: (value: string) => void;
  onImageSelect: (imageUrl: string) => void;
  onFinalSave: () => void;
}

export function ProfileEditForm({
  email,
  nickname,
  profileImageUrl,
  isNicknameEditing,
  nicknameMessage,
  nicknameMessageType,
  formMessage,
  formMessageType,
  isSaving,
  onStartNicknameEdit,
  onNicknameSave,
  onNicknameCancel,
  onNicknameChange,
  onImageSelect,
  onFinalSave,
}: ProfileEditFormProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-purple-700">프로필</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">프로필 수정</h1>
        </div>
        <Link
          href="/my-page/profile"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Link>
      </div>

      <section className="grid gap-8 rounded-lg border border-gray-200 bg-white p-8 lg:grid-cols-[320px_1fr]">
        <ProfileImagePreview imageUrl={profileImageUrl} nickname={nickname} />

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onFinalSave();
          }}
        >
          <div>
            <label htmlFor="profile-email" className="text-sm font-semibold text-gray-800">
              이메일
            </label>
            <input
              id="profile-email"
              value={email}
              disabled
              className="mt-2 h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="profile-nickname" className="text-sm font-semibold text-gray-800">
              닉네임
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="profile-nickname"
                value={nickname}
                onChange={(event) => onNicknameChange(event.target.value)}
                disabled={!isNicknameEditing || isSaving}
                maxLength={30}
                className="h-11 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition disabled:bg-gray-50 disabled:text-gray-500 focus:border-purple-400"
                placeholder="닉네임을 입력하세요"
              />
              {isNicknameEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onNicknameSave}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    수정 완료
                  </button>
                  <button
                    type="button"
                    onClick={onNicknameCancel}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:text-gray-400"
                  >
                    <X className="h-4 w-4" />
                    수정 취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onStartNicknameEdit}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </button>
              )}
            </div>
            {nicknameMessage && (
              <p
                className={`mt-2 text-sm font-medium ${
                  nicknameMessageType === 'error' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {nicknameMessage}
              </p>
            )}
          </div>

          <ProfileImageSelector
            selectedImageUrl={profileImageUrl}
            isSaving={isSaving}
            onImageSelect={onImageSelect}
          />

          {formMessage && (
            <p className={`text-sm font-medium ${formMessageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {formMessage}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              저장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
