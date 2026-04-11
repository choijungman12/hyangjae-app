# 🛒 [Sprint-03] 부킹 파트 작업 지시서 — 텃밭 수확 + 콜키지 + 파트너

- **발행일**: 2026-04-12
- **발신**: 독스(기획자/QA)
- **수신**: 부킹 창 (`feature/booking`)
- **스펙 원문**: [memory/specs/farm-package-v1.md](../../specs/farm-package-v1.md)
- **의존성**: Sprint-02(예약금·스탬프)와 **병렬 진행 가능** (다른 파일 영역)

---

## ⚠️ 답변 — 네 3가지 질문

부킹이 독스에게 물었던 것들에 대한 공식 답변:

1. **파트너 상점 플레이스홀더** → ✅ **YES, 지금 구조 만들기**
   - `confirmed: false` + 이름 "(제휴 협의 중)" + phone `null` 상태로 진행
   - 실 제휴 확정되면 값만 교체할 수 있도록 타입 안정화

2. **소모품 가격 추정** → ✅ **독스가 시장 기준가 제안** (아래 표)
   - 사장님 최종 확인 전 기본값으로 사용, 추후 교체

3. **수확 시즌 달력** → ✅ **월별 12칸 테이블**
   - `Record<1-12, { primary: string[]; rotation: string[] }>` 구조

---

## 📋 작업 1 — `src/data/products.ts` 확장

### [BK-10] 일회용 소모품 상수 추가

**기존 interface 변경 금지** — 새로운 export 상수로 추가.

```ts
// src/data/products.ts 하단에 추가

export type OnSiteItem = {
  id: string;
  category: 'fuel' | 'utensil' | 'meal' | 'snack' | 'drink' | 'ice';
  name: string;
  price: number;
  unit: string;
  note?: string;
};

export const ON_SITE_ITEMS: OnSiteItem[] = [
  // 숯/연료
  { id: 'charcoal-3kg',    category: 'fuel',    name: '참숯',           price: 8000, unit: '3kg' },
  { id: 'firestarter',     category: 'fuel',    name: '착화제',         price: 3000, unit: '1개' },
  // 집기
  { id: 'disposable-set',  category: 'utensil', name: '일회용 접시·수저 세트', price: 2000, unit: '5인 세트' },
  { id: 'foil-roll',       category: 'utensil', name: '호일',           price: 2000, unit: '1롤' },
  // 간편식
  { id: 'cup-ramen',       category: 'meal',    name: '컵라면',         price: 2500, unit: '1개' },
  { id: 'cup-rice',        category: 'meal',    name: '컵밥',           price: 4500, unit: '1개' },
  { id: 'instant-soup',    category: 'meal',    name: '즉석국',         price: 3500, unit: '1팩' },
  // 스낵
  { id: 'snack-pack',      category: 'snack',   name: '과자',           price: 2000, unit: '1봉' },
  { id: 'marshmallow',     category: 'snack',   name: '마시멜로',       price: 4000, unit: '1봉', note: '캠프파이어용' },
  { id: 'skewer-set',      category: 'snack',   name: '꼬치 세트',      price: 4000, unit: '5개', note: '어묵·소세지 혼합' },
  // 음료
  { id: 'water-500',       category: 'drink',   name: '생수',           price: 1500, unit: '500ml' },
  { id: 'canned-coffee',   category: 'drink',   name: '캔 커피',        price: 2500, unit: '1캔' },
  { id: 'canned-juice',    category: 'drink',   name: '캔 주스',        price: 2500, unit: '1캔' },
  { id: 'soda',            category: 'drink',   name: '탄산음료',       price: 2500, unit: '1캔' },
  // 얼음
  { id: 'ice-1kg',         category: 'ice',     name: '얼음',           price: 3000, unit: '1kg' },
];
```

### [BK-11] 월별 수확 달력 상수 추가

```ts
export type HarvestMonth = {
  primary: string[];      // 주력 (딸기 등 시즌성)
  rotation: string[];     // 쌈채소 로테이션
  note?: string;
};

export const SEASONAL_HARVEST: Record<number, HarvestMonth> = {
  1:  { primary: ['딸기'], rotation: ['상추', '로메인'] },
  2:  { primary: ['딸기'], rotation: ['상추', '로메인'] },
  3:  { primary: ['딸기'], rotation: ['상추', '깻잎'] },
  4:  { primary: ['딸기'], rotation: ['상추', '로메인', '깻잎'] },
  5:  { primary: ['딸기'], rotation: ['상추', '깻잎', '양상추'] },
  6:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  7:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  8:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  9:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  10: { primary: [],       rotation: ['상추', '깻잎', '로메인'] },
  11: { primary: [],       rotation: ['상추', '깻잎', '로메인'] },
  12: { primary: ['딸기'], rotation: ['상추', '로메인'] },
};

// 기본 제공량 계산 헬퍼
export function calcHarvestGrams(guests: number): number {
  // 4인 기준 300g, 1인 추가마다 +75g
  return 300 + Math.max(0, guests - 4) * 75;
}
```

### [BK-12] 파트너 상점 상수 추가

