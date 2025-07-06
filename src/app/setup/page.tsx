'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dbStatus, setDbStatus] = useState('');

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/messages/unanswered');
      if (response.ok) {
        setDbStatus('✅ データベース接続OK');
      } else {
        setDbStatus('❌ データベース接続エラー');
      }
    } catch (error) {
      setDbStatus('❌ データベース接続エラー: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ 管理者ユーザーが作成されました！');
      } else {
        setMessage('❌ エラー: ' + (data.message || data.error));
      }
    } catch (error) {
      setMessage('❌ 接続エラー: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Chat RKT セットアップ
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            初回セットアップ用ページ
          </p>
        </div>

        {/* データベース確認 */}
        <div className="space-y-4">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'チェック中...' : 'データベース接続確認'}
          </button>
          {dbStatus && (
            <div className="text-sm text-center">
              {dbStatus}
            </div>
          )}
        </div>

        {/* 管理者作成 */}
        <form className="mt-8 space-y-6" onSubmit={createAdmin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                管理者ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="安全なパスワードを入力"
              />
            </div>
          </div>

          {message && (
            <div className="text-sm text-center">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '作成中...' : '管理者ユーザー作成'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <a href="/admin" className="text-emerald-400 hover:text-emerald-300 text-sm">
            → 管理者ページへ
          </a>
        </div>
      </div>
    </div>
  );
}