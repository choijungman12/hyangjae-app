# 🌿 향재원 (HYANGJAEWON)

> **국산 고추냉이 스마트팜 & 글램핑 복합 체험 공간**
> 서울특별시 서초구 양재동 178-4 · 약 536평 · 2027년 6월 오픈 예정

향재원은 국산 고추냉이를 재배하는 **스마트팜 150평**과 **8개 글램핑 데크**를 결합한 도심형 복합 체험 공간입니다. 이 저장소는 향재원 예약·쇼핑·체험을 위한 모바일 앱과 관리자 페이지 소스코드를 포함합니다.

---

## 📱 프로젝트 소개

- **운영사**: 팜스마트 (대표: 최정만)
- **연락처**: 010-4929-0070
- **주력 작물**: 고추냉이 (한국 국산)
- **시설**: 스마트팜 150평 + 8개 데크 (최대 8인 수용, 4인 기준)
- **오픈 예정**: 2027년 6월

### 주요 서비스
- 🏕 글램핑 데크 예약 (평일 2타임 / 주말 3타임)
- 🌱 고추냉이 수확·재배 체험
- 🛒 고추냉이 가공 제품 판매 (쌈장·소금·가루 등)
- 🧑‍🏫 영어 튜터 동반 체험 프로그램
- 🤖 AI 작물 진단 및 재배 컨설팅

---

## 🛠 기술 스택

| 분야 | 기술 |
|---|---|
| **Frontend** | React 19 · TypeScript 5.8 |
| **빌드 도구** | Vite 7 · SWC |
| **스타일링** | Tailwind CSS 3.4 |
| **라우팅** | React Router 7 |
| **상태·차트** | Recharts 3 · Lucide Icons |
| **다국어** | i18next · react-i18next |
| **인증·BaaS** | Firebase 12 · Supabase 2 |
| **결제** | Stripe (@stripe/react-stripe-js) |
| **품질 관리** | ESLint · TypeScript strict |

---

## 🚀 설치 및 실행

### 사전 요구사항
- **Node.js** 20 이상
- **npm** 10 이상 (또는 pnpm, yarn)

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd hyangjae-docs

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 Firebase, Supabase, Stripe 키를 입력합니다
```

### 실행

```bash
# 개발 서버 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트
npm run lint
```

---

## ✨ 주요 기능

향재원 앱은 총 **27개의 주요 페이지**로 구성되어 있으며, 크게 6개 영역으로 나뉩니다.

### 1️⃣ 예약 & 사용자
- **홈** (`/`) — 메인 대시보드, 오늘의 체험 추천
- **로그인** (`/login`) — 카카오 소셜 로그인
- **예약** (`/booking`) — 데크 선택·타임 선택·인원 입력·결제
- **프로필** (`/profile`) — 예약 내역, 주문 내역, 회원 정보
- **지도** (`/map`) — 시설 위치 및 주변 안내

### 2️⃣ 쇼핑 & 가이드
- **쇼핑몰** (`/shop`) — 고추냉이 제품 판매
- **이용 가이드** (`/guide`) — 시설 이용 방법
- **재배 가이드** (`/growing-guide`) — 작물별 재배 가이드 14종

### 3️⃣ 스마트팜 & 작물
- **스마트팜 데이터** (`/smart-farm-data`) — 온·습도·CO₂·양액 실시간 현황
- **기기 제어** (`/device-control`) — IoT 장비 원격 제어 (관리자 전용)
- **작물 인식** (`/crop-recognition`) — AI 이미지 기반 작물 진단
- **작물 상세** (`/crop-detail`) — 작물별 상세 정보
- **작물 데이터 상세** (`/crop-data-detail`) — 생육 데이터 분석

### 4️⃣ 영농 & 캘린더
- **재배 캘린더** (`/cultivation-calendar`) — 파종·수확 일정
- **농장 캘린더 메모** (`/farm-calendar-memo`) — 영농 일지
- **작업 캘린더** (`/task-calendar`) — 일별 작업 할당
- **작업 알림** (`/task-reminders`) — 리마인더 푸시 알림

### 5️⃣ 경영 & 분석
- **시세 트렌드** (`/price-trends`) — KAMIS 연동 작물 시세
- **수익 분석** (`/profit-analysis`) — 매출·수익률·BEP 분석
- **시설 설계** (`/facility-design`) — 스마트팜 레이아웃 시뮬레이터
- **AI 컨설턴트** (`/ai-consultant`) — AI 기반 영농 상담

### 6️⃣ 관리자
- **관리자 대시보드** (`/admin`) — 예약·매출·회원 통합 현황
- **예약 관리** (`/admin/bookings`) — 예약 승인·취소·변경

---

## 📁 폴더 구조

```
hyangjae-docs/
├── public/                 # 정적 에셋
├── src/
│   ├── components/         # 재사용 UI 컴포넌트
│   ├── data/               # 데이터 상수 (작물·제품·시세 등)
│   │   ├── crops.ts
│   │   ├── cropMarketInfo.ts
│   │   ├── cropGrowingGuide.ts
│   │   └── products.ts
│   ├── hooks/              # 커스텀 React 훅
│   ├── i18n/               # 다국어 번역 (ko, en)
│   ├── lib/                # 유틸리티·API 클라이언트
│   ├── pages/              # 페이지 컴포넌트 (27개)
│   │   ├── home/
│   │   ├── booking/
│   │   ├── shop/
│   │   ├── admin/
│   │   └── ...
│   ├── router/             # 라우팅 설정
│   ├── types/              # TypeScript 타입 정의
│   ├── App.tsx             # 앱 루트 컴포넌트
│   ├── main.tsx            # 엔트리 포인트
│   └── index.css           # Tailwind 글로벌 스타일
├── memory/                 # 사업계획서 & 메모리
├── CLAUDE.md               # 역할 정의 (기획/개발)
├── privacy-policy.md       # 개인정보 처리방침
├── terms-of-service.md     # 이용약관
├── .env.example            # 환경변수 템플릿
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🌏 배포 가이드

