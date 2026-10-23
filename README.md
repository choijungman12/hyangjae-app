# 🌿 향재원 (HYANGJAEWON)

> **서울 양재동 최초의 유기농 고추냉이 수경재배 스마트팜**
> 서울특별시 서초구 양재동 178-4 · 1,772㎡ · 농업회사법인 향재원 주식회사

10년 넘게 방치된 불법 폐기물 매립장을, 폐기물을 전량 반출하고
**흙 없이 농약 없이** 고추냉이를 기르는 스마트팜으로 되살린 농장입니다.
이 저장소는 향재원의 농장 소개 · 스마트팜 운영 · 치유농업 · 농산물 판매를 담당하는 **React 웹 앱**입니다.

---

## ⚠️ 서비스 정체성 — 가장 먼저 읽어 주세요

향재원은 **농산물 생산 시설**입니다. 이 전제와 어긋나는 화면 문구·이미지·데이터는 전부 **버그**로 간주합니다.

| | 운영함 | 운영하지 않음 |
|---|---|---|
| **시설** | 고추냉이 수경 온실 (3단 다단 베드 634.5m)<br />유러피안 채소 재배동 8동<br />노지 과수·조경수·화훼 | 공간대여 · 야영 · 숙박 · 글램핑 |
| **방문** | 사전 협의 후 납품 상담 · 영농 견학 | 취식 · 숯불 · 바비큐 · 도시락 · 음주 · 화기 사용 |
| **프로그램** | 치유농업 5종 (설계·인증 준비 중) | 체험 데크 예약 · 공간 대여 상품 |

### 금지어 (코드·카피 전역)

`공간대여` · `데크` · `글램핑` · `야영장` · `숯불` · `불멍` · `콜키지` · `팜투테이블` · `매점` · `시식` · `일본산 와사비`

새 문구를 쓰기 전에 **[src/data/farmStory.ts](src/data/farmStory.ts)** 를 먼저 읽으세요.
농장의 모든 사실관계가 이 파일 한 곳에 모여 있습니다.

### 이미지 규칙

**사용 금지** — 텐트 내부 침구·소파, 화로대·모닥불, 수영장, 차려진 상차림, 카페·휴게 공간, 캠핑 의자
**사용 가능** — 재배 베드, 작물, 온실 설비, 센서·제어반, 노지 조경수, 선별·포장 작업장

문제가 확인된 렌더링 3장은 [archive/non-agricultural-renders/](archive/non-agricultural-renders/) 로 격리했습니다.
**현재 앱은 시설 사진을 직접 참조하지 않습니다.** 설비 구조를 그린 벡터 도해를 쓰고,
검수된 실사진은 `/admin/content` 에서 업로드해 교체합니다.

---

## 🌱 무엇을 기르나

### 1. 고추냉이 — 유기농 수경재배

국내에서 가장 재배가 어렵다고 알려진 고부가 작물입니다.
**수온 13℃ 안팎 · pH 6~7 · 높은 용존산소 · 직사광선 차단**이 모두 맞아야 자라기 때문에,
환경을 제어하는 스마트팜이 아니면 서울에서는 재배 자체가 불가능합니다.

| 항목 | 내용 |
|---|---|
| **재배 시스템** | 3단 다단 베드 (총 연장 634.5m) · 양액 순환 · 워터칠러로 수온 제어 |
| **광 관리** | 2중 산광스크린 + 알루미늄 차광스크린(75%) + 보광 LED |
| **환경 제어** | IoT 센서 실시간 기록·원격 제어 (수온 · EC · pH · 용존산소 · 광량) |
| **병해충** | 흙이 없어 토양 병해충 원천 차단 · 방충망·물리적 차단으로 **무농약** 운영 |
| **양액** | 순환식 — 외부 배출 없음, 비료·물 사용 최소화 |
| **육묘** | 모주에서 런너 채취 → 삽목 6~8주 → 정식 |

**생산 계획** — 2026.11 1차 정식 10,000주 → 2027.3~ 잎·줄기 수확(정식 4개월) →
2028 상반기 근경 수확(정식 18개월) → 2029 하반기 20,000주 확장

**판로** — 서초·강남권 일식당 · 백화점 식품관 수확 당일 납품 ·
가공품(와사비 소금 / 줄기 장아찌 / 펌프형 농축액) 온라인 직판 · 재배 매뉴얼 공개(청년농 교육)

### 2. 유러피안 채소 재배동 8동

**8개 동은 전부 작물 재배동입니다.** 동마다 한 품목씩 배정해 **무농약·유기질 배지**(코코피트·펄라이트)로 기르고,
수확 주기가 짧은 작물부터 긴 작물까지 섞어 연중 출하가 끊기지 않게 짰습니다.

