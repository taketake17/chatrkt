import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーを検索（メールアドレスで）
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      );
    }

    // パスワードを確認
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      );
    }

    // 認証成功時はクッキーを設定
    const cookieStore = await cookies();
    cookieStore.set('user-auth', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1週間
      path: '/',
    });

    return NextResponse.json({
      message: 'ログインに成功しました',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}