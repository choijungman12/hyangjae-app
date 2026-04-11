# 🎨 [Sprint-03] 디자인 파트 작업 지시서 — 텃밭 수확 UI

- **발행일**: 2026-04-12
- **발신**: 독스(기획자/QA)
- **수신**: 디자인 창 (`design/ui-refactor`)
- **스펙 원문**: [memory/specs/farm-package-v1.md](../../specs/farm-package-v1.md)
- **의존성**: Sprint-02와 병렬 가능

---

## 📋 신규 컴포넌트 4개

### [DS-08] `<ColkijeFreeBanner />` — 콜키지 프리 강조 배너

**신규 파일**: `src/components/ColkijeFreeBanner.tsx`

**Props**: 없음 (순수 프레젠테이션)

**디자인 요구사항**:
- 예약 페이지 히어로 밑에 삽입되는 풀와이드 배너
- 그라데이션 배경: emerald-500 → teal-600
- 아이콘: 🍖 (또는 Remix icon `ri-restaurant-fill`)
- 메인 카피: "모든 외부 음식·주류 자유 반입"
- 서브 카피: "콜키지 프리 · 원하는 식재료·주류 자유롭게 준비하세요"
- 강조 배지: "NEW" 또는 "✨"
- 다크 모드 대응
- 애니메이션: 페이지 진입 시 `animate-slideUp`

---

### [DS-09] `<HarvestCalendar />` — 월별 수확 달력

**신규 파일**: `src/components/HarvestCalendar.tsx`

**Props**:
```tsx
type HarvestCalendarProps = {
  currentMonth: number;  // 1~12
  compact?: boolean;      // true면 현재 월만 강조
};
```

**디자인 요구사항**:
- **12칸 월별 그리드** (4x3 또는 세로 스크롤 가능)
- 현재 월: 강조 테두리 + 배경 (emerald)
- 각 칸 내부:
  - 월 숫자 (예: "4월")
  - 주력 작물 (있을 때만, 딸기 🍓 아이콘)
  - 쌈채소 아이콘 (🥬 × N개)
- 하단 범례:
  - 🍓 딸기 시즌 (12~5월)
  - 🥬 쌈채소 (연중)
- `compact=true` 모드: 현재 월 카드만 크게 표시

**데이터 소스**: 부킹 파트가 만든 `src/data/products.ts`의 `SEASONAL_HARVEST` 사용.

---

### [DS-10] `<PartnerStoreCard />` — 파트너 상점 카드

**신규 파일**: `src/components/PartnerStoreCard.tsx`

**Props**:
```tsx
type PartnerStoreCardProps = {
  store: {
    id: string;
    name: string;
    category: 'butcher' | 'restaurant' | 'grocery';
    phone: string | null;
    deliveryTimeMin: number;
    distance: string;
    notes: string;
    confirmed: boolean;
  };
};
```

**디자인 요구사항**:
- 카드 스타일: `bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border`
- 상단: 카테고리 아이콘 (정육점 🥩 / 한식당 🍚 / 마트 🛒)
- 이름 + confirmed 배지:
  - `confirmed: true` → 녹색 "제휴" 배지
  - `confirmed: false` → 노란 "협의 중" 배지 (fade 처리)
- 중단: 거리 · 배달 시간 · 메모
- 하단: 전화번호 (있을 때만, 클릭 시 `tel:` 링크)
- 다크 모드 대응

---

### [DS-11] `<IncludedItemsList />` — 포함 내역 아이콘 리스트

**신규 파일**: `src/components/IncludedItemsList.tsx`

**Props**:
```tsx
type IncludedItem = {
  icon: string;       // emoji 또는 remix class
  title: string;
  description?: string;
  highlight?: boolean;
};

type IncludedItemsListProps = {
  items: IncludedItem[];
};
```

**디자인 요구사항**:
- 세로 리스트, 각 아이템 카드 형태
- 좌측 아이콘 (대형, 그라데이션 배경 원)
- 우측 제목 + 설명
- `highlight: true` 아이템은 emerald 테두리 강조
- 예상 사용 예시:
  ```tsx
  <IncludedItemsList items={[
    { icon: '🌱', title: '내 데크 전용 텃밭 수확', description: '제철 작물 300g', highlight: true },
    { icon: '🧪', title: '고추냉이 스마트팜 투어', description: '약 20분 · 웰컴 시식' },
    { icon: '🏕️', title: '데크 3시간 · 집기 일체', description: '4인 기준 · 최대 8인' },
    { icon: '🍖', title: '콜키지 프리', description: '외부 음식·주류 자유' },
    { icon: '🥩', title: '파트너 배달', description: '정육점 (협의 중)' },
  ]} />
  ```

---

## 📋 Tailwind 애니메이션 (기존 확장)

### [DS-12] 수확 카드 호버 효과

`tailwind.config.ts` `theme.extend.keyframes`에 추가 (선택):
```ts
'harvest-glow': {
  '0%, 100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.4)' },
  '50%':      { boxShadow: '0 0 0 8px rgba(52,211,153,0)' },
},
```
`animation: { 'harvest-glow': 'harvest-glow 2s ease-in-out infinite' }`

현재 월 카드에만 적용.

---

## 🚫 수정 금지

- 모든 페이지 **로직** (useState, useEffect, 함수, 이벤트 핸들러, 타입)
- `src/data/**` (독스·부킹)
- `src/lib/**`
- `src/router/config.tsx`

## 📎 부킹 파트와의 경계

부킹이 만들고, 디자인은 **사용만**:
- `src/data/products.ts` 의 `SEASONAL_HARVEST`, `PARTNER_STORES`, `ON_SITE_ITEMS`, `calcHarvestGrams()`
- 예약 페이지의 상태 관리

**Props 시그니처는 부킹이 먼저 제안 → 독스 중계 → 디자인 구현**.
부킹 BK-13~15 작업이 끝나기 전에는 프로토타입 상태까지만 만들고 대기.

---

## ✅ 완료 기준

1. `npx tsc --noEmit --project tsconfig.app.json` 에러 0건
2. 4개 컴포넌트 모두 `profile` 또는 `booking` 페이지에서 정상 렌더
3. 다크 모드 / 라이트 모드 양쪽 정상
4. 모바일(375px) ~ 태블릿(768px) 반응형

## ✅ 완료 후

```bash
git add src/components tailwind.config.ts
git commit -m "feat(design): 콜키지 배너 + 수확 달력 + 파트너 카드 (DS-08~12)"
git push origin design/ui-refactor
```

독스 창에 "디자인 Sprint-03 완료" 보고.
