'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { fetchAiChat } from '@/api/services/AiService';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

interface AiChatPanelProps {
  isOpen: boolean;
  title: string;
  context?: string;
  isDarkMode?: boolean;
  variant?: 'overlay' | 'sidecar';
  className?: string;
  onClose: () => void;
}

function formatChatContext(context: string | undefined, messages: ChatMessage[]) {
  const history = messages
    .slice(-6)
    .map((message) => `${message.role === 'user' ? '사용자' : 'AI'}: ${message.content}`)
    .join('\n');

  return [context?.trim(), history ? `최근 대화:\n${history}` : '']
    .filter(Boolean)
    .join('\n\n');
}

export function AiChatPanel({
  isOpen,
  title,
  context,
  isDarkMode = false,
  variant = 'overlay',
  className = '',
  onClose,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextInput = input.trim();

    if (!nextInput || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: nextInput }];
    setMessages(nextMessages);
    setInput('');
    setErrorMessage('');
    setIsSending(true);

    try {
      const response = await fetchAiChat({
        message: nextInput,
        context: formatChatContext(context, nextMessages),
        useRag: true,
      });
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'AI 채팅 요청에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  if (!isOpen) return null;

  const panel = (
    <aside
      className={`flex h-full w-full flex-col border-l ${
        variant === 'overlay' ? 'max-w-md shadow-2xl' : 'shadow-none'
      } ${isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-slate-200 bg-white'} ${className}`}
    >
        <header
          className={`flex items-center justify-between border-b px-4 py-3 ${
            isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Bot className="h-5 w-5 shrink-0 text-[#7C3AED]" />
            <div className="min-w-0">
              <h2 className={`truncate text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h2>
              <p className={`text-[11px] ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>AI 채팅</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition ${
              isDarkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label="AI 채팅 닫기"
            title="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                isDarkMode ? 'border-[#334155] bg-[#1E293B] text-[#CBD5E1]' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              현재 학습 내용을 기준으로 질문할 수 있습니다.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-[#7C3AED] text-white'
                    : isDarkMode
                      ? 'bg-[#1E293B] text-[#E2E8F0]'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                <pre className="whitespace-pre-wrap break-words font-sans">{message.content}</pre>
              </div>
            </div>
          ))}
          {isSending && (
            <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              답변 생성 중
            </div>
          )}
          {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`border-t p-3 ${isDarkMode ? 'border-[#334155] bg-[#1E293B]' : 'border-slate-200 bg-white'}`}
        >
          <div
            className={`flex items-end gap-2 rounded-xl border px-3 py-2 ${
              isDarkMode ? 'border-[#334155] bg-[#0F172A]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              className={`max-h-32 min-h-10 flex-1 resize-none bg-transparent text-sm outline-none ${
                isDarkMode ? 'text-white placeholder:text-[#64748B]' : 'text-slate-900 placeholder:text-slate-400'
              }`}
              placeholder="질문을 입력하세요"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7C3AED] text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="AI 채팅 전송"
              title="전송"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
    </aside>
  );

  if (variant === 'sidecar') {
    return panel;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      {panel}
    </div>
  );
}
