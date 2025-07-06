'use client';

import { useState, useEffect } from 'react';
import { Message, Session } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageWithSession extends Message {
  session: Session;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [unansweredMessages, setUnansweredMessages] = useState<MessageWithSession[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageWithSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // 認証確認中の状態

  // ページ読み込み時に認証状態を確認
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnansweredMessages();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/messages/unanswered');
      if (response.ok) {
        // APIが成功すれば認証済み
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // 401エラーなら未認証
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        alert('認証に失敗しました');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnansweredMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages/unanswered');
      if (response.ok) {
        const messages = await response.json();
        setUnansweredMessages(messages);
      }
    } catch (error) {
      console.error('Failed to fetch unanswered messages:', error);
    }
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !answerContent.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/admin/messages/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedMessage.session.id,
          content: answerContent,
        }),
      });

      if (response.ok) {
        setAnswerContent('');
        setSelectedMessage(null);
        fetchUnansweredMessages();
        alert('回答を送信しました');
      } else {
        alert('回答の送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to send answer:', error);
      alert('回答の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      setUnansweredMessages([]);
      setSelectedMessage(null);
      setAnswerContent('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 認証確認中の場合はローディング表示
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-700">認証状態を確認中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">管理者ログイン</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">初回セットアップが必要な場合：</p>
            <a 
              href="/setup"
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              セットアップページへ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              管理者: admin
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">未回答の質問</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {unansweredMessages.length === 0 ? (
                <p className="text-gray-500">未回答の質問はありません</p>
              ) : (
                unansweredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(message.createdAt).toLocaleString('ja-JP')}
                    </div>
                    <div className="max-w-none text-gray-900" style={{ color: '#111827' }}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="text-gray-900 mb-2" style={{ color: '#111827' }}>{children}</p>,
                          h1: ({ children }) => <h1 className="text-gray-900 text-lg font-bold mb-2" style={{ color: '#111827' }}>{children}</h1>,
                          h2: ({ children }) => <h2 className="text-gray-900 text-base font-bold mb-2" style={{ color: '#111827' }}>{children}</h2>,
                          h3: ({ children }) => <h3 className="text-gray-900 text-sm font-bold mb-2" style={{ color: '#111827' }}>{children}</h3>,
                          strong: ({ children }) => <strong className="text-gray-900 font-bold" style={{ color: '#111827' }}>{children}</strong>,
                          em: ({ children }) => <em className="text-gray-900" style={{ color: '#111827' }}>{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-sm" style={{ color: '#111827', backgroundColor: '#f3f4f6' }}>{children}</code>,
                          pre: ({ children }) => <pre className="bg-gray-100 text-gray-900 p-2 rounded text-sm overflow-x-auto" style={{ color: '#111827', backgroundColor: '#f3f4f6' }}>{children}</pre>,
                          ul: ({ children }) => <ul className="text-gray-900 list-disc list-inside mb-2" style={{ color: '#111827' }}>{children}</ul>,
                          ol: ({ children }) => <ol className="text-gray-900 list-decimal list-inside mb-2" style={{ color: '#111827' }}>{children}</ol>,
                          li: ({ children }) => <li className="text-gray-900" style={{ color: '#111827' }}>{children}</li>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">回答を作成</h2>
            {selectedMessage ? (
              <form onSubmit={handleAnswer}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    選択された質問
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg max-w-none text-gray-900" style={{ color: '#111827' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="text-gray-900 mb-2" style={{ color: '#111827' }}>{children}</p>,
                        h1: ({ children }) => <h1 className="text-gray-900 text-lg font-bold mb-2" style={{ color: '#111827' }}>{children}</h1>,
                        h2: ({ children }) => <h2 className="text-gray-900 text-base font-bold mb-2" style={{ color: '#111827' }}>{children}</h2>,
                        h3: ({ children }) => <h3 className="text-gray-900 text-sm font-bold mb-2" style={{ color: '#111827' }}>{children}</h3>,
                        strong: ({ children }) => <strong className="text-gray-900 font-bold" style={{ color: '#111827' }}>{children}</strong>,
                        em: ({ children }) => <em className="text-gray-900" style={{ color: '#111827' }}>{children}</em>,
                        code: ({ children }) => <code className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded text-sm" style={{ color: '#111827', backgroundColor: '#e5e7eb' }}>{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-200 text-gray-900 p-2 rounded text-sm overflow-x-auto" style={{ color: '#111827', backgroundColor: '#e5e7eb' }}>{children}</pre>,
                        ul: ({ children }) => <ul className="text-gray-900 list-disc list-inside mb-2" style={{ color: '#111827' }}>{children}</ul>,
                        ol: ({ children }) => <ol className="text-gray-900 list-decimal list-inside mb-2" style={{ color: '#111827' }}>{children}</ol>,
                        li: ({ children }) => <li className="text-gray-900" style={{ color: '#111827' }}>{children}</li>,
                      }}
                    >
                      {selectedMessage.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    回答（マークダウン対応）
                  </label>
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    rows={8}
                    placeholder="回答を入力してください..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !answerContent.trim()}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '送信中...' : '回答を送信'}
                </button>
              </form>
            ) : (
              <p className="text-gray-500">左側から質問を選択してください</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}