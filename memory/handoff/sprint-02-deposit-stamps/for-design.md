# 🎨 [Sprint-02] 디자인 파트 작업 지시서 — 스탬프 UI + 결제 단계

- **발행일**: 2026-04-12
- **발신**: 독스(기획자/QA)
- **수신**: 디자인 창 (`design/ui-refactor` 브랜치)
- **스펙 원문**: [memory/specs/deposit-stamp-v1.md](../../specs/deposit-stamp-v1.md)
- **예상 공수**: 중 (컴포넌트 3개 신규 + 애니메이션 1개)

---

## ⚠️ 작업 전 필독

- 본인 브랜치 최신화: `git fetch origin && git merge origin/main`
- 스펙 문서 숙지: `memory/specs/deposit-stamp-v1.md`
- **부킹 파트와 Props 시그니처 사전 합의 필수** — 독스(저)가 중계

---

## 📋 작업 1 — 신규 컴포넌트 3개

### [DS-03] `<StampBoard />` — 10칸 스탬프판

**신규 파일**: `src/components/StampBoard.tsx`

**Props (부킹과 합의 후 확정)**:
```tsx
type StampBoardProps = {
  current: number;    // 현재 스탬프 수 (0~10)
  total: number;      // 누적 총 스탬프 (참고 표시용)
  onStampClick?: () => void;  // optional
};
```

**디자인 요구사항**:
- **10칸 그리드** (5x2 배치)
- 채워진 스탬프: 향재원 로고 워사비 잎 🌿 + 녹색 그라데이션 (emerald-400 → teal-500)
- 빈 스탬프: 회색 점선 원 (border-dashed border-gray-300)
- 상단: "향재원 스티커 {current}/10" + 진행률 바
- 하단: "10개 달성 시 고추냉이 선물 세트 🎁" 안내
- **카드 스타일**: `bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100`
- 다크 모드 대응 (`dark:` variant)
- 모바일 우선, 반응형

### [DS-04] `<StampRewardModal />` — 10개 달성 축하 모달

**신규 파일**: `src/components/StampRewardModal.tsx`

**Props**:
```tsx
type StampRewardModalProps = {
  open: boolean;
  reward: {
    id: string;
    type: 'wasabi-gift-set';
    issuedAt: string;
    expiresAt: string;
  };
  onClose: () => void;
  onViewCoupon: () => void;
};
```

**디자인 요구사항**:
- **전체 화면 오버레이** (`fixed inset-0 bg-black/50 backdrop-blur-sm`)
- 중앙 카드: 둥근 모서리, 그라데이션 배경
- 상단 아이콘: 🎉 또는 🎁 대형 (8xl), `animate-bounce-in`
- 제목: "축하합니다!"
- 본문: "향재원 고추냉이 선물 세트 쿠폰이 발급되었습니다!"
- 유효기간 표시: "유효기간: {expiresAt}" (`translate="no"`)
- 버튼 2개: [쿠폰 확인하기] (메인, emerald), [닫기] (secondary, gray)
- 배경에 컨페티 효과 (선택사항, 구현 가능하면)

### [DS-05] `<DepositBreakdown />` — 결제 내역 분리 UI

**신규 파일**: `src/components/DepositBreakdown.tsx`

**Props**:
```tsx
type DepositBreakdownProps = {
  total: number;       // 총 금액
  deposit: number;     // 예약금 (30%)
  remainder: number;   // 현장 결제 잔액
  highlight?: 'deposit' | 'remainder';
};
```

**디자인 요구사항**:
- 3줄 표시:
  ```
  총 금액        229,000원
  예약금 (30%)    68,700원  ← 네이버페이
  현장 결제      160,300원  ← 당일 현장
  ```
- 각 행 우측에 작은 보조 문구 (작은 아이콘 + 설명)
- 숫자 엘리먼트에 **`translate="no"` + `key` prop 필수** (Papago 호환)
- 네이버페이 행: 녹색 N 로고 + "네이버페이"
- 현장 결제 행: 💳 아이콘 + "카드·현금·페이"
- 다크 모드 대응

---

## 📋 작업 2 — Tailwind 애니메이션 추가

### [DS-06] `animate-stamp-pop` 커스텀 애니메이션

**수정 파일**: `tailwind.config.ts`

기존 `theme.extend.keyframes` / `animation`에 추가:

```ts
keyframes: {
  // 기존 bounce-in, fadeIn, slideUp 유지
  'stamp-pop': {
    '0%':   { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
    '60%':  { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
    '100%': { transform: 'scale(1) rotate(0deg)',   opacity: '1' },
  },
},
animation: {
  // 기존 bounce-in, fadeIn, slideUp 유지
  'stamp-pop': 'stamp-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
},
```

**사용처**: `<StampBoard />` 에서 스탬프가 새로 추가될 때 해당 칸에 `animate-stamp-pop` 적용.

---

## 📋 작업 3 — 프로필 페이지 스탬프 섹션 (JSX만)

### [DS-07] 프로필 페이지에 `<StampBoard />` 섹션 삽입

**수정 파일**: `src/pages/profile/page.tsx`

⚠️ **로직은 건들지 마세요**. JSX만 추가.

- 기존 예약 내역 섹션 아래 스탬프 섹션 삽입:
  ```tsx
  <section className="px-4 pt-4">
    <StampBoard current={stamps.current} total={stamps.total} />
  </section>
  ```
- `stamps` 상태·함수는 **부킹 파트가 useState 로 이미 구현해 둔 것**을 사용 (사전 합의 필수)

---

## 🚫 수정 금지

- 모든 페이지의 **로직** (`useState`, `useEffect`, 함수, 이벤트 핸들러, 타입)
- `src/lib/**` — 스탬프 저장소·Mock 결제는 부킹 파트 영역
- `src/data/**` — 데이터는 독스 영역
- `src/router/config.tsx`
- `src/pages/admin/**`

## 📎 부킹 파트와의 경계

부킹 파트가 만드는 것 (디자인은 사용만):
- `src/lib/stampStore.ts` — 스탬프 상태 관리
- `src/lib/naverPayMock.ts` — Mock 결제
- `src/pages/profile/page.tsx` 내 스탬프 상태 훅

**경계 원칙**: 디자인은 **순수 프레젠테이션 컴포넌트**만 작성 (Props 받아서 렌더, 내부 상태 없음).

---

## ✅ 완료 기준

1. `npx tsc --noEmit --project tsconfig.app.json` 에러 0건
2. Storybook 없이 `profile` 페이지에서 컴포넌트 3개 정상 렌더
3. 다크 모드 / 라이트 모드 모두 정상
4. 모바일 (375px) ~ 태블릿 (768px) 반응형 확인

## ✅ 완료 후

```bash
git add src/components tailwind.config.ts src/pages/profile/page.tsx
git commit -m "feat(design): 스탬프판 + 보상 모달 + 결제 분리 UI (DS-03~07)"
git push origin design/ui-refactor
```

독스 창에 "디자인 Sprint-02 완료" 보고.
