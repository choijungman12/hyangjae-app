# 🌿 향재원(HYANGJAEWON) — 프로젝트 통합 가이드

> **🤖 Claude 부트스트랩 — 새 세션 첫 작업 (필독)**
>
> 이 프로젝트를 처음 보는 Claude 인스턴스라면, 사용자에게 답하기 전에 **반드시 다음 파일들을 모두 읽어라.** 이전 세션과 합의된 사용자 선호·금지 사항·진행 중인 스프린트 상태가 들어있다 — 이걸 읽지 않으면 같은 실수를 반복하게 된다.
>
> 1. `memory/claude-context/MEMORY.md` (인덱스)
> 2. `memory/claude-context/project_hyangjaewon.md` (프로젝트 개요)
> 3. `memory/claude-context/project_platform_overview.md` (4대 핵심기능·시장·비전 — 사업 자료 작성 시 필수)
> 4. `memory/claude-context/project_business_data.md` (사업 절대값)
> 5. `memory/claude-context/project_sprint_status.md` (스프린트 진행)
> 6. `memory/claude-context/feedback_no_glamping.md` (금기어)
> 7. `memory/claude-context/feedback_origin_korean.md` (원산지 규칙)
> 8. `memory/claude-context/feedback_role_boundaries.md` (4파트 역할 경계)
> 9. `memory/claude-context/reference_project_docs.md` (문서 위치)
> 10. `memory/specs/*.md` (확정 스펙)
> 11. `memory/handoff/**/*.md` (작업 지시서)
>
> 이 부트스트랩 영역은 컴퓨터에 무관하게 git 으로 동기화되므로, 어떤 머신에서 clone 받아도 동일한 컨텍스트를 즉시 복원할 수 있다.

---

**운용 방식**: 단일 저장소(main) 기반, 역할별 브랜치로 작업. **독스(기획자/QA) 가 메인 조율자**이며 나머지 3개 역할(부킹·스마트팜·디자인)은 독스의 지시서(`memory/handoff/*.md`)에 따라 본인 브랜치에서 작업 후 푸시합니다.

- **기준 날짜**: 2026-04-12
- **오픈 예정**: 2026년 9월
- **주 브랜치**: `main` (독스가 병합 책임)

---

## 🏢 핵심 사업 데이터 (절대 값 — 모든 역할 공통)

> **이 값과 불일치하는 모든 표기는 버그입니다.**

### 🎯 서비스 정체성 (절대 변경 금지)
- **향재원 = 스마트팜 공간대여 서비스** (Smart Farm Space Rental)
- ❌ 일반 글램핑/숙박 시설 아님
- ❌ "글램핑", "Glamping", "파머스 글램핑" 같은 표현 **사용 금지**
- ✅ 허용 표기: "스마트팜 공간대여", "스마트팜 체험 데크", "스마트팜 공간대여 데크"
- 본 서비스는 **농업 체험 공간대여**이며, 데크별 전용 텃밭에서 작물을 직접 수확할 수 있음

### 위치·사업자
- 서울특별시 서초구 양재동 178-4 (약 536평)
- 팜스마트 · 대표 최정만 · 010-4929-0070

### 시설
- **메인 하우스 스마트팜 150평** (고추냉이 전용, 가이드 투어만 가능)
- **스마트팜 체험 데크 8개** (각 데크별 전용 텃밭 포함, 최대 8인 수용, 4인 기준)
- 주력 작물: **고추냉이 (한국 국산)** — "일본산" 표기 금지
- 데크 텃밭 작물: 상추·로메인·깻잎·양상추·딸기 (시기별 로테이션)

### 요금 (4인·3시간 기준)
| 항목 | 값 |
|---|---|
| 평일 | **139,000원** |
| 주말 | **159,000원** |
| 인원 추가 | 1명당 **+20,000원** |
| 시간 연장 | 1시간당 **+40,000원** |
| 불멍 | **+30,000원** |
| 숯불 | **+20,000원** |

### 타임
- **평일**: 11:00~14:00 / 18:00~21:00 (2타임)
- **주말**: 11:00~14:00 / 15:00~18:00 / 18:00~21:00 (3타임)

### 체험 프로그램
- 와사비 수확 **25,000원** / 영어 튜터 **45,000원** / 스마트팜 투어 **15,000원**

### 재무
- 연 매출 4억 · ROI 22% · BEP 3개월 · 초기 투자 15억

---

## 👥 역할 정의 — 4개 파트 공존

각 역할은 **자기 브랜치**에서 작업하며, 본인 담당 영역 외 파일은 건드리지 않습니다. 경계가 겹치는 파일은 사전 협의 필요.

---

### 📋 1. 독스 (기획자/QA) — 메인 조율자

**브랜치**: `docs/review`

