/**
 * 스탬프 리워드 저장소
 *
 * 이용 완료(`status='done'`) 예약 1건당 스탬프 1개 적립.
 * 10개 달성 시 향재원 고추냉이 선물 세트 쿠폰(6개월 유효) 자동 발급.
 *
 * 저장 위치: localStorage (key: `hyangjae_stamps_${userId}`)
 * Sprint-04 이후 Supabase 등 백엔드로 이관 예정 — 시그니처 유지 목표.
 */

const STORAGE_PREFIX = 'hyangjae_stamps_';
export const STAMP_GOAL = 10;
export const COUPON_VALID_MONTHS = 6;
export const REWARD_TYPE = 'wasabi-gift-set' as const;

export type RewardStatus = 'available' | 'used' | 'expired';

export interface Reward {
  id: string;
  type: typeof REWARD_TYPE;
  issuedAt: string;
  expiresAt: string;
  status: RewardStatus;
  usedAt?: string;
}

export interface StampState {
  userId: string;
  total: number;               // 누적 획득 총 스탬프
  current: number;             // 현재 스탬프판 (0 ~ STAMP_GOAL-1)
  appliedBookingIds: string[]; // 중복 적립 방지
  rewards: Reward[];
  updatedAt: string;
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function emptyState(userId: string): StampState {
  return {
    userId,
    total: 0,
    current: 0,
    appliedBookingIds: [],
    rewards: [],
    updatedAt: new Date().toISOString(),
  };
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function refreshExpired(state: StampState): StampState {
  const now = Date.now();
  let changed = false;
  const rewards = state.rewards.map(r => {
    if (r.status === 'available' && new Date(r.expiresAt).getTime() < now) {
      changed = true;
      return { ...r, status: 'expired' as const };
    }
    return r;
  });
  return changed ? { ...state, rewards, updatedAt: new Date().toISOString() } : state;
}

export function loadStamps(userId: string): StampState {
  if (typeof window === 'undefined') return emptyState(userId);
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return emptyState(userId);
    const parsed = JSON.parse(raw) as StampState;
    // backfill for older schemas
    if (!Array.isArray(parsed.appliedBookingIds)) parsed.appliedBookingIds = [];
    if (!Array.isArray(parsed.rewards)) parsed.rewards = [];
    return refreshExpired(parsed);
  } catch {
    return emptyState(userId);
  }
}

function save(state: StampState): StampState {
  const next = { ...state, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(storageKey(state.userId), JSON.stringify(next));
    } catch {
      // ignore quota
    }
  }
  return next;
}

export interface AddStampResult {
  state: StampState;
  stamped: boolean;        // 실제 적립 여부 (중복 방지 시 false)
  newReward: Reward | null; // 10개 달성으로 이번에 발급된 쿠폰
}

/**
 * 예약 1건을 기준으로 스탬프 1개 적립.
 * 같은 bookingId 로 중복 호출 시 재적립되지 않음.
 * 10개 도달 시 쿠폰 발급 + 현재 카드 0으로 리셋 (총 누적은 유지).
 */
export function addStamp(userId: string, bookingId: string | number): AddStampResult {
  const id = String(bookingId);
  const current = loadStamps(userId);
  if (current.appliedBookingIds.includes(id)) {
    return { state: current, stamped: false, newReward: null };
  }

  const nextTotal = current.total + 1;
  let nextCurrent = current.current + 1;
  let newReward: Reward | null = null;
  let rewards = current.rewards;

  if (nextCurrent >= STAMP_GOAL) {
    const issuedAt = new Date().toISOString();
    newReward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: REWARD_TYPE,
      issuedAt,
      expiresAt: addMonths(issuedAt, COUPON_VALID_MONTHS),
      status: 'available',
    };
    rewards = [...rewards, newReward];
    nextCurrent = 0;
  }

  const next: StampState = {
    ...current,
    total: nextTotal,
    current: nextCurrent,
    appliedBookingIds: [...current.appliedBookingIds, id],
    rewards,
  };

  return { state: save(next), stamped: true, newReward };
}

export function useReward(userId: string, rewardId: string): StampState {
  const current = loadStamps(userId);
  const rewards = current.rewards.map(r =>
    r.id === rewardId && r.status === 'available'
      ? { ...r, status: 'used' as const, usedAt: new Date().toISOString() }
      : r,
  );
  return save({ ...current, rewards });
}

export function resetStamps(userId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(userId));
}

export function getAvailableRewards(state: StampState): Reward[] {
  return state.rewards.filter(r => r.status === 'available');
}

/** 쿠폰 D-day (만료까지 남은 일수, 음수면 만료됨) */
export function daysUntilExpiry(reward: Reward): number {
  const diff = new Date(reward.expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
