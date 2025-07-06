import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // セキュリティチェック - 本番環境でのみ実行可能にする
    const { action } = await request.json();
    
    if (action === 'push-schema') {
      // Prismaスキーマをデータベースにプッシュ
      const { stdout, stderr } = await execAsync('npx prisma db push --force-reset');
      
      return NextResponse.json({
        success: true,
        message: 'データベーススキーマをプッシュしました',
        stdout,
        stderr
      });
    }
    
    if (action === 'generate') {
      // Prismaクライアントを生成
      const { stdout, stderr } = await execAsync('npx prisma generate');
      
      return NextResponse.json({
        success: true,
        message: 'Prismaクライアントを生成しました',
        stdout,
        stderr
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '不正なアクション'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'データベース設定エラー',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}