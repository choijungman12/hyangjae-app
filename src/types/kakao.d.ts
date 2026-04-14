/**
 * Kakao JavaScript SDK 타입 선언
 * https://developers.kakao.com/sdk/reference/js
 */

interface KakaoAuthStatusResponse {
  status: 'connected' | 'not_connected';
  user?: KakaoUser;
}

interface KakaoUser {
  id: number;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email?: string;
    email_needs_agreement?: boolean;
    has_email?: boolean;
  };
}

interface KakaoAuthLoginResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface KakaoAuthLoginOptions {
  success?: (authObj: KakaoAuthLoginResponse) => void;
  fail?: (err: unknown) => void;
  always?: (authObj: KakaoAuthLoginResponse | unknown) => void;
  scope?: string;
  throughTalk?: boolean;
  persistAccessToken?: boolean;
}

interface KakaoAPIRequestOptions {
  url: string;
  success?: (response: unknown) => void;
  fail?: (err: unknown) => void;
  always?: (response: unknown) => void;
  data?: Record<string, unknown>;
}

interface Kakao {
  init(appKey: string): void;
  isInitialized(): boolean;
  Auth: {
    login(options: KakaoAuthLoginOptions): void;
    logout(callback?: () => void): void;
    getStatusInfo(callback: (statusObj: KakaoAuthStatusResponse) => void): void;
    getAccessToken(): string | null;
  };
  API: {
    request(options: KakaoAPIRequestOptions): void;
  };
}

declare global {
  interface Window {
    Kakao: Kakao;
  }
  const Kakao: Kakao;
}

export {};
