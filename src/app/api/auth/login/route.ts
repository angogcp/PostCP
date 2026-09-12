import { NextResponse } from 'next/server';
import { verifyCredentials, createSessionCookie, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { success: false, message: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const token = await createSessionCookie();
    const response = NextResponse.json({
      success: true,
      message: 'ログインに成功しました',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
