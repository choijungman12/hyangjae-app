/**
 * Kakao 인증 유틸리티
 * Kakao JavaScript SDK 래퍼
 */

// ! 🔴 EDIT:API_KAKAO ─ 카카오 JavaScript 앱 키
// .env 파일에 VITE_KAKAO_APP_KEY 값을 설정하세요
// 발급: https://developers.kakao.com → 내 애플리케이션 → 앱 키
const APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined;

export const KAKAO_CONFIGURED = !!APP_KEY && APP_KEY !== '여기에_JavaScript_앱키_입력';

/** SDK 초기화 (이미 초기화된 경우 중복 실행 방지) */
export function initKakao() {
  if (!KAKAO_CONFIGURED) return false;
  if (typeof window.Kakao === 'undefined') {
    console.error('[Kakao] SDK 스크립트가 아직 로드되지 않았습니다.');
    return false;
  }
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(APP_KEY!);
  }
  return true;
}

export interface KakaoProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

/**
 * 카카오 로그인 팝업 실행 → 사용자 프로필 반환
 */
export function kakaoLogin(): Promise<KakaoProfile> {
  return new Promise((resolve, reject) => {
    if (!initKakao()) {
      reject(new Error('KAKAO_NOT_CONFIGURED'));
      return;
    }

    window.Kakao.Auth.login({
      scope: 'profile_nickname,profile_image,account_email',
      success: () => {
        // 토큰 획득 후 사용자 정보 요청
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: unknown) => {
            const response = res as {
              id: number;
              kakao_account?: {
                profile?: { nickname?: string; profile_image_url?: string };
                email?: string;
              };
            };
            const account = response.kakao_account;
            resolve({
              id: String(response.id),
              name: account?.profile?.nickname ?? '카카오 사용자',
              email: account?.email ?? '',
              profileImage: account?.profile?.profile_image_url ?? '',
            });
          },
          fail: (err: unknown) => {
            reject(new Error(`프로필 조회 실패: ${JSON.stringify(err)}`));
          },
        });
      },
      fail: (err: unknown) => {
        reject(new Error(`로그인 취소 또는 실패: ${JSON.stringify(err)}`));
      },
    });
  });
}

/** 카카오 로그아웃 */
export function kakaoLogout(): Promise<void> {
  return new Promise((resolve) => {
    if (!initKakao() || !window.Kakao.Auth.getAccessToken()) {
      resolve();
      return;
    }
    window.Kakao.Auth.logout(() => resolve());
  });
}
