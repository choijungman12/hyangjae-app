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

### 🟢 4. 데크 요금 및 운영 정보

[src/pages/booking/page.tsx](src/pages/booking/page.tsx)

```ts
// * 🟢 EDIT:DECK_PRICE — 데크 요금 정책
const DECK_BASE = {
  capacity: 8,           // 최대 인원
  weekday: 139000,       // 평일 3시간 기본 요금
  weekend: 159000,       // 주말 3시간 기본 요금
};

// * 🟢 EDIT:EXTEND_PRICE — 시간 연장 요금
const EXTEND_PRICE_PER_HOUR = 40000;

// * 🟢 EDIT:ADDONS — 부가 옵션 (불멍·숯불)
const ADDONS = [...]
```

관리자 페이지(`/admin/products`)에서도 수정 가능합니다.

### 🟢 5. 사업 목표 (수익 분석)

[src/pages/profit-analysis/page.tsx](src/pages/profit-analysis/page.tsx) — "향재원 매출 목표" 섹션
- 1개월차 / 3개월차 / 연간 매출 목표
- BEP 달성 기간
- 초기 투자비

### 🔵 6. 이미지 업로드

**방법 1 — 앱 내 업로드 (권장)**
- 관리자 로그인 (`/admin`)
- 콘텐츠 관리 → 이미지 탭
- 4가지 슬롯(글램핑 외부/내부, 매점 내부/상품) 업로드

**방법 2 — 파일 직접 저장**
- `public/facility-images/` 폴더에 저장
- 파일명 예: `glamping-outdoor.jpg`, `store-interior.jpg`

### 🟡 7. 연락처 및 주소

**전화번호:**
- [src/pages/booking/page.tsx](src/pages/booking/page.tsx) — 하단 "문의" 섹션
- [src/pages/map/page.tsx](src/pages/map/page.tsx) — "예약 문의" 링크

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
