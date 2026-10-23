# 🔄 프로젝트 맥락 — 새 세션용 핸드오프

> **이 파일과 `CLAUDE.md` 를 먼저 읽으세요.** 이전 세션에서 진행한 작업의 전체 맥락입니다.

## 📅 마지막 작업일: 2026-10-23

---

## 🚨 가장 중요한 변경 — 2026-10 전면 개편

향재원은 서초구청 3개 과(도시계획과·건축과·정원여가과)로부터 사전통지를 받은 상태입니다.
민원의 핵심은 **"밭에 글램핑(야영장) 시설을 설치했다"** 는 주장이며, 이는 사실과 다릅니다.
텐트형 재배동 8동은 동별로 유러피안 채소를 기르는 **재배동**입니다.

그런데 **사이트가 기존에는 "스마트팜 공간대여 서비스"로 만들어져 있었습니다** —
체험 데크 8개 예약, 불멍·숯불 옵션, 콜키지 프리, 글램핑 렌더링 이미지까지.
사이트가 민원 내용을 뒷받침하는 모양새였기 때문에, 전면 개편했습니다.

### 개편 전 → 후

| | 개편 전 | 개편 후 |
|---|---|---|
| 정체성 | 스마트팜 공간대여 서비스 | **유기농 고추냉이 수경재배 스마트팜 (농산물 생산 시설)** |
| 8개 동 | 체험 데크 (예약·대여) | **유러피안 채소 재배동 8동 (동별 1품목)** |
| 부가 상품 | 불멍 3만원 · 숯불 2만원 · 콜키지 프리 | **전부 삭제. 취식·화기 전면 불가 공지** |
| 노지 | — | **블루베리·에메랄드골드 / 블루엔젤·에메랄드그린·절화** |
| 치유농업 | — | **대상별 5개 프로그램 + 농진청 실증 근거 + 인증 로드맵** |
| 예약 | `/booking` 데크 예약·결제 | **`/visit` 방문 안내 (사전 협의)** — `/booking` 은 리다이렉트 |
| 관리자 | 예약 관리 · 데크 요금 | **문의·납품 관리 · 출하 단가** |
| 이미지 | 글램핑 조감도·수영장 렌더링 | **벡터 설비 도해 + 검수 후 업로드 교체** |
| 디자인 | 글래스모피즘 + emerald | **Spatial Green 3D 디자인 시스템 (wasabi 팔레트)** |

---

## 👤 사용자 프로필

- **이름**: 최정만 (토지소유자) · 이민경 (농업회사법인 향재원㈜ 대표)
- **역할**: 사업자 겸 기획자 (기술 배경 없음, 사업 판단 빠름)
- **선호**:
  - 최신 UI/UX 트렌드 · 3D 느낌
  - 한국어 대화 (존대어)
  - "진행해주세요" 스타일 — 결정 빠름, 실행 중시
  - **실제 동작 필수 · 더미 데이터 거부 · 실제 농업에 쓰이는 데이터 요구**

---

## ✅ 이번 개편에서 한 일

### 디자인 시스템
- `tailwind.config.ts` — wasabi/emeraldgreen/blueangel/soil 팔레트, 깊이 그림자 4단계, 3D 모션 11종
- `src/index.css` — 3레이어 구조(mesh-bg → glass → content), `.card-3d`, `.grain`, `.orb`, `.bento`
- `delay-step-1~8` 은 `@layer` 밖에 정의 (Tailwind 퍼지 회피)

### 데이터 레이어 (신규)
- `src/data/farmStory.ts` — 농장 사실관계 단일 원천
- `src/data/farmSensors.ts` — 구역·센서 규격·24시간 곡선·설비·알림 규칙·생육 현황

### 신규 페이지
- `/wasabi` · `/houses` · `/field` · `/care-farming` · `/care-farming/:id` · `/visit`
- `/admin/inquiries` (구 `/admin/bookings` 대체)