### 권장 배포 환경
- **호스팅**: Vercel · Netlify · Cloudflare Pages (정적 SPA)
- **Node.js 버전**: 20.x LTS

### 배포 단계

1. **환경변수 등록**
   호스팅 플랫폼의 환경변수 설정에 다음 키를 등록합니다.

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_STRIPE_PUBLISHABLE_KEY=...
   VITE_KAKAO_APP_KEY=...
   ```

2. **빌드 명령 설정**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **SPA 라우팅 폴백**
   React Router 사용으로 모든 경로를 `index.html`로 리다이렉트하도록 설정합니다.
   - Vercel: `vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
   - Netlify: `_redirects` → `/* /index.html 200`

4. **커스텀 도메인 연결**
   운영 도메인은 별도 안내.

---

## 💼 사업 개요

| 항목 | 내용 |
|---|---|
| **초기 투자** | 15억 원 |
| **연 예상 매출** | 4억 원 |
| **ROI** | 22% |
| **BEP** | 오픈 후 3개월 |

### 요금 정책 (4인 · 3시간 기준)
- 평일: **139,000원** / 주말: **159,000원**
- 인원 추가: 1명당 **+20,000원**
- 시간 연장: 1시간당 **+40,000원**
- 불멍 **+30,000원** / 숯불 **+20,000원**

### 체험 프로그램
- 와사비 수확 **25,000원** / 영어 튜터 **45,000원** / 스마트팜 투어 **15,000원**

---

## 📄 문서

- [CLAUDE.md](CLAUDE.md) — 기획/개발 역할 정의
- [EDIT_GUIDE.md](EDIT_GUIDE.md) — 편집 가이드
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — 프로젝트 진행 현황
- [privacy-policy.md](privacy-policy.md) — 개인정보 처리방침
- [terms-of-service.md](terms-of-service.md) — 이용약관

---

## 📞 문의

- **운영사**: 팜스마트
- **대표**: 최정만
- **전화**: 010-4929-0070
- **주소**: 서울특별시 서초구 양재동 178-4

---

© 2026 팜스마트 · 향재원(HYANGJAEWON). All rights reserved.
