import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const deletedSessions = await prisma.session.deleteMany({
      where: {
        createdAt: {
          lt: twoDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedSessions: deletedSessions.count,
    });
  } catch (error) {
    console.error('Failed to cleanup old sessions:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup old sessions' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const oldSessions = await prisma.session.findMany({
      where: {
        createdAt: {
          lt: twoDaysAgo,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      oldSessions: oldSessions.length,
      sessions: oldSessions,
    });
  } catch (error) {
    console.error('Failed to get old sessions:', error);
    return NextResponse.json(
      { error: 'Failed to get old sessions' },
      { status: 500 }
    );
  }
}