**수정 가능**:
- `*.md` — 프로젝트 문서 (README, privacy, terms 등)
- `memory/**` — 사업계획서·메모리·handoff 지시서
- `src/data/*.ts` — 데이터 파일 **상수값만** (interface/export 구조 유지)
- `.env.example` — 환경변수 예시 (실제 값 금지)
- `src/i18n/**` — 다국어 텍스트

**절대 금지**:
- 모든 `.tsx` 파일 (로직)
- `.ts` 함수·타입 정의 변경
- `src/components/**`, `lib/**`, `src/router/config.tsx`
- `package.json`, 실제 `.env`

**메인 조율자 권한**:
- 4개 브랜치 통합 관리 (`main` 병합 책임)
- 파트별 작업 지시서 발행 (`memory/handoff/for-*.md`)
- QA 검수 + 타입체크 통과 확인 후 병합
- CLAUDE.md 유지보수

**우선 작업 (TODO)**:
1. ✅ 개인정보 처리방침 (`privacy-policy.md`)
2. ✅ 이용약관 (`terms-of-service.md`)
3. ✅ README 재작성
4. KAMIS 2026년 상반기 시세 반영 (`src/data/cropMarketInfo.ts`)
5. 사업계획서 업데이트 (`memory/project_business_plan.md`)
6. 앱스토어 소개 문구 (한국어·영어)

---

### 🛒 2. 부킹 (개발자 A) — 예약·이커머스·결제

**브랜치**: `feature/booking`

**수정 가능**:
- `src/pages/booking/**` — 데크 예약, 체험 프로그램
- `src/pages/shop/**` — 카탈로그, 제품 상세, 장바구니
- `src/pages/profile/**` — 사용자 마이페이지, 예약 내역
- `src/pages/admin/bookings.tsx`, `admin/content.tsx` — 관리자 예약·콘텐츠
- `src/lib/cart.ts` — 장바구니 상태 관리
- `src/data/products.ts` — 제품 데이터 (독스와 협의)

**절대 금지**:
- `src/pages/smart-farm-data/**`, `device-control/**`, `price-trends/**`
- `src/pages/cultivation-calendar/**`, `growing-guide/**`, `crop-*/**`
- `src/components/**` (디자인 전담)
- `src/router/config.tsx` (독스 전담)
- `src/lib/iotClient.ts`, `kamisApi.ts`, `qrScanner.ts`

**우선 작업 (TODO)**:
1. **[Sprint-02] 예약금 30% + 네이버페이 Mock** (`memory/handoff/sprint-02-deposit-stamps/for-booking.md`)
2. **[Sprint-02] 스탬프 적립 + 고추냉이 선물 세트 쿠폰**
3. ✅ 예약 취소 환불 로직
4. 결제 PG 실 연동 (Sprint-03)
5. 주문 상태 추적 (준비/출고/배송중/완료)
6. 재고 실시간 차감

**주의사항**:
1. **Papago 호환**: 총 금액·가격 엘리먼트에 `translate="no"` + `key` prop 필수
2. **+/- 버튼**: `type="button"` + 함수형 setter
3. **인원 입력**: span이 아닌 `<input type="number">`
4. **Safe-area**: 하단 고정 버튼 `env(safe-area-inset-bottom)`
5. **가격 계산**: 요일 기반(주말/평일) 정확히 반영

---

### 🌱 3. 스마트팜 (개발자 B) — IoT·농업 데이터

**브랜치**: `feature/smartfarm`

**수정 가능**:
- `src/pages/smart-farm-data/**` — 실시간 센서 대시보드
- `src/pages/device-control/**` — QR 스캔 + IoT 연결
- `src/pages/price-trends/**` — KAMIS 가격 동향
- `src/pages/cultivation-calendar/**`, `growing-guide/**`
- `src/pages/crop-detail/**`, `crop-data-detail/**`, `crop-recognition/**`
- `src/pages/facility-design/**`, `ai-consultant/**`
- `src/pages/task-calendar/**`, `task-reminders/**`, `farm-calendar-memo/**`, `guide/**`
- `src/pages/profit-analysis/**`
- `src/lib/iotClient.ts`, `kamisApi.ts`, `qrScanner.ts`
- `src/data/crops.ts`, `cropMarketInfo.ts`, `cropGrowingGuide.ts` (독스와 협의)

**절대 금지**:
- `src/pages/booking/**`, `shop/**`, `profile/**`, `admin/**` (부킹 전담)
- `src/components/**` (디자인 전담)
- `src/lib/cart.ts`
- `src/router/config.tsx`

