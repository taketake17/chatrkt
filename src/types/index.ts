export interface Message {
  id: string;
  content: string;
  type: 'USER' | 'ASSISTANT';
  createdAt: Date;
  isNew?: boolean; // 新しい回答かどうか
}

export interface Session {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  displayName?: string; // 表示用の名前
  user?: User; // ユーザー情報
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}