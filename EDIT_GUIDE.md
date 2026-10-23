# 🎨 수정 가이드 (Edit Guide)

앱 운영을 위해 직접 수정해야 하는 모든 위치를 색상별로 정리한 문서입니다.

## 🛠 VS Code 색상 주석 확장 설치

아래 확장을 설치하면 코드 주석이 자동으로 색상별로 표시됩니다.

1. VS Code 왼쪽 사이드바 → **Extensions** (Ctrl+Shift+X)
2. 검색: **Better Comments**
3. 설치 → 자동으로 활성화됨

확장 설치 후 아래 주석 기호들이 색상으로 하이라이트됩니다:

| 주석 기호 | 색상 | 의미 |
|---|---|---|
| `// !` | 🔴 빨강 | API 키·외부 연동 필수 |
| `// *` | 🟢 초록 | 가격·수치 데이터 |
| `// ?` | 🔵 파랑 | 이미지 경로 |
| `// TODO:` | 🟡 주황 | 텍스트·주소·연락처 |
| 이모지 🟣 | 보라 | 외부 쇼핑몰 URL |

---

## 📋 수정 위치 체크리스트

### 🔴 1. API 키 및 외부 연동 (필수)

모두 `.env` 파일 하나에서 설정합니다. 프로젝트 루트에 `.env` 파일을 만들어 아래 값을 채우세요.

```env
# 카카오 로그인 API
VITE_KAKAO_APP_KEY=여기에_JavaScript_앱키_입력

# KAMIS 가락시장 시세 API (선택 — 실시간 시세 연동용)
VITE_KAMIS_PROXY_URL=https://your-domain.com/api/kamis
VITE_KAMIS_CERT_ID=발급받은_인증_ID
VITE_KAMIS_CERT_KEY=발급받은_인증_KEY
```

**관련 파일:**
- [.env.example](.env.example) — 참고용 샘플
- [src/lib/kakaoAuth.ts](src/lib/kakaoAuth.ts) — 카카오 SDK 래퍼
- [src/lib/kamisApi.ts](src/lib/kamisApi.ts) — KAMIS API 클라이언트

### 🔴 2. 관리자 비밀번호

[src/pages/admin/page.tsx:4](src/pages/admin/page.tsx) — `ADMIN_PASSWORD` 상수

```ts
// ! 🔴 EDIT:ADMIN_PW — 관리자 비밀번호 변경
const ADMIN_PASSWORD = 'hjangjae2027';
```

### 🟢 3. 제품 정보 (이커머스)

[src/data/products.ts](src/data/products.ts) — `PRODUCTS` 배열

각 제품마다 수정 가능한 필드:
- `name` — 제품명
- `price` / `originalPrice` — 판매가 / 할인 전 가격
- `unit` — 용량 (예: '200g', '500ml')
- `description`, `ingredients`, `features`, `howToUse` — 상세 정보
- `stock` — 재고 수량
- `externalLinks` — 네이버/쿠팡/11번가 URL (아래 🟣 항목 참조)

### 🟢 4. 농장 사실관계 (가장 먼저 보는 곳)

[src/data/farmStory.ts](src/data/farmStory.ts) — 농장의 모든 사실관계가 이 파일 한 곳에 있습니다.
화면에 새 문구를 쓰기 전에 여기부터 고치세요.

| 상수 | 담는 것 |
|---|---|
| `FARM_PROFILE` | 농장명 · 주소 · 면적 · 대표 · 연락처 |
| `FARM_STATS` | 홈 히어로 숫자 (정식 주수 · 베드 연장 · 재배동 수) |
| `WASABI` | 고추냉이 설비 · 환경 기준값 · 생육 단계 · 생산 계획 · 판로 |
| `CROP_HOUSES` | 재배동 1~8번 작물 배정 |
| `FIELD_CROPS` | 노지 과수 · 조경수 · 화훼 |
| `CARE_PROGRAMS` | 치유농업 프로그램 5종 |
| `CARE_EVIDENCE` | 농진청 실증 수치 (출처 포함) |
| `NO_FOOD_NOTICE` | 취식 불가 공지 문구 |

❗ **공간대여·데크 요금 항목은 없습니다.** 향재원은 농산물 생산 시설이라
숯불·불멍 같은 부가 상품이나 데크 요금 체계를 운영하지 않습니다.

### 🟢 5. 출하 단가와 사업 목표

**출하 단가** — [`/admin/products`](src/pages/admin/products.tsx) 화면에서 직접 수정 (localStorage 저장)
기본값은 `DEFAULT_OUTPUT_PRICES` 에 있습니다.
단가는 **품목별 출하 단위 기준**(100g · 1통 · 주 · 단)이라 kg 환산값이
시세 화면과 어긋나지 않는지 확인해야 합니다.

