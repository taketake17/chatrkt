'use client';

import { useState, useEffect } from 'react';
import { Session, Message } from '@/types';

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  currentSessionId: string | null;
}

export function Sidebar({ onNewChat, onSelectChat, currentSessionId }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      // 各セッションのメッセージを取得してチャット名と未読数を設定
      const unreadData: Record<string, number> = {};
      const sessionsWithNames: (Session & { displayName: string })[] = await Promise.all(
        data.map(async (session: Session): Promise<Session & { displayName: string }> => {
          try {
            const messagesResponse = await fetch(`/api/sessions/${session.id}/messages`);
            const messages = await messagesResponse.json();
            
            // 最初のユーザーメッセージからチャット名を生成
            const firstUserMessage = messages.find((msg: Message) => msg.type === 'USER');
            let displayName = session.name;
            
            if (!displayName && firstUserMessage) {
              // 最初の5文字程度を取得（絵文字や記号を考慮）
              const content = firstUserMessage.content.trim();
              displayName = content.length > 5 ? content.slice(0, 5) + '...' : content;
            }
            
            if (!displayName) {
              displayName = `チャット ${session.id.slice(0, 8)}`;
            }
            
            // 未読回答数をチェック
            const userMessages = messages.filter((msg: Message) => msg.type === 'USER');
            const assistantMessages = messages.filter((msg: Message) => msg.type === 'ASSISTANT');
            
            if (userMessages.length > 0 && assistantMessages.length > 0) {
              const lastUserMessage = userMessages[userMessages.length - 1];
              const newAssistantMessages = assistantMessages.filter((msg: Message) => 
                new Date(msg.createdAt) > new Date(lastUserMessage.createdAt)
              );
              unreadData[session.id] = newAssistantMessages.length;
            }
            
            return {
              ...session,
              displayName
            };
          } catch (error) {
            console.error(`Failed to process session ${session.id}:`, error);
            return {
              ...session,
              displayName: session.name || `チャット ${session.id.slice(0, 8)}`
            };
          }
        })
      );
      
      setSessions(sessionsWithNames);
      setUnreadCounts(unreadData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    loadSessions();
  };

  const handleSelectChat = (sessionId: string) => {
    // セッション選択時に未読カウントをクリア
    setUnreadCounts(prev => ({ ...prev, [sessionId]: 0 }));
    onSelectChat(sessionId);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // クリックイベントの伝播を停止
    
    if (confirm('このチャットを削除しますか？')) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // セッションリストを更新
          loadSessions();
          
          // 削除されたセッションが現在選択中の場合、新しいセッションを作成
          if (currentSessionId === sessionId) {
            handleNewChat();
          }
        } else {
          alert('チャットの削除に失敗しました');
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
        alert('チャットの削除に失敗しました');
      }
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-64'} bg-gray-950 text-white flex flex-col border-r border-gray-800 flex-shrink-0 transition-all duration-300`}>
      {/* Toggle Button */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-sm font-semibold text-gray-300">Chat RKT</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2.5 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>新しいチャット</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              チャット履歴
            </h3>
            {loading ? (
              <div className="text-gray-500 text-sm">読み込み中...</div>
            ) : sessions.length === 0 ? (
              <div className="text-gray-500 text-sm">チャット履歴がありません</div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-150 group relative cursor-pointer ${
                      currentSessionId === session.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'hover:bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {session.displayName || session.name || `チャット ${session.id.slice(0, 8)}`}
                          </div>
                          {unreadCounts[session.id] > 0 && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                {unreadCounts[session.id]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                          title="チャットを削除"
                        >
                          <svg className="w-3 h-3 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Collapsed state - minimal icons */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <button
            onClick={handleNewChat}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            title="新しいチャット"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {sessions.length > 0 && (
            <div className="w-8 h-0.5 bg-gray-700 rounded"></div>
          )}
          
          {sessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectChat(session.id)}
              className={`p-2 rounded-lg transition-colors relative ${
                currentSessionId === session.id
                  ? 'bg-gray-800 text-emerald-400'
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
              title={session.displayName || session.name || `チャット ${session.id.slice(0, 8)}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadCounts[session.id] > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                  {unreadCounts[session.id] > 9 ? '9+' : unreadCounts[session.id]}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}