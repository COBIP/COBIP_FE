'use client';

import { Bookmark, Bot, Settings, SquarePen } from 'lucide-react';

const TEXT = {
  bookmarkAdd: '\uBD81\uB9C8\uD06C \uCD94\uAC00',
  bookmarkRemove: '\uBD81\uB9C8\uD06C \uD574\uC81C',
  memo: '\uBA54\uBAA8',
  aiChat: 'AI \uCC44\uD305',
  settings: '\uC124\uC815',
  profile: '\uB9C8\uC774\uD398\uC774\uC9C0\uB85C \uC774\uB3D9',
};

interface HeaderProps {
  title: string;
  isFavorite: boolean;
  isFavoriteSaving: boolean;
  profileImage?: string | null;
  nickname?: string | null;
  onFavoriteToggle: () => void;
  onProfileClick: () => void;
  onAiChatOpen?: () => void;
  onSettingsClick: () => void;
  onMemoToggle: () => void;
  isMemoOpen: boolean;
  isDarkMode: boolean;
}

export function Header({
  title,
  isFavorite,
  isFavoriteSaving,
  profileImage,
  nickname,
  onFavoriteToggle,
  onProfileClick,
  onAiChatOpen,
  onSettingsClick,
  onMemoToggle,
  isMemoOpen,
  isDarkMode,
}: HeaderProps) {
  const initial = (nickname?.trim().charAt(0) || 'U').toUpperCase();

  return (
    <header
      className={`flex h-14 items-center justify-between border-b px-6 transition-colors duration-300 ${
        isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-[#F1F5F9] bg-white'
      }`}
    >
      <h1 className={`min-w-0 truncate text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFavoriteToggle}
          disabled={isFavoriteSaving}
          className={`rounded-lg p-2 transition-all duration-300 disabled:opacity-60 ${
            isFavorite
              ? 'bg-purple-50 text-[#7C3AED]'
              : isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title={isFavorite ? TEXT.bookmarkRemove : TEXT.bookmarkAdd}
          aria-label={isFavorite ? TEXT.bookmarkRemove : TEXT.bookmarkAdd}
        >
          <Bookmark className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          className={`rounded-lg p-2 transition-colors duration-300 ${
            isMemoOpen
              ? 'bg-[#7C3AED] text-white'
              : isDarkMode
                ? 'text-[#94A3B8] hover:bg-[#334155]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          onClick={onMemoToggle}
          title={TEXT.memo}
          aria-label={TEXT.memo}
        >
          <SquarePen className="h-5 w-5" />
        </button>

        {onAiChatOpen && (
          <button
            type="button"
            onClick={onAiChatOpen}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
              isDarkMode ? 'bg-[#2D1B69] text-[#C4B5FD] hover:bg-[#3B2478]' : 'bg-purple-50 text-[#7C3AED] hover:bg-purple-100'
            }`}
            title={TEXT.aiChat}
            aria-label={TEXT.aiChat}
          >
            <Bot className="h-4 w-4" />
            <span>{TEXT.aiChat}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSettingsClick}
          className={`rounded-lg p-2 transition-colors duration-300 ${
            isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title={TEXT.settings}
          aria-label={TEXT.settings}
        >
          <Settings className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onProfileClick}
          className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white transition ${
            isDarkMode ? 'bg-[#334155] hover:ring-2 hover:ring-[#64748B]' : 'bg-[#CBD5E1] hover:ring-2 hover:ring-purple-200'
          }`}
          style={profileImage ? { backgroundImage: `url(${profileImage})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined}
          title={TEXT.profile}
          aria-label={TEXT.profile}
        >
          {profileImage ? <span className="sr-only">{nickname ?? 'User'}</span> : initial}
        </button>
      </div>
    </header>
  );
}
