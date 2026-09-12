import { cookies } from 'next/headers';

const COOKIE_NAME = 'postcp_auth_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1年間有効（現場での再入力ストレスを防止）

export function getCredentials() {
  const username = process.env.APP_USERNAME || 'admin';
  const password = process.env.APP_PASSWORD || 'postcp2026';
  return { username, password };
}

export function verifyCredentials(user: string, pass: string): boolean {
  const { username, password } = getCredentials();
  return user.trim() === username && pass === password;
}

export async function createSessionCookie(): Promise<string> {
  // 簡易かつ安全なセッショントークン
  const secret = process.env.AUTH_SECRET || 'postcp-secret-key-2026-secure';
  const data = `authenticated:${Date.now()}:${secret}`;
  
  // base64エンコード
  const token = Buffer.from(data).toString('base64url');
  return token;
}

export function isValidSession(token?: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length >= 3 && parts[0] === 'authenticated') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export { COOKIE_NAME, SESSION_MAX_AGE };