**핵심 데이터**:
- **주력 작물**: 고추냉이 (*Eutrema japonicum*) — **원산지 "한국 국산"**
- **스마트팜 환경**: 주간 15~18°C / 야간 10~13°C / 차광 50~60% / EC 1.0~1.5 / pH 6.0~6.5
- **재배 기간**: 정식 후 18~24개월
- **지원 작물 14종**: 상추·케일·시금치·깻잎·토마토·딸기·파프리카·오이·방울토마토·무·당근·고추냉이·바질·민트

**우선 작업 (TODO)**:
1. MQTT over WebSocket 실시간 구독
2. KAMIS 프록시 (Vercel Serverless Function)
3. ✅ 재배 가이드 14종 전체 확장 (완료)
4. 실제 IoT 기기 CORS 테스트
5. 환경 제어 자동화 룰

**주의사항**:
1. **원산지 "한국 국산"** — "일본 수입" 표기 금지
2. **API 키** — `.env` 로만, 하드코딩 금지
3. **CORS 에러** — 사용자에게 안내 메시지 필수
4. **Mock fallback** — API 실패 시 graceful fallback
5. **장비 보호 경고 배너** 유지

---

### 🎨 4. 디자인 (디자이너) — UI/UX·스타일링

**브랜치**: `design/ui-refactor`

**수정 가능**:
- `src/components/**` — BottomNav, PageHeader, Toast, CropImage, DarkModeToggle 등
- `src/index.css` — 전역 CSS
- `tailwind.config.ts` — Tailwind 설정
- `public/facility-images/`, `public/guide-images/` — 이미지 자산
- `src/lib/imageStore.ts` — 이미지 업로드
- 각 페이지의 **JSX 구조·className만** (로직 금지)
- `src/pages/map/**` — 지도 페이지

**절대 금지**:
- 모든 페이지의 **로직** — `useState`, `useEffect`, 함수, 이벤트 핸들러, 타입
- `src/data/**` (데이터)
- `src/lib/cart.ts`, `iotClient.ts`, `kamisApi.ts`, `kakaoAuth.ts`, `qrScanner.ts`
- `src/router/config.tsx`
- `src/pages/admin/**`
- `.env`

**디자인 시스템**:

| 범주 | 값 |
|---|---|
| **메인 색상** | emerald-400 ~ teal-500 (브랜드) |
| **경고** | red-500 ~ orange-500 |
| **정보** | blue-400 ~ indigo-500 |
| **관리자** | gray-900 ~ gray-800 |
| **이커머스** | orange-500 ~ red-500 |

- **카드**: `bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100`
- **버튼**: `hover:scale-105 active:scale-95 transition-all duration-300`
- **모바일 우선**, Safe-area 대응 (`env(safe-area-inset-bottom)`)

**애니메이션**:
- `animate-pulse` — 알림·LIVE
- `animate-bounce` — 호응 (duration 2~3s)
- `animate-fadeIn` — 모달
- `animate-slideUp` — 바텀시트
- `animate-bounce-in` — Toast (커스텀, tailwind.config에 정의됨)

**타이포그래피**:
- 제목 `font-black` / 본문 `font-bold` / 캡션 `text-xs font-medium`
- 최소 크기 `text-[10px]`

**우선 작업 (TODO)**:
1. ✅ 다크 모드 지원 (`dark:` variant)
2. 실제 스마트팜 시설/매점 사진 교체
3. 앱 아이콘 (512, 1024 PNG)
4. 스플래시 스크린
5. 접근성 (aria-label, focus, 대비)
6. 애니메이션 duration 일관성

---

## 🔄 공통 작업 흐름

```bash
# 작업 시작 전 — main 최신화
git fetch origin
git checkout <본인 브랜치>
git merge origin/main

# 작업 후
git add <본인 담당 파일>
git commit -m "<type>(<scope>): <내용>"
git push origin <본인 브랜치>

# 독스가 통합 브랜치에 병합 후 main 으로 fast-forward
```

---

## 🔒 역할 경계 공통 원칙

1. **본인 담당 폴더 외 수정 금지** — 경계 파일은 반드시 사전 협의
2. **타입·함수 시그니처 변경 금지** (부킹·스마트팜·디자인 모두, 독스는 `.tsx` 건들지 않음)
3. **사업 데이터 불일치 = 버그** — 위의 "핵심 사업 데이터" 참조
4. **원산지 "한국 국산"** — 모든 카피에서 일관 유지
5. **2026년 기준** — 2024/2025 잔존 표기는 버그

---

## 🔍 자주 쓰는 검증 명령

```bash
# 사업 데이터 정합성
grep -rn "2024\|2025" src/ --include="*.tsx"
grep -rn "49000\|89000" src/
grep -rn "일본.*원산\|원산.*일본" src/

# 타입 체크
npx tsc --noEmit --project tsconfig.app.json

# 개발 서버
npm run dev
```

---

**현재 브랜치**: `integration` → `main` 병합 대기
**기준 날짜**: 2026-04-12
