# 🛒 [Sprint-02] 부킹 파트 작업 지시서 — 예약금 + 스탬프

- **발행일**: 2026-04-12
- **발신**: 독스(기획자/QA)
- **수신**: 부킹 창 (`feature/booking` 브랜치)
- **스펙 원문**: [memory/specs/deposit-stamp-v1.md](../../specs/deposit-stamp-v1.md)
- **예상 공수**: 중~대 (신규 라이브러리 1개 + 페이지 수정 3곳)

---

## ⚠️ 작업 전 필독

- 본인 브랜치 최신화: `git fetch origin && git merge origin/main`
- 스펙 문서 반드시 숙지: `memory/specs/deposit-stamp-v1.md`
- 담당 영역 외 파일 수정 금지 (CLAUDE.md 참조)

---

## 📋 작업 1 — 예약금 (Deposit)

### [BK-04] 예약금 30% 계산 + 표시

**수정 파일**: `src/pages/booking/page.tsx` (본인 담당)

**요구사항**:
1. 총 금액 계산 후 **30% 를 예약금으로 산정**, **100원 단위 반올림**
   ```ts
   const deposit = Math.round((totalPrice * 0.3) / 100) * 100;
   const remainder = totalPrice - deposit;
   ```
2. 결제 단계 UI에 3줄 표기:
   - 총 금액
   - 예약금 (30%) — 네이버페이로 결제
   - 현장 결제 — 잔액
3. 계산 결과 테스트:
   - 평일 4인 139,000 → 예약금 41,700 / 잔액 97,300
   - 주말 6인 + 불멍 229,000 → 예약금 68,700 / 잔액 160,300
   - 와사비 수확 체험 2인 50,000 → 예약금 15,000 / 잔액 35,000

### [BK-05] 네이버페이 Mock 결제 연동

**신규 파일**: `src/lib/naverPayMock.ts`

```ts
// 예시 시그니처 (필요에 맞춰 조정)
export type NaverPayRequest = {
  orderId: string;
  amount: number;
  productName: string;
};

export type NaverPayResult = {
  success: boolean;
  transactionId: string;
  paidAt: string;
};

export async function requestNaverPayMock(req: NaverPayRequest): Promise<NaverPayResult>;
```

**Mock 동작**:
- 3초 setTimeout 후 success: true 반환
- `transactionId`: `MOCK-${Date.now()}`
- 실 PG 호출 없음, 네트워크 요청 없음
- 로컬스토리지에 결제 이력 저장 (`naverPayHistory`)

**UI 수정**: `src/pages/booking/page.tsx` 마지막 단계에
- 네이버페이 로고(녹색 N) + "네이버페이로 {예약금}원 결제하기" 버튼
- 버튼 클릭 시 로딩 오버레이 (3초)
- 성공 시 예약 확정 상태로 전환 + 예약 내역에 `depositPaid: true`, `depositAmount`, `remainderAmount` 기록

### [BK-06] 예약 취소 시 예약금 처리

**수정 파일**: `src/pages/profile/page.tsx` (환불 계산 함수)

**요구사항**:
- 기존 `calcRefund` 함수 확장: `depositRefund` 필드 추가
- 2일 전: 예약금 100% 환불
- 1일 전: 예약금 50% 환불
- 당일: 예약금 0% (몰수)
- 취소 UI에 "예약금 환불 금액" 별도 표시

---

## 📋 작업 2 — 스탬프 리워드

### [BK-07] 스탬프 상태 저장소 신규

**신규 파일**: `src/lib/stampStore.ts`

```ts
export type StampState = {
  userId: string;
  total: number;
  current: number;
  rewards: Reward[];
};

export type Reward = {
  id: string;
  type: 'wasabi-gift-set';
  issuedAt: string;
  expiresAt: string;
  status: 'available' | 'used' | 'expired';
  usedAt?: string;
};

// 주요 함수
export function loadStamps(userId: string): StampState;
export function addStamp(userId: string, bookingId: number | string): StampState;
export function issueReward(userId: string): Reward;
export function useReward(userId: string, rewardId: string): void;
```

- 저장 위치: `localStorage` (`stamp_${userId}`)
- `addStamp()` 내부에서 `current === 10` 도달 시 자동으로 `issueReward()` 호출, `current`를 0으로 리셋, `total`은 증가 유지
- 쿠폰 유효기간: 발급 후 6개월 (`issuedAt + 180 days`)

### [BK-08] 이용 완료 시 스탬프 자동 적립

**수정 파일**: `src/pages/profile/page.tsx`

- 예약 status 가 `'done'` 으로 전환될 때 `addStamp()` 호출
- 취소·노쇼 예약은 적립 안 됨
- 같은 예약이 중복 적립되지 않도록 `bookingId` 기준 중복 체크
- 적립 성공 시 Toast: "스탬프 +1개 적립됐어요!"
- 10개 도달 시 즉시 보상 모달 트리거 (디자인 파트의 `StampRewardModal` 컴포넌트 사용)

### [BK-09] 쿠폰 사용 흐름

**수정 파일**:
- `src/pages/profile/page.tsx` — 내 쿠폰함 섹션 신규
- `src/pages/shop/**` — `wasabi-gift-set` 주문 시 쿠폰 적용 버튼

**요구사항**:
- 쿠폰 상태 표시: `available` / `expired` / `used`
- 만료 D-day 표기 (6개월 카운트다운)
- 사용 시 주문 금액 100% 할인 (배송비는 추후 정책)

---

## 🚫 수정 금지

- `src/components/**` (디자인 파트 영역 — 스탬프판 UI·모달은 디자인이 만듦)
- `src/pages/smart-farm-data/**`, `crop-*/**` 등
- `src/data/*.ts` 의 타입·구조 (값만 수정 가능, 독스와 협의)
- `tailwind.config.ts`

## 📎 디자인 파트와의 경계

디자인 파트가 작성할 컴포넌트(부킹이 import 해서 사용):
- `<StampBoard userId={...} />` — 10칸 스탬프판
- `<StampRewardModal reward={...} onClose={...} />` — 10개 달성 축하 모달
- `<DepositBreakdown total={...} deposit={...} remainder={...} />` — 결제 내역 분리 UI

**컴포넌트 Props 시그니처는 부킹이 먼저 정의해서 독스에게 공유 → 디자인에게 전달**. 사전 합의 없이 구현하면 머지 시 충돌 납니다.

---

## ✅ 완료 기준

1. `npx tsc --noEmit --project tsconfig.app.json` 에러 0건
2. `npm run dev` 로 실기기에서 예약 → 예약금 결제 → 예약 확정 플로우 동작
3. 예약 status 수동으로 'done' 변경 시 스탬프 +1
4. 10개 도달 시 쿠폰 발급 + 프로필에 보관 확인

## ✅ 완료 후

```bash
git add src/lib/stampStore.ts src/lib/naverPayMock.ts src/pages/booking src/pages/profile src/pages/shop
git commit -m "feat(booking): 예약금 30% + 스탬프 리워드 + 네이버페이 Mock (BK-04~09)"
git push origin feature/booking
```

독스 창에 "부킹 Sprint-02 완료" 보고.