**출하 품목** — [src/data/products.ts](src/data/products.ts) 의 `FARM_OUTPUTS`
(재배동 8품목은 `CROP_HOUSES` 와 1:1로 맞춰야 합니다)

**사업 목표** — [src/pages/profit-analysis/page.tsx](src/pages/profit-analysis/page.tsx) "향재원 매출 목표" 섹션

### 🔵 6. 이미지 업로드

관리자 로그인(`/admin`) → 콘텐츠 관리 → 이미지 탭에서 올립니다.
**모든 슬롯은 화면에 실제로 반영되는 곳이 있습니다**(설명의 "→" 뒤가 반영 위치).

| 슬롯 | 반영 위치 |
|---|---|
| 홈 히어로 배경 | 홈 최상단 |
| 고추냉이 수경 온실 | `/wasabi` 히어로 |
| 유러피안 재배동 | `/houses` 히어로 |
| 노지 과수 · 조경수 | `/field` 히어로 |
| 치유농업 5종 | `/care-farming/:id` 각 프로그램 |
| 마스코트 마루 | 홈 마스코트 섹션 |
| 고추냉이 가공품 | 홈 제품 카드 |

**촬영 금지** — 텐트 내부 침구, 화로대·모닥불, 수영장, 차려진 상차림, 카페·휴게 공간
**촬영 권장** — 재배 베드, 작물, 온실 설비, 센서·제어반, 노지 조경수, 선별·포장 작업장

치유농업 사진은 **참여자 얼굴이 식별되지 않도록** 하고, 촬영·게시 동의를 받은 사진만 올리세요.
미업로드 상태에서는 벡터 도해·일러스트가 대신 표시되므로 빈 화면이 되지 않습니다.

### 🟡 7. 연락처 및 주소

**전화번호:** [src/data/farmStory.ts](src/data/farmStory.ts) 의 `FARM_PROFILE.phone`
(홈 푸터 · [/visit](src/pages/visit/page.tsx) · [/map](src/pages/map/page.tsx) · 치유농업 상세가 모두 이 값을 읽습니다)

**주소 / 좌표:**
- [src/pages/map/page.tsx:5-8](src/pages/map/page.tsx) — `ADDRESS`, `LAT`, `LNG`

```ts
// TODO: 🟡 EDIT:ADDRESS — 실제 주소 및 GPS 좌표
const ADDRESS = '서울특별시 서초구 양재동 178-4';
const LAT = 37.4690;
const LNG = 127.0499;
```

**사업자 정보:**
- [src/pages/login/page.tsx](src/pages/login/page.tsx) — 로고·슬로건
- `memory/project_business_plan.md` — 대표자·사업주체 정보

### 🟣 8. 외부 쇼핑몰 URL

[src/data/products.ts](src/data/products.ts) — 각 제품 `externalLinks` 필드

```ts
// 🟣 EDIT:EXT_SHOP — 입점 후 실제 상품 URL로 교체
externalLinks: {
  naver:   'https://smartstore.naver.com/your-store/products/xxxx',
  coupang: 'https://www.coupang.com/vp/products/xxxx',
  eleven:  'https://www.11st.co.kr/products/xxxx',
}
```

현재는 **검색 결과 URL** 로 연결되어 있습니다. 입점 후 실제 상품 URL 로 바꾸면 됩니다.

---

## 🔍 VS Code에서 빠르게 찾는 법

1. **전체 검색** (Ctrl+Shift+F)
2. 아래 키워드로 검색:
   - `EDIT:API` — API 키 관련 (빨강)
   - `EDIT:PRICE` — 가격 관련 (초록)
   - `EDIT:IMAGE` — 이미지 관련 (파랑)
   - `EDIT:TEXT` — 텍스트 관련 (주황)
   - `EDIT:EXT_SHOP` — 외부 쇼핑몰 (보라)

3. 또는 각 키워드 + `EDIT` 만 검색해도 모든 수정 지점이 나옵니다.

---

## 💡 참고

- 모든 값은 코드 수정 후 `npm run dev` 가 실행 중이면 **자동 새로고침** 됩니다
- `.env` 값만 수정하면 서버를 **재시작** 해야 반영됩니다
- 관리자 페이지에서 수정한 값은 **localStorage** 에 저장되므로 브라우저마다 다르게 보일 수 있습니다. 실제 배포 시에는 백엔드 DB 연동이 필요합니다.
