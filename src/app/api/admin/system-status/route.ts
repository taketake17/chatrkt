import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    let systemSetting = await prisma.systemSettings.findUnique({
      where: { key: 'system_status' }
    });

    if (!systemSetting) {
      // 初回実行時にデフォルト値を作成
      systemSetting = await prisma.systemSettings.create({
        data: {
          key: 'system_status',
          value: 'active'
        }
      });
    }

    return NextResponse.json({ status: systemSetting.value });
  } catch (error) {
    console.error('Failed to get system status:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    
    if (status !== 'active' && status !== 'maintenance') {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // データベースでステータスを更新
    await prisma.systemSettings.upsert({
      where: { key: 'system_status' },
      update: { value: status },
      create: {
        key: 'system_status',
        value: status
      }
    });

    return NextResponse.json({ 
      status: status,
      message: `システムステータスを${status === 'active' ? '稼働中' : 'メンテナンス中'}に変更しました`
    });
  } catch (error) {
    console.error('Failed to update system status:', error);
    return NextResponse.json(
      { error: 'Failed to update system status' },
      { status: 500 }
    );
  }
}