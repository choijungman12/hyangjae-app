/**
 * Naver 간편 로그인 유틸리티
 *
 * 네이버 로그인 SDK(`naveridlogin_js_sdk`) 또는 OAuth2 redirect 방식 중
 * SDK 방식을 사용한다. 클라이언트 ID 만으로 동작하며, 콜백 URL 은 네이버
 * 개발자센터(https://developers.naver.com)의 "Callback URL" 항목과 일치해야 한다.
 *
 * 발급:
 *   1. https://developers.naver.com → 애플리케이션 등록
 *   2. 사용 API: 네이버 로그인
 *   3. 환경: PC웹, 서비스 URL: 운영 도메인, Callback: /auth/naver/callback
 *   4. Client ID 복사 → .env 의 VITE_NAVER_CLIENT_ID 에 입력
 */

const CLIENT_ID    = import.meta.env.VITE_NAVER_CLIENT_ID    as string | undefined;
const CALLBACK_URL = (import.meta.env.VITE_NAVER_CALLBACK_URL as string | undefined)
  || (typeof window !== 'undefined' ? `${window.location.origin}/auth/naver/callback` : '');

export const NAVER_CONFIGURED = !!CLIENT_ID;

export interface NaverProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

interface NaverLoginInstance {
  init: () => void;
  getLoginStatus: (cb: (status: boolean) => void) => void;
  user: {
    id: string;
    nickname?: string;
    name?: string;
    email?: string;
    profile_image?: string;
  };
}

declare global {
  interface Window {
    naver?: {
      LoginWithNaverId: new (opts: {
        clientId: string;
        callbackUrl: string;
        isPopup: boolean;
        loginButton: { color: 'green'; type: number; height: number };
      }) => NaverLoginInstance;
    };
  }
}

let instance: NaverLoginInstance | null = null;

function ensureSdkLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('NO_WINDOW'));
    if (window.naver?.LoginWithNaverId) return resolve();

    const existing = document.querySelector<HTMLScriptElement>('script[data-naver-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('NAVER_SDK_LOAD_FAIL')), { once: true });
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
    s.async = true;
    s.dataset.naverSdk = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('NAVER_SDK_LOAD_FAIL'));
    document.head.appendChild(s);
  });
}

function initInstance(): NaverLoginInstance {
  if (instance) return instance;
  if (!window.naver?.LoginWithNaverId) throw new Error('NAVER_SDK_NOT_READY');
  instance = new window.naver.LoginWithNaverId({
    clientId: CLIENT_ID!,
    callbackUrl: CALLBACK_URL,
    isPopup: true,
    loginButton: { color: 'green', type: 3, height: 44 },
  });
  instance.init();
  return instance;
}

/**
 * 네이버 로그인 팝업 → 사용자 프로필 반환
 */
export function naverLogin(): Promise<NaverProfile> {
  return new Promise(async (resolve, reject) => {
    if (!NAVER_CONFIGURED) return reject(new Error('NAVER_NOT_CONFIGURED'));

    try {
      await ensureSdkLoaded();
      const naverInstance = initInstance();

      // SDK 의 표준 흐름: hidden 버튼을 강제로 클릭 → 팝업 열림
      const btnContainer = document.createElement('div');
      btnContainer.id = 'naverIdLogin';
      btnContainer.style.display = 'none';
      document.body.appendChild(btnContainer);
      naverInstance.init();

      // 팝업 콜백에서 로그인 상태 확인
      naverInstance.getLoginStatus((status) => {
        if (!status) {
          reject(new Error('NAVER_LOGIN_CANCELED'));
          return;
        }
        const u = naverInstance.user;
        resolve({
          id: u.id,
          name: u.nickname || u.name || '네이버 사용자',
          email: u.email ?? '',
          profileImage: u.profile_image ?? '',
        });
      });

      // 실제 로그인 트리거
      const realBtn = btnContainer.querySelector<HTMLAnchorElement>('a, button');
      if (realBtn) realBtn.click();
      else reject(new Error('NAVER_BUTTON_NOT_RENDERED'));
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
