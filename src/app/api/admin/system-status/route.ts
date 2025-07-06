import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// グローバル変数で状態を共有
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

    global.systemStatus = status;

    return NextResponse.json({ 
      status: global.systemStatus,
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