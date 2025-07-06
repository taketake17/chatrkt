import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        session: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 未回答のメッセージをフィルタリング
    const unansweredMessages = [];
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

      if (!hasReplyAfter) {
        unansweredMessages.push(userMessage);
      }
    }

    const messages = unansweredMessages;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch unanswered messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unanswered messages' },
      { status: 500 }
    );
  }
}