/**
 * 사업자/예비사업자 인증 시스템
 *
 * 3단계 역할 구조:
 *   guest    — 일반 고객 (카카오 로그인)
 *   business — 사업자/예비사업자 (가입 신청 승인 후)
 *   admin    — 향재원 관리자 (모든 데이터 접근)
 *
 * 사업자는 자기 사업장의 수지분석·시설설계만 접근 가능.
 * 향재원 admin은 모든 사업자 데이터 + 향재원 자체 재무 접근 가능.
 *
 * 현재: localStorage 기반 Mock. 추후 Supabase Auth로 교체 예정.
 */

const BUSINESS_AUTH_KEY = 'hyangjae_business_auth';

export type BusinessRole = 'guest' | 'business' | 'admin';

export interface BusinessUser {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  role: BusinessRole;
  joinedAt: string;
  approved: boolean;
}

export function getBusinessUser(): BusinessUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUSINESS_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BusinessUser;
  } catch {
    return null;
  }
}

export function isBusinessAuth(): boolean {
  const user = getBusinessUser();
  return user !== null && user.approved && (user.role === 'business' || user.role === 'admin');
}

export function isAdminAuth(): boolean {
  const user = getBusinessUser();
  return user !== null && user.role === 'admin';
}

export function loginAsBusiness(info: Omit<BusinessUser, 'id' | 'joinedAt' | 'approved' | 'role'>): BusinessUser {
  const user: BusinessUser = {
    ...info,
    id: `biz-${Date.now()}`,
    role: 'business',
    joinedAt: new Date().toISOString().slice(0, 10),
    approved: true,
  };
  window.localStorage.setItem(BUSINESS_AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logoutBusiness(): void {
  window.localStorage.removeItem(BUSINESS_AUTH_KEY);
}
