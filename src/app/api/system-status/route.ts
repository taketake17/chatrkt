import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const systemSetting = await prisma.systemSettings.findUnique({
      where: { key: 'system_status' }
    });

    return NextResponse.json({ 
      status: systemSetting?.value || 'active' 
    });
  } catch (error) {
    console.error('Failed to get system status:', error);
    // エラー時はデフォルトで稼働中とする
    return NextResponse.json({ status: 'active' });
  }
}