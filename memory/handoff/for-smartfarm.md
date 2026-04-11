# 🌱 스마트팜 파트 작업 지시서 (from 독스/QA)

- **발행일**: 2026-04-11
- **발신**: 독스(기획자/QA) 창
- **수신**: 스마트팜 창
- **담당 영역**: `src/pages/smart-farm-data/**`, `device-control/**`, `crop-*/`, `growing-guide/**`, `cultivation-calendar/**`, `facility-design/**`, `profit-analysis/**`, `price-trends/**`, `ai-consultant/**`
- **브랜치**: 본인 작업 브랜치에서 작업 후 푸시

---

## ⚠️ 작업 전 필독

**기준 사업 데이터** (위반 시 BUG):

| 항목 | 값 |
|---|---|
| 주력 작물 | **고추냉이 (한국 국산)** — "일본산" 표기 금지 |
| 스마트팜 면적 | 150평 |
| 전체 면적 | 536평 |
| 연 매출 | 4억 |
| ROI | 22% |
| BEP | 3개월 |
| 초기 투자 | 15억 |
| 기준 날짜 | 2026-04-10 (2024/2025 잔존 = 버그) |

---

## 🔴 Critical (빌드 차단 / TypeScript 컴파일 에러)

### [SF-01] facility-design 타입 에러

**파일**: [src/pages/facility-design/page.tsx:238](../../src/pages/facility-design/page.tsx#L238)

**에러**:
```
TS2339: Property 'recommended' does not exist on type
'{ readonly id: "vinyl"; readonly name: "비닐하우스"; ... }'
```

**원인**: 시설 옵션 배열 중 일부 객체에는 `recommended` 필드가 없는데, 렌더 시 그 필드에 접근하고 있음.

**수정 방향** (둘 중 택1):
1. 모든 시설 옵션 객체에 `recommended: boolean` 필드를 추가 (타입이 union이므로 모두 동일 필드 보유 필요)
2. 접근 시 옵셔널 체이닝 `option.recommended?` 로 변경

> 타입 구조 변경은 최소화하고, 가능하면 **데이터에 필드 추가**로 해결.

---

### [SF-02] profit-analysis 변수명 에러

**파일**: [src/pages/profit-analysis/page.tsx:169](../../src/pages/profit-analysis/page.tsx#L169)

**에러**:
```
TS2552: Cannot find name 'CROP_DB'. Did you mean 'cropDB'?
```

**수정**: `CROP_DB` → `cropDB` (소문자)

---

## 🟡 Minor (정보 오류)

### [SF-03] 2025 → 2026 날짜 갱신

| 파일 | 라인 | 현재 |
|---|---|---|
| [src/pages/facility-design/page.tsx](../../src/pages/facility-design/page.tsx) | L6, L178 | "2025~2026년 기준" → **"2026년 기준"** |
| [src/pages/price-trends/page.tsx:158](../../src/pages/price-trends/page.tsx#L158) | L158 | "2025년 평균 시세 기반" → **"2026년 평균 시세 기반"** |
| [src/pages/profit-analysis/page.tsx:253](../../src/pages/profit-analysis/page.tsx#L253) | L253 | "2025년 평균 시세 기반" → **"2026년 평균 시세 기반"** |

---

### [SF-04] 작물 상세 카피 브랜드 정합성

**파일**: [src/pages/crop-detail/page.tsx:105](../../src/pages/crop-detail/page.tsx#L105)

**현재**: `'일본산 수입품과 경쟁 (국산 선호도 높음)'`

**수정**: `'해외 수입품과 경쟁 (국산 선호도 높음)'`

**이유**: 향재원 브랜드는 "한국 국산 고추냉이"를 핵심 가치로 내세우므로, "일본산"으로 특정 국가를 언급하면 일본 관련 이미지가 잔존. 중립화.

---

## 🚫 수정 금지

- 함수 시그니처, `useState` 구조, 타입 정의 대규모 변경 금지
- `src/data/*.ts`의 `interface` / `export` 구조 수정 금지 (값만 수정 가능)
- 단, [SF-01] 해결을 위해 데이터 객체에 필드를 추가하는 것은 허용

---

## ✅ 작업 완료 후

1. `npx tsc --noEmit --project tsconfig.app.json` 로컬 확인 (에러 0건이어야 함)
2. commit: `fix(smartfarm): TS 컴파일 에러 + 날짜/카피 QA 지적 수정 (SF-01~04)`
3. 브랜치 push
4. 독스 창에 "스마트팜 파트 완료" 전달
