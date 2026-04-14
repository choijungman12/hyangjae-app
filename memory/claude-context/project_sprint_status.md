---
name: 향재원 스프린트 진행 상태
description: 2026-04-12 기준 Sprint-02/03 스펙 확정 및 파트별 작업 분담 현황
type: project
originSessionId: 826586c0-802c-49d9-b9db-62c013920e2e
---
**Why:** 독스 파트가 스펙 작성 + handoff 발행을 완료한 상태이며, 부킹·디자인·스마트팜 파트가 본인 브랜치에서 구현 중. 다음 대화에서 진행 상태 추적 필요.

**How to apply:** 사용자가 "어디까지 했지?", "이번 스프린트 뭐였더라" 물으면 이 메모와 `memory/specs/`·`memory/handoff/` 최신 상태를 같이 확인.

### Sprint-01 (2026-04-11 발행 핫픽스)
- BK-01/02: 예약 하드코딩 가격 불일치 (주말+6명+불멍 = 229,000원으로 수정)
- BK-03: admin/content.tsx 운영시간 표기 오류
- SF-01: facility-design TS2339 (recommended 필드 누락)
- SF-02: profit-analysis CROP_DB → cropDB
- SF-03: 2025 → 2026 잔존 표기
- SF-04: 작물 카피 "일본산" → "해외 수입품" 중립화
- DS-01: 지도 페이지 운영시간 오류
- DS-02: tailwind 커스텀 애니메이션(animate-bounce-in, animate-fadeIn) 미정의
- DS-03: i18n dead code

### Sprint-02 — 예약금 + 스탬프 (확정 2026-04-12)
- 스펙: `memory/specs/deposit-stamp-v1.md`
- 예약금 30%(반올림 100원) + 네이버페이 Mock UI, 미결제 10분 자동 취소
- 스탬프: 예약 1건당 1개, 10개 달성 시 향재원 고추냉이 선물 세트 쿠폰(6개월 유효)
- 적립 트리거: 이용일 경과 + status='done', 취소·노쇼 시 적립 안 됨
- 부킹 파트: stampStore.ts 신규, 결제 로직, 쿠폰 발급/사용
- 디자인 파트: 결제 단계 UI, 스탬프판, 달성 모달
- 스마트팜 파트: 해당 없음

### Sprint-03 — 텃밭 수확 + 콜키지 프리 + 파트너 (확정 2026-04-12)
- 스펙: `memory/specs/farm-package-v1.md`
- 데크별 텃밭 수확: 4인 300g 기본, 1명당 +75g, 가격 변경 없음(기본요금 포함)
- 시즌 로테이션: 12~5월 딸기+쌈채소 / 6~11월 쌈채소 집중
- 고추냉이 투어 약 20분, 가이드 전용·수확 불가, 웰컴 와사비 시식
- 콜키지 프리 — 외부 음식·주류 전면 자유, 예약 페이지 배너
- 향재원 자체 판매: 일회용 소모품·간편식·음료만 (고기·식재료 판매 금지)
- 파트너 제휴: 양재동 정육점·한식당 1~2곳 중개만 (결제 관여 X), Sprint-03 초기값은 "협의 중" placeholder
- 신규 데이터 상수: `onSiteItems`, `seasonalHarvest`, `partnerStores`
