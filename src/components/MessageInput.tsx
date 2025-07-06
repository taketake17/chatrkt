'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (content.trim() && !disabled && !sending) {
      setSending(true);
      try {
        await onSendMessage(content.trim());
        setContent('');
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // エンターキーでの送信を無効化
    // Shift + Enter で改行のみ許可
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 送信はしない
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力してください..."
              className="w-full resize-none bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-sm"
              rows={1}
              disabled={disabled || sending}
              style={{
                minHeight: '48px',
                maxHeight: '200px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={disabled || !content.trim() || sending}
              className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Shift + Enter で改行、送信ボタンでメッセージ送信</span>
          <span className={`${content.length > 1000 ? 'text-red-400' : ''}`}>
            {content.length}/2000
          </span>
        </div>
      </div>
    </div>
  );
}