import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, isValidSession } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ファイルやAPI、ログイン画面は除外
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/qr') ||
    pathname.startsWith('/manifest.json') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    /\.(jpe?g|png|webp|svg|ico|css|js)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // QR画像自体は認証済み、または直接アクセスされる可能性もあるが、
  // アプリ利用者の画面保護のためにルートアクセスを保護
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = isValidSession(token);

  if (!isAuthenticated) {
    // ログインページへリダイレクト
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
