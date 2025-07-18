# ChatGPT風チャットサイト 要件定義書

## 概要
ChatGPTのようなAIが質問に答えるように見せかけて、実際には手動で返信を行うチャット型Webサイト

## 技術スタック
- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Next.js API Routes
- **データベース**: Vercel Postgres
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## 主要機能

### 1. チャット機能
- ChatGPTと類似したUI/UX
- レスポンシブデザイン（モバイル対応）
- リアルタイムチャット表示
- マークダウン対応

### 2. セッション管理
- 複数チャットセッション対応
- セッションに名前を付ける機能
- 各セッションは質問者と管理者のみがアクセス可能（共有不可）
- 2日間の履歴保持（自動削除）

### 3. 管理者機能
- パスワード認証による管理者ログイン
- 未回答質問の一覧表示
- 回答済み質問の一覧表示
- 質問への回答機能（マークダウン対応）
- 管理者回答の編集・削除機能

### 4. データ管理
- 質問・回答の永続化
- 2日経過後の自動履歴削除
- セッション情報の管理

### 5. SNS連携
- OGP（Open Graph Protocol）対応
- X（Twitter）等でのシェア最適化

## データベース設計

### テーブル構成
1. **sessions** - チャットセッション
2. **messages** - メッセージ（質問・回答）
3. **admin_users** - 管理者ユーザー

### セキュリティ
- 管理者認証
- セッション毎のプライバシー保護
- 自動データ削除によるプライバシー保護

## 非機能要件
- レスポンシブデザイン
- SEO対応
- パフォーマンス最適化
- Vercelでの高速デプロイ

## 制約事項
- 通知機能なし（現時点）
- チャット共有機能なし
- 単一管理者のみ対応