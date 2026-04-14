---
name: 향재원 프로젝트 문서 위치
description: 향재원 작업 시 참조할 핵심 문서 경로
type: reference
originSessionId: 826586c0-802c-49d9-b9db-62c013920e2e
---
작업 디렉토리: `c:\Users\USER\Desktop\hyangjae-app-backup-2026-04-12\`

- `CLAUDE.md` — 4파트 역할·사업 데이터·작업 흐름 (프로젝트 루트, 항상 자동 로드됨)
- `memory/specs/deposit-stamp-v1.md` — Sprint-02 예약금/스탬프 확정 스펙
- `memory/specs/farm-package-v1.md` — Sprint-03 텃밭수확/콜키지/파트너 확정 스펙
- `memory/handoff/README.md` — 독스 → 각 파트 작업 지시서 워크플로
- `memory/handoff/for-{booking,smartfarm,design}.md` — Sprint-01 핫픽스 지시서
- `memory/handoff/sprint-02-deposit-stamps/for-{booking,design}.md` — Sprint-02 지시서
- `memory/handoff/sprint-03-farm-package/for-{booking,design,smartfarm}.md` — Sprint-03 지시서
- `memory/project_business_plan.md` — 사업계획서(독스 유지보수)
- `privacy-policy.md`, `terms-of-service.md` — 개인정보처리방침/이용약관(독스 영역)

검증 명령:
- `npx tsc --noEmit --project tsconfig.app.json`
- `npm run dev`
- `grep -rn "2024\|2025" src/ --include="*.tsx"` (잔존 연도)
- `grep -rn "글램핑\|일본산" src/`