| 동 | 작물 | 파종→첫 수확 | 수확 방식 | 치유·교육 활용 |
|---|---|---|---|---|
| 1 | 루꼴라 (로켓) | 30~40일 | 잎 수확 · 연 6~8회전 | 어린이 한 달 재배 체험 |
| 2 | 바질 (제노베제) | 45~60일 | 순 따기 반복 | 직장인 향기·오감 치유 |
| 3 | 버터헤드 · 로메인 | 45~60일 | 포기 수확 · 연 5~6회전 | 주말 가족 수확 체험 |
| 4 | 라디키오 (트레비소) | 70~90일 | 포기 수확 | 색·쓴맛 비교 식생활 교육 |
| 5 | 카볼로 네로 | 60일부터 | 아래 잎부터 장기 수확 | 시니어 잎 따기·손 운동 |
| 6 | 스위스 차드 (근대) | 50~60일 | 잎 따기 반복 | 시니어·아동 색채 관찰 |
| 7 | 펜넬 | 80~100일 | 구근 수확 | 성장 과정 관찰 일기 |
| 8 | 비트 | 60~70일 | 잎 수시 · 뿌리 1회 | 천연 색소·요리 교육 |

2027년 **친환경(무농약) 인증**을 신청합니다.
수확물은 「마루의 신선 꾸러미」 정기 배송으로 서초구민에게 먼저 공급합니다.

### 3. 노지 — 과수 · 조경수 · 화훼

- **재배동 앞 노지(쇄석 제거 구역)** — 블루베리 · 에메랄드골드
- **잔여 노지** — 블루엔젤 · 에메랄드그린 · 절화 · 판매용 묘목

서울 최대 화훼 유통 거점인 **양재 화훼공판장이 같은 양재동 생활권**에 있어,
밭에서 잘라 바로 실어내는 거리에서 출하합니다.
운송 시간이 짧을수록 절화의 수명과 조경수의 활착률이 올라갑니다.

### 4. 치유농업 — 서초구민에게 돌아가는 것

재배 현장이 그대로 치유농업 공간이 됩니다. 효과는 **농촌진흥청이 이미 수치로 검증**해 두었습니다
(은퇴 노인 우울감 22.6%↓ · 코르티솔 30.4%↓, 부모 코르티솔 56.5%↓, 청소년 폭력성 4.3%↓ 등).

| 프로그램 | 대상 | 내용 |
|---|---|---|
| **흙 만지는 주말** | 직장인 (4회기) | 파종 → 관리 → 수확 → 출하까지 한 작물의 생애 |
| **손끝 텃밭** | 시니어 · 복지관 | 잎 따기 · 포트 옮겨심기 · 고추냉이 잎 덖기 |
| **흙 없는 농장 교실** | 초·중학생 · 늘봄학교 | 양액 측정 · 뿌리 관찰 · 30일 루꼴라 재배 일기 |
| **마루의 하루** | 가족 | 가족 수확 · 고추냉이 생육 관찰 |
| **공익형 치유 프로그램** | 복지·장애인기관 | 비영리 운영 · 치유농업사 진행 |

**제도** — 「치유농업 연구개발 및 육성에 관한 법률」(2021 시행)에 따른 치유농업시설 등록과
농촌진흥청 「우수 치유농업시설 인증」(2026년 첫 시행)을 단계적으로 추진하며, 운영자는 치유농업사 양성과정을 이수합니다.

> ⚠️ 프로그램은 **설계·준비 단계**입니다. 현재 판매·모집 중인 상품이 아니며, 화면에도 그렇게 표기해야 합니다.
> 프로그램 참가자도 농장 안에서는 취식할 수 없습니다 — 수확물은 포장해 가져가는 방식입니다.

---

## 🛠 기술 스택

| 분야 | 기술 |
|---|---|
| **Frontend** | React 19 · TypeScript 5.8 |
| **빌드** | Vite 7 · SWC |
| **스타일** | Tailwind CSS 3.4 (커스텀 디자인 시스템) |
| **라우팅** | React Router 7 (lazy 라우트) |
| **차트·아이콘** | Recharts 3 · Remix Icon |
| **다국어** | i18next · react-i18next |
| **인증·BaaS** | Firebase 12 · Supabase 2 |
| **결제** | Stripe · 네이버페이(Mock) |
| **품질** | ESLint · TypeScript strict |

---

## 🚀 설치 및 실행

