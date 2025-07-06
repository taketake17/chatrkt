'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { Sidebar } from '@/components/Sidebar';
import { Message } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [systemStatus, setSystemStatus] = useState<'active' | 'maintenance'>('active');
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    fetchSystemStatus();
  }, []);

  // 認証されてもすぐにはセッションを作成しない
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     createNewSession();
  //   }
  // }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system-status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      setUser(null);
      setMessages([]);
      setSessionId(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const startPolling = (targetSessionId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // sessionIdがない場合はポーリングを開始しない
    if (!targetSessionId) {
      console.warn('startPolling called without sessionId');
      return;
    }
    
    const interval = setInterval(async () => {
      if (targetSessionId) {
        try {
          const response = await fetch(`/api/sessions/${targetSessionId}/messages`);
          if (response.ok) {
            const sessionMessages = await response.json();
            
            // 新しいアシスタントメッセージを検出
            const currentAssistantCount = messages.filter(msg => msg.type === 'ASSISTANT').length;
            const newAssistantCount = sessionMessages.filter((msg: Message) => msg.type === 'ASSISTANT').length;
            
            // 新しい回答があった場合、isNewフラグを設定
            const updatedMessages = sessionMessages.map((msg: Message, index: number) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
              isNew: msg.type === 'ASSISTANT' && newAssistantCount > currentAssistantCount && 
                     index >= sessionMessages.length - (newAssistantCount - currentAssistantCount)
            }));
            
            setMessages(updatedMessages);
            
            // 新しい回答があったらブラウザ通知を表示
            if (newAssistantCount > currentAssistantCount) {
              // ブラウザ通知
              if (Notification.permission === 'granted') {
                new Notification('Chat RKT', {
                  body: '新しい回答が届きました！',
                  icon: '/favicon.ico'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Chat RKT', {
                      body: '新しい回答が届きました！',
                      icon: '/favicon.ico'
                    });
                  }
                });
              }
              
              clearInterval(interval);
              setPollingInterval(null);
            }
          }
        } catch (error) {
          console.error('Failed to poll messages:', error);
        }
      }
    }, 3000);
    
    setPollingInterval(interval);
  };

  const createNewSession = async () => {
    // セッション作成は実際のメッセージ送信まで遅延
    // 代わりに現在の状態をクリア
    setSessionId(null);
    setMessages([]);
    
    // ポーリングがあれば停止
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    // 認証されていない場合はログインページにリダイレクト
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // セッションがない場合は新しく作成
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: null }),
        });
        const session = await response.json();
        currentSessionId = session.id;
        setSessionId(currentSessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'USER',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          content,
          type: 'USER',
        }),
      });

      if (response.ok) {
        // メッセージ送信後、すぐにセッションのメッセージを取得し直す
        const messagesResponse = await fetch(`/api/sessions/${currentSessionId}/messages`);
        if (messagesResponse.ok) {
          const sessionMessages = await messagesResponse.json();
          const updatedMessages = sessionMessages.map((msg: Message) => ({
            ...msg,
            createdAt: new Date(msg.createdAt)
          }));
          setMessages(updatedMessages);
        }
        
        const tempMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'メッセージを受信しました。Chat RKTが本気で考えています...',
          type: 'ASSISTANT',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, tempMessage]);
        
        // ポーリングで回答を待機
        if (currentSessionId) {
          startPolling(currentSessionId);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/messages`);
      const sessionMessages = await response.json();
      setMessages(sessionMessages);
      setSessionId(id);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  // 認証確認中の場合はローディング表示
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* サイドバーは認証されている場合のみ表示 */}
      {isAuthenticated && (
        <Sidebar
          onNewChat={createNewSession}
          onSelectChat={loadSession}
          currentSessionId={sessionId}
        />
      )}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="text-white font-semibold">
            Chat RKT
          </div>
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
              >
                ログイン
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                新規登録
              </button>
            </div>
          )}
        </div>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="max-w-3xl mx-auto text-center px-6">
              <div className="mb-8">
                <h1 className="text-4xl font-semibold mb-4 text-gray-100">
                  {isAuthenticated && user ? `こんにちは、${user.username}さん！` : 'Chat RKT'}
                </h1>
                <p className="text-lg text-gray-400 mb-4">
                  {isAuthenticated ? '何でもお気軽にお聞きください' : 'Chat RKTとの「本気」の対話を、あなたに。'}
                </p>
                <p className="text-md text-gray-500 mb-8">
                  {isAuthenticated ? 'まるで大切な友人のように、あなたの言葉に耳を傾け、人間味あふれる対話でお応えします。' : '人間味あふれる「本気」の対話で、あなたの心に寄り添います。'}
                </p>
                
                {/* システムステータス表示 */}
                <div className={`inline-block px-4 py-2 rounded-lg mb-6 ${
                  systemStatus === 'active' 
                    ? 'bg-green-900 text-green-200 border border-green-700' 
                    : 'bg-yellow-900 text-yellow-200 border border-yellow-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {systemStatus === 'active' 
                        ? 'Chat RKTは元気に稼働中です。' 
                        : 'ただいまChat RKTは休憩中です。再開をお待ちください。'}
                    </span>
                  </div>
                </div>
                
                {!isAuthenticated && (
                  <div className="text-sm text-gray-500 mb-8">
                    メッセージを送信するにはログインまたは新規登録が必要です
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => sendMessage('新しいビジネスアイデアを考えるのを手伝ってください')}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer text-left group"
                >
                  <h3 className="font-medium text-gray-200 mb-2 group-hover:text-emerald-400 transition-colors">💡 アイデア</h3>
                  <p className="text-sm text-gray-400">あなたの創造性を引き出し、一緒に本気で考えます</p>
                </button>
                <button
                  onClick={() => sendMessage('文章を書くのを手伝ってください。どんな文章を書きたいか教えてください。')}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer text-left group"
                >
                  <h3 className="font-medium text-gray-200 mb-2 group-hover:text-emerald-400 transition-colors">📝 文章作成</h3>
                  <p className="text-sm text-gray-400">温かい心で、あなたの想いを言葉にします</p>
                </button>
                <button
                  onClick={() => sendMessage('何か相談したいことがあります。お話を聞いてもらえますか？')}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer text-left group"
                >
                  <h3 className="font-medium text-gray-200 mb-2 group-hover:text-emerald-400 transition-colors">🤔 相談</h3>
                  <p className="text-sm text-gray-400">あなたの悩みに真剣に向き合い、心に寄り添います</p>
                </button>
                <button
                  onClick={() => sendMessage('新しいことを学びたいです。何か面白いトピックを教えてください。')}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer text-left group"
                >
                  <h3 className="font-medium text-gray-200 mb-2 group-hover:text-emerald-400 transition-colors">📚 学習</h3>
                  <p className="text-sm text-gray-400">あなたの好奇心に寄り添い、一緒に成長します</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-900">
            <MessageList messages={messages} loading={loading} />
          </div>
        )}
        <MessageInput onSendMessage={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}