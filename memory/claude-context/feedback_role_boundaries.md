---
name: 4파트 역할 경계 엄수
description: 향재원 4파트(독스/부킹/스마트팜/디자인)는 본인 담당 폴더 외 수정 절대 금지
type: feedback
originSessionId: 826586c0-802c-49d9-b9db-62c013920e2e
---
각 파트는 본인 담당 폴더만 수정. 타입·함수 시그니처·라우터·`.env`는 파트 불문 변경 금지(독스 제외 영역).

**Why:** 단일 저장소 다파트 협업에서 경계가 무너지면 머지 충돌과 책임 불분명이 발생. 독스가 메인 조율자로서 통합 검증 후 main 병합.

**How to apply:**
- **독스(`docs/review`)**: `*.md`, `memory/**`, `src/data/*.ts` 상수값만(interface/export 구조 유지), `.env.example`, `src/i18n/**`. `.tsx` 일체 금지.
- **부킹(`feature/booking`)**: `src/pages/booking|shop|profile/**`, `src/pages/admin/{bookings,content}.tsx`, `src/lib/cart.ts`, `src/data/products.ts`(독스와 협의). 스마트팜·디자인 영역 금지.
- **스마트팜(`feature/smartfarm`)**: `src/pages/{smart-farm-data,device-control,price-trends,cultivation-calendar,growing-guide,crop-*,facility-design,ai-consultant,task-*,farm-calendar-memo,guide,profit-analysis}/**`, `src/lib/{iotClient,kamisApi,qrScanner}.ts`. 부킹·디자인 영역 금지.
- **디자인(`design/ui-refactor`)**: `src/components/**`, `src/index.css`, `tailwind.config.ts`, 이미지 자산, `src/lib/imageStore.ts`, 페이지 JSX 구조·className만(로직·`useState`·핸들러 금지), `src/pages/map/**`. `.env`·`router/config.tsx`·`admin/**` 금지.
- 사용자가 "○○ 파트로서" 작업 지시할 때 해당 영역 외 파일은 절대 손대지 말 것. 경계 침범이 필요하면 사용자에게 사전 확인.