### 신규 컴포넌트
- `NoFoodNotice` · `WasabiMark` · `Tilt3D` · `HydroponicBedArt` ·
  `GreenhousePlanArt`(평면도/투시도) · `CareProgramArt` · `CareProgramImage`

### 삭제
- `src/pages/booking/` · `ColkijeFreeBanner` · `IncludedItemsList` ·
  `HarvestCalendar` · `DepositBreakdown` · `PartnerStoreCard` · `admin/bookings.tsx`
- `products.ts` 의 `ON_SITE_ITEMS`(숯·컵라면·주류) · `PARTNER_STORES`(정육점) ·
  `BOOKING_ADDONS` · `SEASONAL_HARVEST` → `FARM_OUTPUTS` 로 대체

### 실제 농업 데이터로 교체
- `smart-farm-data` — 토양수분 대신 **수온·EC·pH·용존산소·PPFD·VPD·유량**, 구역별 적정범위, 일중 곡선, 알림 규칙
- `facility-design` — 유형별 **예시 평면도·투시도** + 산출 제원(동 수·폭·길이·처마·용마루)
- `profit-analysis` — 고추냉이 근경(0.6회전)·잎(12회전) + 유러피안 8품목 + 비교 작목
- `price-trends` · `cropMarketInfo` — **특수채소** 카테고리 신설, 9개 품목 추가
- `admin/business` — 경쟁업체 비교 → **출하 채널 비교**, 노지 조경수 주당 단가 밴드 추가

### 이미지 격리
- `archive/non-agricultural-renders/` — 글램핑 조감도 2장 + 수영장 리조트 1장

---

## 🚧 남은 일

1. `public/facility-images/` 전수 검수 (56장 중 3장만 격리 완료)
2. IoT 게이트웨이 실연동 — 현재 `farmSensors.ts` 일중 곡선은 10월 서울 기준 모델링 값
3. KAMIS 프록시 서버 (Vercel Serverless)
4. Supabase 실연동 (문의·주문·출하 단가)
5. **운영 배포 전**: 인증 게이트 복구 + `ADMIN_PASSWORD` 교체
6. 치유농업 실사진 확보 (참여자 초상권 동의) → `/admin/content` 의 `care-*` 슬롯 업로드
7. `memory/claude-context/*.md` 의 개편 이전 메모 정리 (`feedback_no_glamping.md` 등은 여전히 유효)

---

## 💡 사용자 피드백 메모

- "최신 UI/UX 3D 트렌드로"
- "고추냉이를 집중적으로 홍보 — 양재동 서울 최초 고추냉이 스마트팜"
- "8개 텐트동은 공간대여 없음 — 다 지우고 특수작물(유러피안) 재배동으로"
- "노지에는 화훼 — 양재동 화훼단지에 최단거리로 납품"
- "숯불·도시락·음식 먹을 수 없다고 꼭 공지"
- "치유농업 인증 준비 중 — 각 세대에 맞는 치유농업 기술과 첨단 농업의 융합"
- "팜투테이블 및 음식 관련 내용은 다 삭제"
- "글램핑장 느낌이 전달되면 안 됨"
- "하우스 시공 부분에는 예시 평면도와 투시도도 함께 볼 수 있는 페이지로"
- "수익성 분석·시설설비·가락시장 시세·사업자 전용·스마트팜 온습도를 **실제 농업에 활용되는 데이터**로"

---

## 🔄 새 세션에서 이어갈 때

```bash
# 1. 컨텍스트 복원
cat CLAUDE.md
cat src/data/farmStory.ts        # 농장 사실관계
cat src/data/farmSensors.ts      # 계측 모델

# 2. 최근 작업 확인
git log --oneline -20

# 3. 실행
npm install && npm run dev       # http://localhost:3000

# 4. 금지어 체크
grep -rn "공간대여\|데크\|글램핑\|숯불\|불멍\|콜키지\|팜투테이블" src/
```

**GitHub**: https://github.com/choijungman12/hyangjae-app
**기술 스택**: React 19 + TypeScript 5.8 + Vite 7 + Tailwind CSS 3.4
