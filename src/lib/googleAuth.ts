/**
 * Google 간편 로그인 유틸리티 (Google Identity Services)
 *
 * GIS(Google Identity Services) 의 OAuth Token Client 를 사용한다.
 * 별도의 npm 패키지 없이 `https://accounts.google.com/gsi/client` 스크립트만
 * 로드하면 동작한다.
 *
 * 발급:
 *   1. https://console.cloud.google.com → API 및 서비스 → 사용자 인증 정보
 *   2. OAuth 2.0 클라이언트 ID 만들기 → 웹 애플리케이션
 *   3. 승인된 자바스크립트 원본: 운영 도메인 + http://localhost:3000
 *   4. 클라이언트 ID 복사 → .env 의 VITE_GOOGLE_CLIENT_ID 에 입력
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const GOOGLE_CONFIGURED = !!CLIENT_ID;

export interface GoogleProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

function ensureSdkLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('NO_WINDOW'));
    if (window.google?.accounts?.oauth2) return resolve();

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('GOOGLE_SDK_LOAD_FAIL')), { once: true });
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.dataset.googleGsi = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('GOOGLE_SDK_LOAD_FAIL'));
    document.head.appendChild(s);
  });
}

/**
 * 구글 로그인 팝업 → 사용자 프로필 반환
 */
export async function googleLogin(): Promise<GoogleProfile> {
  if (!GOOGLE_CONFIGURED) throw new Error('GOOGLE_NOT_CONFIGURED');

  await ensureSdkLoaded();
  if (!window.google?.accounts?.oauth2) throw new Error('GOOGLE_SDK_NOT_READY');

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID!,
      scope: 'openid profile email',
      callback: (resp) => {
        if (resp.error) return reject(new Error(`GOOGLE_${resp.error}`));
        if (!resp.access_token) return reject(new Error('GOOGLE_NO_TOKEN'));
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`GOOGLE_USERINFO_${res.status}`);

  const u = (await res.json()) as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  return {
    id: u.sub,
    name: u.name || '구글 사용자',
    email: u.email ?? '',
    profileImage: u.picture ?? '',
  };
}