```bash
git clone https://github.com/choijungman12/hyangjae-app.git
cd hyangjae-app

npm install
cp .env.example .env     # Firebase · Supabase · Stripe · Kakao 키 입력

npm run dev              # 개발 서버 http://localhost:3000
npm run build            # 프로덕션 빌드 → dist/
npm run preview          # 빌드 결과 미리보기
npm run type-check       # tsc --noEmit
npm run lint             # ESLint
```

요구 사항: **Node.js 20+** · **npm 10+**

---

## 🎨 디자인 시스템 — Spatial Green

2026 공간감(Spatial) 트렌드를 따르는 자체 디자인 시스템입니다.
정의 위치: [tailwind.config.ts](tailwind.config.ts) · [src/index.css](src/index.css)

### 설계 원칙

1. **깊이(Depth)** — 배경 메시 → 유리면 → 콘텐츠, 3개 레이어로 Z축을 만든다
2. **재질(Material)** — 반투명 유리 + 미세 노이즈 + 상단 하이라이트
3. **모션(Motion)** — 스프링 이징, 진입은 Z축에서 솟아오르게
4. **접근성** — `prefers-reduced-motion` 존중, 대비 4.5:1 이상

### 색 토큰

| 토큰 | 용도 |
|---|---|
| `wasabi-*` | 고추냉이 잎 — 브랜드 메인 (`wasabi-500` = `#3aa03d`) |
| `emeraldgreen-*` | 노지 에메랄드그린 — 보조 |
| `blueangel-*` | 노지 블루엔젤 — 은청 포인트 |
| `soil-*` | 치유농업 — 따뜻한 흙빛 |

### 핵심 클래스

| 클래스 | 역할 |
|---|---|
| `.mesh-bg` / `.mesh-bg-animated` | 오로라 메시 배경 (레이어 1) |
| `.glass` / `.glass-card` / `.glass-sheet` | 유리면 (레이어 2) |
| `.scene` + `.card-3d` | perspective 부모 + Z축 기울기 자식 |
| `.grain` | 미세 노이즈 (밴딩 제거) |
| `.orb` | 떠다니는 메시 오브 |
| `.text-gradient` | 흐르는 브랜드 그라디언트 텍스트 |
| `.eyebrow` / `.chip` / `.chip-warn` | 섹션 라벨 · 뱃지 |
| `.btn-primary` / `.btn-ghost` | 버튼 |
| `.bento` | 벤토 그리드 |
| `.snap-row` / `.snap-item` | 가로 스냅 캐러셀 |

### 애니메이션

`rise-3d`(Z축 진입) · `float-orb` · `aurora` · `gradient-pan` · `leaf-sway` ·
`glow-breathe` · `marquee` · `scan-line` · `alert-breathe` · `count-in` · `orbit`

> 스태거 지연 `delay-step-1` ~ `delay-step-8` 은 런타임에 조립해 쓰기 때문에
> Tailwind 퍼지 대상에서 빠지도록 `src/index.css` 의 `@layer` **바깥**에 정의되어 있습니다. 옮기지 마세요.

### 벡터 도해 컴포넌트

사진 대신 설비 구조를 직접 그려 쓰는 컴포넌트들입니다.

| 컴포넌트 | 그리는 것 |
|---|---|
| [WasabiMark](src/components/WasabiMark.tsx) | 고추냉이 잎·근경 브랜드 마크 |
| [HydroponicBedArt](src/components/HydroponicBedArt.tsx) | 3단 다단 수경 베드 단면도 (배관·칠러·센서 포함) |
| [GreenhousePlanArt](src/components/GreenhousePlanArt.tsx) | 온실 **평면도 / 투시도** — 면적에서 동 수·폭·길이 역산 |
| [CareProgramArt](src/components/CareProgramArt.tsx) | 치유농업 프로그램별 장면 일러스트 5종 |
| [Tilt3D](src/components/Tilt3D.tsx) | 포인터 추적 3D 기울기 래퍼 |

```tsx
import Tilt3D from '@/components/Tilt3D';

<Tilt3D className="rounded-4xl" max={7}>
  <article className="glass-card p-5">…</article>
</Tilt3D>
```

터치 기기와 `prefers-reduced-motion` 환경에서는 자동으로 정적 렌더링됩니다.

---

## 🗺 페이지 구조

### 농장 스토리 (공개)

