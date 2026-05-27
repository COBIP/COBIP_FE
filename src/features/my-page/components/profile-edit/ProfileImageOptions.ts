export const DEFAULT_PROFILE_IMAGE_URL = '/profile/profile-defualt.png';

export const PROFILE_IMAGE_OPTIONS = [
  { label: '기본', src: DEFAULT_PROFILE_IMAGE_URL },
  { label: '퍼플', src: '/profile/profile-purple.svg' },
  { label: '블루', src: '/profile/profile-blue.svg' },
  { label: '그린', src: '/profile/profile-green.svg' },
  { label: '앰버', src: '/profile/profile-amber.svg' },
];

export function getSafeProfileImageUrl(imageUrl?: string | null) {
  return imageUrl?.startsWith('/profile/') ? imageUrl : DEFAULT_PROFILE_IMAGE_URL;
}
