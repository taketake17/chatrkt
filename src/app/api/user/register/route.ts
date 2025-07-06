import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // ユーザー名の重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // 新しいユーザーを作成
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // 登録成功時はクッキーを設定
    const cookieStore = await cookies();
    cookieStore.set('user-auth', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1週間
      path: '/',
    });

    return NextResponse.json({
      message: '登録が完了しました',
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}