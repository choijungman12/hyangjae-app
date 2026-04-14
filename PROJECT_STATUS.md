# 🌿 향재원 프로젝트 진행 상황판

> **이 문서는 병렬로 작업하는 모든 역할(PM · 개발자 A/B · 디자이너 · 기획자)이 공유하는 중앙 상태판입니다.**
> **작업 시작·종료 시 반드시 자신의 섹션을 업데이트해 주세요.**

**기준 날짜:** 2026-04-10
**현재 상태:** TypeScript 0 오류 · 모든 핵심 기능 완성
**활성 브랜치:** main, feature/booking, feature/smartfarm, design/ui-refactor, docs/review

---

## 👥 역할 분담

| 역할 | 브랜치 | 담당 폴더 | 금지 영역 |
|---|---|---|---|
| **PM (총괄)** | `main` | 모든 파일 (조율·리뷰·머지) | - |
| **개발자 A (예약·이커머스)** | `feature/booking` | `src/pages/booking/`, `src/pages/shop/`, `src/lib/cart.ts`, `src/pages/profile/` | 다른 페이지·관리자·디자인 시스템 |
| **개발자 B (스마트팜·IoT)** | `feature/smartfarm` | `src/pages/smart-farm-data/`, `src/pages/device-control/`, `src/pages/price-trends/`, `src/pages/cultivation-calendar/`, `src/pages/growing-guide/`, `src/lib/iotClient.ts`, `src/lib/kamisApi.ts`, `src/lib/qrScanner.ts` | 예약·쇼핑·관리자 |
| **디자이너 (UI/UX)** | `design/ui-refactor` | `src/components/`, `src/index.css`, `tailwind.config.js`, `public/facility-images/`, `src/lib/imageStore.ts` | 페이지 로직, 데이터 파일 |
| **기획자/QA** | `docs/review` | `src/data/*.ts`, `memory/`, `*.md`, `.env.example` | 모든 `.tsx`, `.ts` 로직 파일 |

---

## 🚦 현재 작업 현황

### PM (main)
- [완료] 전체 앱 TypeScript 0 오류 상태 유지
- [완료] 2024→2026 날짜 전수 수정
- [완료] 플랫폼 전체 검증 완료
- [대기] 각 브랜치 작업 완료 후 머지

### 개발자 A (feature/booking)
- [완료] 4인 기준 + 1명당 20,000원 추가 요금 체계
- [완료] 부가 옵션·연장 실시간 총액 반영 (Papago 호환)
- [완료] 이커머스 전체 (카탈로그·상세·카트·주문)
- [대기] 실제 결제 PG 연동 (토스페이먼츠 등)
- [대기] 주문 내역 백엔드 저장

### 개발자 B (feature/smartfarm)
- [완료] KAMIS API 클라이언트 + 목업 fallback
- [완료] 가격 동향 14종 작물 + 상세 페이지
- [완료] 재배 가이드 5종 (RDA 표준 기반)
- [완료] IoT 장비 제어 (QR 스캔 + HTTP REST + 목업)
- [대기] MQTT over WebSocket 실시간 구독
- [대기] KAMIS 프록시 서버 구축

### 디자이너 (design/ui-refactor)
- [완료] 글래스모피즘 + 그라디언트 디자인 시스템
- [완료] 스마트팜 경고 배너 (빨간색, 펄스 애니메이션)
- [완료] 관리자 이미지 업로드 기능
- [대기] 다크모드 지원
- [대기] 실제 글램핑/매점 사진 교체

### 기획자/QA (docs/review)
- [완료] 사업 데이터 일관성 검증 (2026 기준)
- [완료] 14종 작물 상세 메타데이터 작성
- [완료] EDIT_GUIDE.md (색상 주석 시스템)
- [대기] 개인정보 처리방침 초안
- [대기] 이용약관
- [대기] 앱스토어 심사용 문구

---

## 🔄 머지 대기 목록

> PM 이 이 목록을 보고 작업 완료된 브랜치를 `main` 으로 머지합니다.

- [ ] `feature/booking` → `main`
- [ ] `feature/smartfarm` → `main`
- [ ] `design/ui-refactor` → `main`
- [ ] `docs/review` → `main`

---

## ⚠️ 충돌 위험 영역

아래 파일은 여러 역할이 동시에 수정할 수 있어 충돌 위험이 높습니다. **반드시 PM 과 사전 협의** 후 수정:

- `src/router/config.tsx` — 라우트 추가 시
- `src/pages/home/page.tsx` — 홈 카드/섹션 추가 시
- `package.json` — 의존성 추가 시
- `src/components/BottomNav.tsx` — 하단 탭 변경 시
- `src/pages/profile/page.tsx` — 메뉴 항목 변경 시

---

## 📚 참고 문서

- [CLAUDE.md](CLAUDE.md) — PM 역할 정의 (루트)
- [EDIT_GUIDE.md](EDIT_GUIDE.md) — 수정 포인트 색상 가이드
- [memory/project_business_plan.md](memory/project_business_plan.md) — 사업계획서 핵심 데이터

---

## 📅 변경 로그

각 역할은 작업 완료 시 아래 형식으로 기록합니다:

```
YYYY-MM-DD [역할] - 작업 내용
```

### 2026-04-10
- [PM] 병렬 협업 구조 설정 · Git worktree 4개 생성
- [PM] PROJECT_STATUS.md 생성
- [PM] 역할별 CLAUDE.md 배치

<!-- 각 역할이 여기에 자기 로그를 추가하세요 -->
