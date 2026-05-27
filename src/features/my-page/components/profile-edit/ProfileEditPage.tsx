'use client';

import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { authService } from '@/api/services/UserService';
import { ProfileEditForm } from '@/features/my-page/components/profile-edit/ProfileEditForm';
import { DEFAULT_PROFILE_IMAGE_URL } from '@/features/my-page/components/profile-edit/ProfileImageOptions';
import { useUserStore } from '@/store/UseUserStore';
import type { UserProfile } from '@/types/UserTypes';

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }
  }

  return '프로필 수정에 실패했습니다.';
}

export function ProfileEditPage() {
  const accessToken = useUserStore((state) => state.accessToken);
  const setLoginSession = useUserStore((state) => state.setLoginSession);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isNicknameEditing, setIsNicknameEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [nicknameMessageType, setNicknameMessageType] = useState<'error' | 'success' | ''>('');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const nextProfile = await authService.getMyProfile(accessToken ?? undefined);
        if (!isMounted) return;

        setProfile(nextProfile);
        setNickname(nextProfile.nickname ?? '');
        setProfileImageUrl(nextProfile.profileImageUrl ?? DEFAULT_PROFILE_IMAGE_URL);
      } catch (error) {
        if (!isMounted) return;
        setFormMessage(getErrorMessage(error));
        setFormMessageType('error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const updateProfile = async (nextNickname: string, nextProfileImageUrl: string | null) => {
    const updatedProfile = await authService.updateMyProfile({
      nickname: nextNickname,
      profileImageUrl: nextProfileImageUrl,
    });

    setProfile(updatedProfile);
    setNickname(updatedProfile.nickname ?? '');
    setProfileImageUrl(updatedProfile.profileImageUrl ?? DEFAULT_PROFILE_IMAGE_URL);

    if (accessToken) {
      setLoginSession(accessToken, updatedProfile.nickname, updatedProfile.profileImageUrl, updatedProfile.role);
    }

    return updatedProfile;
  };

  const handleNicknameSave = async () => {
    const trimmedNickname = nickname.trim();

    setNicknameMessage('');
    setNicknameMessageType('');
    setFormMessage('');
    setFormMessageType('');

    if (!trimmedNickname) {
      setNicknameMessage('닉네임을 입력해 주세요.');
      setNicknameMessageType('error');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile(trimmedNickname, profileImageUrl.trim() || DEFAULT_PROFILE_IMAGE_URL);
      setIsNicknameEditing(false);
      setNicknameMessage('닉네임이 수정되었습니다.');
      setNicknameMessageType('success');
    } catch (error) {
      setNicknameMessage(getErrorMessage(error));
      setNicknameMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNicknameCancel = () => {
    setNickname(profile?.nickname ?? '');
    setIsNicknameEditing(false);
    setNicknameMessage('');
    setNicknameMessageType('');
  };

  const handleImageSelect = (imageUrl: string) => {
    setProfileImageUrl(imageUrl);
    setFormMessage('');
    setFormMessageType('');
  };

  const handleFinalSave = async () => {
    if (isNicknameEditing) {
      setNicknameMessage('닉네임 수정 완료 또는 수정 취소를 먼저 눌러 주세요.');
      setNicknameMessageType('error');
      return;
    }

    setFormMessage('');
    setFormMessageType('');
    setIsSaving(true);

    try {
      const nextImageUrl = profileImageUrl.trim() || DEFAULT_PROFILE_IMAGE_URL;
      await updateProfile(profile?.nickname ?? nickname.trim(), nextImageUrl);
      window.location.assign('/my-page/profile');
    } catch (error) {
      setFormMessage(getErrorMessage(error));
      setFormMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="h-16 rounded-lg bg-gray-100" />
        <div className="h-96 rounded-lg border border-gray-200 bg-white" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
        {formMessage || '프로필 정보를 불러오지 못했습니다.'}
      </div>
    );
  }

  return (
    <ProfileEditForm
      email={profile.email}
      nickname={nickname}
      profileImageUrl={profileImageUrl}
      isNicknameEditing={isNicknameEditing}
      nicknameMessage={nicknameMessage}
      nicknameMessageType={nicknameMessageType}
      formMessage={formMessage}
      formMessageType={formMessageType}
      isSaving={isSaving}
      onStartNicknameEdit={() => {
        setIsNicknameEditing(true);
        setNicknameMessage('');
        setNicknameMessageType('');
      }}
      onNicknameSave={handleNicknameSave}
      onNicknameCancel={handleNicknameCancel}
      onNicknameChange={setNickname}
      onImageSelect={handleImageSelect}
      onFinalSave={handleFinalSave}
    />
  );
}
