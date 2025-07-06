import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'test-connection') {
      // データベース接続テスト
      try {
        await prisma.$connect();
        await prisma.$disconnect();
        
        return NextResponse.json({
          success: true,
          message: 'データベース接続成功'
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'データベース接続失敗',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    if (action === 'create-tables') {
      // テーブル作成を試行
      try {
        // Adminユーザーテーブルの存在確認・作成
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Admin" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "username" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `;
        
        // Userテーブルの存在確認・作成
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "username" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `;
        
        // Sessionテーブルの存在確認・作成
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Session" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT,
            "userId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `;
        
        // Messageテーブルの存在確認・作成
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Message" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "content" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "sessionId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `;
        
        return NextResponse.json({
          success: true,
          message: 'データベーステーブルが作成されました'
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'テーブル作成エラー',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
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