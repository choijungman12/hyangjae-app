# 🎨 디자인 파트 작업 지시서 (from 독스/QA)

- **발행일**: 2026-04-11
- **발신**: 독스(기획자/QA) 창
- **수신**: 디자인 창
- **담당 영역**: `src/components/**`, `tailwind.config.ts`, 애니메이션, 공용 UI, `src/pages/map/**`, `src/pages/guide/**`, `src/pages/home/**`, `src/i18n/**`
- **브랜치**: 본인 작업 브랜치에서 작업 후 푸시

---

## ⚠️ 작업 전 필독

**기준 사업 데이터** (위반 시 BUG):

| 항목 | 값 |
|---|---|
| 주소 | 서울특별시 서초구 양재동 178-4 |
| 사업자 | 팜스마트 / 최정만 / 010-4929-0070 |
| 평일 타임 | 11:00~14:00 / 18:00~21:00 (2타임) |
| 주말 타임 | 11:00~14:00 / 15:00~18:00 / 18:00~21:00 (3타임) |

---

## 🔴 Critical

### [DS-01] 지도 페이지 운영시간 정보 오류 (고객 오인)

**파일**: [src/pages/map/page.tsx:234-235](../../src/pages/map/page.tsx#L234-L235)

**현재**:
```
평일 10:00 ~ 21:00
주말 09:00 ~ 22:00
```

**수정**: 평일 2타임 / 주말 3타임으로 분리 표기.
```
평일: 11:00-14:00 / 18:00-21:00
주말: 11:00-14:00 / 15:00-18:00 / 18:00-21:00
```

기존 JSX 구조를 유지하며 문자열만 교체. 필요시 `<br/>` 또는 `<div>` 1~2줄 추가 허용.

---

## 🟡 Minor

### [DS-02] Tailwind 커스텀 애니메이션 미정의

**파일**: [tailwind.config.ts](../../tailwind.config.ts) — `theme.extend` 섹션이 비어있음.

다음 커스텀 애니메이션 클래스가 코드에서 사용 중인데 **정의되어 있지 않아 CSS 미적용**:

1. `animate-bounce-in` — [src/components/Toast.tsx:30](../../src/components/Toast.tsx#L30)
2. `animate-fadeIn` — [src/pages/crop-data-detail/page.tsx](../../src/pages/crop-data-detail/page.tsx) 여러 라인 (506, 599, 672, 821 등)

**수정 방향** (둘 중 택1):
1. `tailwind.config.ts`의 `theme.extend.keyframes` + `theme.extend.animation` 에 두 애니메이션 정의 추가
   ```ts
   theme: {
     extend: {
       keyframes: {
         'bounce-in': { /* ... */ },
         'fadeIn': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
       },
       animation: {
         'bounce-in': 'bounce-in 0.4s ease-out',
         'fadeIn': 'fadeIn 0.3s ease-in',
       },
     },
   },
   ```
2. 또는 표준 Tailwind 클래스(`animate-bounce`, `animate-pulse`)로 교체

**권장**: 방식 1 (의도된 애니메이션 구현)

---

### [DS-03] i18n Dead Code

**경로**: `src/i18n/**`

**문제**:
- `i18next` / `react-i18next` 설정 구조는 존재
- 하지만 **모든 페이지가 한국어 하드코딩**, `useTranslation` 훅 사용 0건
- 앱스토어 영문 심사 대응 시 전면 작업 필요

**이번 스프린트 권장**:
- 당장 다국어화는 범위 밖
- 최소한 `home`, `login`, `booking` 주요 페이지에 `useTranslation` 골격만 세팅해 두고, 영문 번역 파일(`en/translation.json`)에 해당 키만 채워 두기
- 시간 부족 시 "추후 이관"으로 메모리에 기록만 남기고 skip 가능

---

## 🚫 수정 금지

- 사업 데이터 상수(가격, 연락처, 주소, 타임 등) 변경 금지 — 독스 파트 영역
- 작물 데이터(`src/data/crops.ts`) 값 변경 금지 — 독스 파트 영역
- 라우팅 구조(`src/router/config.tsx`) 변경 금지

---

## ✅ 작업 완료 후

1. `npm run dev` 로컬 확인 (브라우저에서 `map` 페이지 운영시간 반영 확인)
2. Toast/crop-data-detail 애니메이션 실제 동작 확인
3. commit: `fix(design): 운영시간 표기 + Tailwind 애니메이션 정의 (DS-01/02)`
4. 브랜치 push
5. 독스 창에 "디자인 파트 완료" 전달
