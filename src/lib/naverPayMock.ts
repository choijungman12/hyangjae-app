/**
 * 네이버페이 Mock 결제
 *
 * Sprint-02 단계: 실 PG 연동 전 UI 흐름만 검증하는 Mock 구현.
 * 네트워크 요청 없이 3초 지연 후 성공 반환. 결제 이력은 localStorage 저장.
 *
 * 추후 Sprint-03 이후 실제 네이버페이 SDK로 교체 예정 —
 * 함수 시그니처(NaverPayRequest / NaverPayResult)는 유지.
 */

const STORAGE_KEY = 'hyangjae_naverpay_history';
const MOCK_DELAY_MS = 3000;

export interface NaverPayRequest {
  orderId: string;
  amount: number;
  productName: string;
  buyerName?: string;
}

export interface NaverPayResult {
  success: boolean;
  transactionId: string;
  paidAt: string;
  amount: number;
  orderId: string;
  method: 'naverpay-mock';
}

export interface NaverPayHistoryEntry extends NaverPayResult {
  productName: string;
}

function loadHistory(): NaverPayHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as NaverPayHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: NaverPayHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

/**
 * Mock 네이버페이 결제 요청.
 * 3초 후 성공 응답을 반환하고, 내부적으로 localStorage 이력에 기록.
 */
export function requestNaverPayMock(req: NaverPayRequest): Promise<NaverPayResult> {
  return new Promise(resolve => {
    window.setTimeout(() => {
      const result: NaverPayResult = {
        success: true,
        transactionId: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        paidAt: new Date().toISOString(),
        amount: req.amount,
        orderId: req.orderId,
        method: 'naverpay-mock',
      };

      const history = loadHistory();
      history.unshift({ ...result, productName: req.productName });
      saveHistory(history.slice(0, 100));

      resolve(result);
    }, MOCK_DELAY_MS);
  });
}

export function getNaverPayHistory(): NaverPayHistoryEntry[] {
  return loadHistory();
}

export function clearNaverPayHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** 총 금액에서 예약금(30%, 100원 단위 반올림) 계산 */
export function calcDeposit(total: number): number {
  return Math.round((total * 0.3) / 100) * 100;
}

/** 예약금과 현장 잔액을 한 번에 계산 */
export function splitBookingPayment(total: number): { total: number; deposit: number; remainder: number } {
  const deposit = calcDeposit(total);
  return {
    total,
    deposit,
    remainder: total - deposit,
  };
}
