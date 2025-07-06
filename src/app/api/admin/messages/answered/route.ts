import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 各ユーザーメッセージに対して、それ以降にアシスタントメッセージがあるかチェック
    const userMessages = await prisma.message.findMany({
      where: {
        type: 'USER',
      },
      include: {
        session: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 回答済みのメッセージをフィルタリング
    const answeredMessages = [];
    for (const userMessage of userMessages) {
      const hasReplyAfter = await prisma.message.findFirst({
        where: {
          sessionId: userMessage.sessionId,
          type: 'ASSISTANT',
          createdAt: {
            gt: userMessage.createdAt,
          },
        },
      });

      if (hasReplyAfter) {
        answeredMessages.push({
          ...userMessage,
          adminReply: hasReplyAfter,
        });
      }
    }

    return NextResponse.json(answeredMessages);
  } catch (error) {
    console.error('Failed to fetch answered messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answered messages' },
      { status: 500 }
    );
  }
}