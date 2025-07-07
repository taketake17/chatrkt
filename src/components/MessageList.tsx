'use client';

import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-900">
      <div className="max-w-4xl mx-auto px-2 lg:px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <div
              className={`flex items-start space-x-2 lg:space-x-3 ${
                message.type === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold ${
                  message.type === 'USER'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {message.type === 'USER' ? 'You' : 'AI'}
              </div>
              <div
                className={`flex-1 rounded-xl px-3 lg:px-4 py-2 lg:py-3 relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none ${
                  message.type === 'USER'
                    ? 'bg-emerald-600 text-white'
                    : `bg-gray-800 text-gray-100 border ${
                        message.isNew 
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' 
                          : 'border-gray-700'
                      }`
                }`}
              >
                {message.isNew && message.type === 'ASSISTANT' && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                    NEW
                  </div>
                )}
                <div className={`prose prose-sm lg:prose-base max-w-none ${
                  message.type === 'USER' ? 'prose-invert' : 'prose-gray prose-headings:text-gray-200 prose-p:text-gray-300 prose-strong:text-gray-200 prose-code:text-gray-200 prose-pre:bg-gray-900'
                }`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="group">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-semibold">
                AI
              </div>
              <div className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-400 text-sm">回答を生成中...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}