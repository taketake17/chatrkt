import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 一時的に全セッションを取得（認証実装後に修正）
    const sessions = await prisma.session.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 一時的にダミーユーザーIDを使用（認証実装後に修正）
    const { name } = await request.json();
    
    // ダミーユーザーを作成または取得
    let user = await prisma.user.findFirst({
      where: { username: 'anonymous' }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: 'anonymous',
          password: 'temp', // 一時的
        }
      });
    }
    
    const session = await prisma.session.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}