| 경로 | 내용 |
|---|---|
| `/` | 홈 — 3D 히어로 · 취식 불가 공지 · 전 구역 요약 · 농장 연혁 · 마스코트 마루 |
| `/wasabi` | 고추냉이 — 재배 설비 단면도, 환경 기준값, 생육 단계, 생산 계획, 판로 |
| `/houses` | 재배동 8동 — 동별 작물 배정표, 배치도, 운영 원칙 |
| `/field` | 노지 — 블루베리·에메랄드골드·블루엔젤·에메랄드그린, 화훼단지 근접성 |
| `/care-farming` | 치유농업 허브 — 농진청 실증 근거, 프로그램 5종, 인증 로드맵 |
| `/care-farming/:programId` | 프로그램 상세 — 설계 의도, 회차별 커리큘럼, 치유 자원, 결합 기술, 근거 |
| `/visit` | **방문 안내 — 취식 불가 전문 고지 + 이용 수칙** |

### 스마트팜 · 작물 데이터

| 경로 | 내용 |
|---|---|
| `/smart-farm-data` | **구역별 환경 계측** — 수온·EC·pH·용존산소·PPFD·VPD, 일중 변화 그래프, 설비 제어, 알림 규칙 |
| `/facility-design` | **시설 견적 + 예시 평면도·투시도** — 유형별 단가, 보조금, 산출 제원 |
| `/profit-analysis` | 수익성 — 고추냉이 5개년 수지분석 + 유러피안 채소 작목별 ROI |
| `/price-trends` | 시세 — KAMIS 연동 + 특수채소 B2B 실거래 기준 |
| `/crop-recognition` · `/smart-camera` | AI 작물 인식 |
| `/device-control` | IoT 장비 QR·IP 연결 |
| `/cultivation-calendar` · `/task-calendar` · `/task-reminders` · `/farm-calendar-memo` | 영농 일정·일지 |
| `/growing-guide` · `/guide` | 재배 가이드 · 웹툰 |
| `/crop-detail` · `/crop-data-detail` | 작물 상세·생육 데이터 |
| `/ai-consultant` | AI 재배 상담 |

### 사용자 · 판매

`/login` · `/profile` 마이페이지(주문 내역 · 스탬프) · `/map` 오시는 길 · `/shop` · `/shop/detail` · `/shop/cart`

### 관리자

| 경로 | 내용 |
|---|---|
| `/admin` | 대시보드 — 최근 문의, 시설 KPI, 빠른 링크 |
| `/admin/inquiries` | 문의·납품 관리 (납품 상담 · 견학 · 치유농업 협력) |
| `/admin/products` | 출하 단가 · 가공품 판매가 |
| `/admin/content` | 콘텐츠·이미지 업로드 슬롯 |
| `/admin/business` | 사업자 대시보드 — 시세 밴드, 조경수 단가, 출하 채널, 재무 시뮬레이션 |
| `/admin/members` | 회원 관리 |

### 리다이렉트

`/booking` → `/visit` · `/admin/bookings` → `/admin/inquiries`
(구 공간대여 경로. 북마크·외부 링크 호환을 위해 유지합니다.)

---

## 📁 폴더 구조

```
hyangjae-app/
├── public/
│   ├── facility-images/      # 시설 사진 (앱이 직접 참조하지 않음 · 업로드 교체용)
│   ├── guide-images/ · webtoon/
├── archive/
│   └── non-agricultural-renders/   # 격리된 글램핑·리조트 이미지 (배포 제외)
├── src/
│   ├── components/
│   │   ├── NoFoodNotice.tsx      # 취식 불가 공지 (banner / full)
│   │   ├── WasabiMark.tsx        # 브랜드 마크 (SVG)
│   │   ├── HydroponicBedArt.tsx  # 수경 베드 단면도
│   │   ├── GreenhousePlanArt.tsx # 평면도 · 투시도
│   │   ├── CareProgramArt.tsx    # 치유농업 일러스트
│   │   ├── CareProgramImage.tsx  # 업로드 사진 ↔ 일러스트 전환
│   │   ├── Tilt3D.tsx            # 3D 기울기 래퍼
│   │   └── BottomNav · PageHeader · Toast · …
│   ├── data/
│   │   ├── farmStory.ts      # ★ 농장 사실관계 단일 원천
│   │   ├── farmSensors.ts    # ★ 센서 규격 · 구역 · 설비 · 일중 곡선 · 알림 규칙
│   │   ├── products.ts       # 가공품 + 농산물 출하 품목
│   │   ├── cropMarketInfo.ts # 작물별 시세 메타데이터 (특수채소 포함)
│   │   └── crops.ts · cropGrowingGuide.ts
│   ├── hooks/ · i18n/ · lib/ · router/ · types/
│   ├── pages/
│   │   ├── home/ wasabi/ houses/ field/ care-farming/ visit/
│   │   ├── admin/ shop/ profile/ …
│   ├── App.tsx · main.tsx · index.css
├── memory/                   # 사업 컨텍스트 · 스펙 · 작업 지시서
├── CLAUDE.md · EDIT_GUIDE.md
└── tailwind.config.ts · vite.config.ts
```

