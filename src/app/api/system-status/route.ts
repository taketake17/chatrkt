import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 簡易実装：グローバル変数で状態を共有
// 本来はデータベースやRedisなどの永続化ストレージを使用すべき
declare global {
  var systemStatus: 'active' | 'maintenance' | undefined;
}

if (!global.systemStatus) {
  global.systemStatus = 'active';
}

export async function GET() {
  try {
    return NextResponse.json({ status: global.systemStatus || 'active' });
  } catch (error) {
    console.error('Failed to get system status:', error);
    // エラー時はデフォルトで稼働中とする
    return NextResponse.json({ status: 'active' });
  }
}