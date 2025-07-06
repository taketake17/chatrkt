# ChatGPT風チャットサイト

ChatGPTのようなAIが質問に答えるように見せかけて、実際には手動で返信を行うチャット型Webサイトです。

## 機能

- **チャット機能**: ChatGPTと類似したUI/UXでのチャット体験
- **セッション管理**: 複数のチャットセッションを管理
- **管理者機能**: 質問への手動回答システム
- **自動削除**: 2日後の自動データ削除
- **OGP対応**: SNSでのシェア最適化

## 技術スタック

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: Tailwind CSS
- **Authentication**: Cookie-based sessions
- **Deployment**: Vercel

## セットアップ

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd chatgpt-clone
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`を参考に`.env.local`を作成し、データベースの接続情報を設定してください。

```bash
cp .env.example .env.local
```

### 4. データベースの設定

```bash
# データベースのプッシュ
npx prisma db push

# 管理者ユーザーの作成
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### 一般ユーザー

1. ホームページ（`/`）でチャットを開始
2. 質問を入力して送信
3. 管理者からの回答を待機

### 管理者

1. 管理者ページ（`/admin`）でログイン
2. 未回答の質問を確認
3. 回答を作成して送信

## API エンドポイント

### セッション管理
- `GET /api/sessions` - セッション一覧取得
- `POST /api/sessions` - 新しいセッション作成
- `GET /api/sessions/[id]/messages` - セッションのメッセージ取得

### メッセージ管理
- `GET /api/messages` - メッセージ一覧取得
- `POST /api/messages` - メッセージ作成
- `PUT /api/messages/[id]` - メッセージ更新
- `DELETE /api/messages/[id]` - メッセージ削除

### 管理者機能
- `POST /api/admin/auth` - 管理者認証
- `POST /api/admin/setup` - 管理者作成（初回のみ）
- `GET /api/admin/messages/unanswered` - 未回答メッセージ取得
- `POST /api/admin/messages/answer` - 回答作成

### システム
- `GET /api/cleanup` - 古いデータ確認
- `POST /api/cleanup` - 古いデータ削除

## デプロイ

### Vercel

1. Vercelにプロジェクトをデプロイ
2. 環境変数を設定
3. Vercel Postgresを設定
4. `npx prisma db push`でデータベースを初期化
5. 管理者ユーザーを作成

## 注意事項

- データは2日後に自動削除されます
- 管理者認証にはCookieベースのセッションを使用
- 本番環境では適切なセキュリティ設定を行ってください

## ライセンス

MIT License