---

## 📊 데이터는 어디서 오나

| 화면 | 데이터 출처 | 실연동 상태 |
|---|---|---|
| 환경 계측 (`/smart-farm-data`) | `src/data/farmSensors.ts` 의 일중 곡선 (10월 서울 기준 모델링) | IoT 게이트웨이 연결 시 실측 스트림으로 대체 |
| 시세 (`/price-trends`) | KAMIS API + 실패 시 시드 기반 목업 (`src/lib/kamisApi.ts`) | KAMIS 프록시 구축 후 실시간화 |
| 특수채소 단가 | 레스토랑·호텔 B2B 실거래 기준 (KAMIS 미등재 품목) | — |
| 조경수 단가 | 주(株) 단위 · 규격별 밴드 (`/admin/business`) | 계약 체결 시 갱신 |
| 치유농업 효과 | 농촌진흥청 실증 결과 (출처 표기) | — |
| 출하 단가 | `/admin/products` 에서 수정 (localStorage) | Supabase 연동 예정 |

> 모델링 값은 화면에 **그 사실을 표기**합니다. 추정치를 실측처럼 보이게 하지 마세요.

---

## ✏️ 자주 고치는 곳

| 고칠 것 | 위치 |
|---|---|
| 농장 소개 문구 · 주소 · 연락처 | `src/data/farmStory.ts` → `FARM_PROFILE` |
| 취식 불가 공지 문구 | `src/data/farmStory.ts` → `NO_FOOD_NOTICE` |
| 고추냉이 설비·환경·생산계획 | `src/data/farmStory.ts` → `WASABI` |
| 재배동 8동 작물 배정 | `src/data/farmStory.ts` → `CROP_HOUSES` |
| 노지 품목 | `src/data/farmStory.ts` → `FIELD_CROPS` |
| 치유농업 프로그램 · 근거 · 인증 단계 | `src/data/farmStory.ts` → `CARE_PROGRAMS` · `CARE_EVIDENCE` · `CARE_CERT_ROADMAP` |
| 센서 적정 범위 · 알림 규칙 | `src/data/farmSensors.ts` → `SENSOR_SPECS` · `ALERT_RULES` |
| 작물 생육 현황 | `src/data/farmSensors.ts` → `CROP_STATUS` |
| 가공품 가격·재고 | `src/data/products.ts` → `PRODUCTS` |
| 출하 품목·채널 | `src/data/products.ts` → `FARM_OUTPUTS` |
| 출하 단가 | `/admin/products` 화면에서 수정 (localStorage) |
| 홈 히어로·구역 이미지·마스코트 | `/admin/content` 화면에서 업로드 |
| 치유농업 프로그램 사진 | `/admin/content` → `care-*` 슬롯 (올리면 일러스트가 사진으로 교체) |

자세한 내용은 [EDIT_GUIDE.md](EDIT_GUIDE.md) 를 보세요.

---

## 🌏 배포

**호스팅**: Vercel · Netlify · Cloudflare Pages · GitHub Pages (정적 SPA)

```
Build Command:     npm run build
Output Directory:  dist
Install Command:   npm ci
Node:              20.x LTS
```

**환경변수**

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_KAKAO_APP_KEY=...
```

**SPA 라우팅 폴백** — 모든 경로를 `index.html` 로 보내야 합니다.
Vercel 은 [vercel.json](vercel.json) 에 설정되어 있습니다.

**서브패스 배포** (GitHub Pages 등)

```bash
BASE_PATH=/hyangjae-app/ npm run build
```

---

## 📄 문서

- [CLAUDE.md](CLAUDE.md) — AI 에이전트 작업 가이드 · 역할 경계
- [EDIT_GUIDE.md](EDIT_GUIDE.md) — 운영자 수정 포인트
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — 세션 핸드오프 맥락
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — 진행 현황판
- [privacy-policy.md](privacy-policy.md) · [terms-of-service.md](terms-of-service.md)

---

## 📞 문의

- **운영**: 농업회사법인 향재원 주식회사 (대표 이민경)
- **전화**: 010-4929-0070
- **주소**: 서울특별시 서초구 양재동 178-4

> 향재원은 농산물 생산 시설입니다. 방문은 재배 일정에 따라 제한될 수 있어 **사전 협의**가 필요하며,
> 농장 내 **취식 · 화기 사용은 전면 불가**합니다.

---

© 2026 농업회사법인 향재원 주식회사. All rights reserved.