```ts
export type PartnerStore = {
  id: string;
  name: string;
  category: 'butcher' | 'restaurant' | 'grocery';
  phone: string | null;
  deliveryTimeMin: number;
  distance: string;
  notes: string;
  confirmed: boolean;
};

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: 'partner-butcher-1',
    name: '(제휴 협의 중 · 정육점)',
    category: 'butcher',
    phone: null,
    deliveryTimeMin: 15,
    distance: '—',
    notes: '양재동 반경 1km 내 정육점 제휴 협의 예정',
    confirmed: false,
  },
  {
    id: 'partner-restaurant-1',
    name: '(제휴 협의 중 · 한식당)',
    category: 'restaurant',
    phone: null,
    deliveryTimeMin: 20,
    distance: '—',
    notes: '반찬·국·구이류 배달 협의 예정',
    confirmed: false,
  },
];
```

---

## 📋 작업 2 — 예약 페이지 UI 갱신 (`src/pages/booking/page.tsx`)

### [BK-13] 포함 내역 카드 재작성

기존 "기본 포함" 섹션을 아래 구성으로 변경:

```
✨ 내 데크 전용 텃밭에서 직접 수확 (제철 작물 {calcHarvestGrams(guests)}g)
   → {현재 월의 SEASONAL_HARVEST.primary + rotation 표시}

✨ 고추냉이 스마트팜 가이드 투어 (약 20분, 웰컴 와사비 시식)

✨ 데크 3시간 · 집기 일체 · 4인 기준 (최대 8인)

✨ 외부 음식·주류 전면 자유 반입 (콜키지 프리)

✨ 고기 필요 시 파트너 정육점 배달 가능 (협의 중)
```

**중요**: 인원(`guests`)이 바뀌면 수확량 표시가 자동 갱신되어야 함. `calcHarvestGrams(guests)` 헬퍼 사용.

### [BK-14] 콜키지 프리 배너

예약 페이지 최상단 히어로 밑에 강조 배너:
- "🍖 모든 외부 음식·주류 자유 반입 · 콜키지 프리"
- 디자인 파트가 만들 `<ColkijeFreeBanner />` 컴포넌트 사용 (Props 합의 필요)

### [BK-15] 파트너 상점 섹션

예약 완료 화면 또는 예약 상세 섹션에 추가:
- `PARTNER_STORES.filter(s => s.confirmed)` 가 있으면 실명 표시
- 아니면 "(제휴 협의 중)" 배지로 표시
- 디자인 파트의 `<PartnerStoreCard />` 사용

---

## 📋 작업 3 — 추가 옵션 상품화

### [BK-16] Add-on 상품 추가

```ts
export type AddOn = {
  id: string;
  name: string;
  price: number;
  description: string;
  availability?: string;  // 시즌 제한 등
};

export const BOOKING_ADDONS: AddOn[] = [
  {
    id: 'harvest-upgrade',
    name: '수확량 업그레이드 +200g',
    price: 5000,
    description: '기본 제공량에서 200g 추가 수확',
  },
  {
    id: 'strawberry-full-course',
    name: '딸기 풀코스 체험 +500g',
    price: 15000,
    description: '딸기 시즌 한정 대량 수확',
    availability: '12월 ~ 5월',
  },
  {
    id: 'wasabi-grater',
    name: '와사비 강판 체험',
    price: 5000,
    description: '투어 중 직접 강판으로 갈아보기',
  },
];
```

예약 페이지 "추가 옵션" 섹션에 리스트 표시, 선택 시 총액에 반영.

---

## 🚫 수정 금지

- `src/components/**` (디자인 파트)
- `src/pages/smart-farm-data/**`, `crop-*/**`, `growing-guide/**`
- 기존 `products.ts` 의 `PRODUCTS` 배열 구조/타입 (새 상수만 추가)

## 📎 디자인 파트와의 경계

디자인이 만들 컴포넌트 (부킹이 import 해서 사용):
- `<ColkijeFreeBanner />` — 콜키지 프리 강조 배너
- `<HarvestCalendar month={currentMonth} />` — 월별 수확 달력
- `<PartnerStoreCard store={...} />` — 파트너 상점 카드
- `<IncludedItemsList items={...} />` — 포함 내역 아이콘 리스트

**Props 시그니처는 부킹이 먼저 제안 → 독스 중계 → 디자인 구현**

---

## ✅ 완료 기준

1. `npx tsc --noEmit --project tsconfig.app.json` 에러 0건
2. 예약 페이지에서 인원 변경 시 수확량 자동 재계산 확인
3. 현재 월(April = 4)에 맞는 작물 표시 확인
4. 추가 옵션 선택 시 총액 반영
5. Sprint-02(예약금·스탬프) 작업과 머지 충돌 없음

## ✅ 완료 후

```bash
git add src/data/products.ts src/pages/booking/page.tsx
git commit -m "feat(booking): 텃밭 수확 + 콜키지 + 파트너 상점 (BK-10~16)"
git push origin feature/booking
```

독스 창에 "부킹 Sprint-03 완료" 보고.
