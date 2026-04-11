# 🌱 개발자 B 역할 정의 (feature/smartfarm 브랜치)

## 당신의 역할: 스마트팜·IoT·농업 데이터 개발자

당신은 향재원 앱의 **스마트팜 기능, IoT 장비 제어, 작물 재배 데이터**를 담당합니다.

---

## ✅ 담당 영역 (수정 가능)

- `src/pages/smart-farm-data/**` — 실시간 센서 대시보드
- `src/pages/device-control/**` — QR 스캔 + IoT 연결
- `src/pages/price-trends/**` — KAMIS 가격 동향
- `src/pages/cultivation-calendar/**` — 재배 달력
- `src/pages/growing-guide/**` — 작물 재배 가이드
- `src/pages/crop-detail/**`, `crop-data-detail/**`, `crop-recognition/**`
- `src/pages/facility-design/**`, `ai-consultant/**`
- `src/pages/task-calendar/**`, `task-reminders/**`, `farm-calendar-memo/**`, `guide/**`
- `src/lib/iotClient.ts`, `kamisApi.ts`, `qrScanner.ts`
- `src/data/crops.ts`, `cropMarketInfo.ts`, `cropGrowingGuide.ts` (기획자와 협의)

## 🚫 절대 수정 금지

- `src/pages/booking/**`, `shop/**`, `profile/**` (개발자 A)
- `src/pages/admin/**` (PM)
- `src/components/**` (디자이너)
- `src/lib/cart.ts` (개발자 A)
- `src/router/config.tsx` (PM)
- `src/pages/home/page.tsx` (PM 협의)

---

## 📊 핵심 데이터

- **주력 작물**: 고추냉이 (*Eutrema japonicum*) — **원산지 "한국 국산"**
- **스마트팜 환경**: 주간 15~18°C / 야간 10~13°C / 차광 50~60% / EC 1.0~1.5 / pH 6.0~6.5
- **재배 기간**: 정식 후 18~24개월
- **지원 작물 14종**: 상추·케일·시금치·깻잎·토마토·딸기·파프리카·오이·방울토마토·무·당근·고추냉이·바질·민트

---

## 📋 우선 작업 (TODO)

1. MQTT over WebSocket 실시간 구독
2. KAMIS 프록시 (Vercel Serverless Function)
3. 재배 가이드 14종 전체 확장 (현재 5종)
4. 실제 IoT 기기 CORS 테스트
5. 환경 제어 자동화 룰

---

## 🔄 작업 흐름

```bash
git fetch origin
git merge origin/main

git add src/pages/smart-farm-data src/lib/iotClient.ts
git commit -m "feat(iot): MQTT WebSocket 구독"

git push origin feature/smartfarm
```

---

## ⚠️ 주의사항

1. **원산지 "한국 국산"** — "일본 수입" 표기 금지
2. **API 키** — `.env` 로만, 하드코딩 금지
3. **CORS 에러** — 사용자에게 안내 메시지 필수
4. **Mock fallback** — API 실패 시 graceful fallback
5. **장비 보호 경고 배너** 유지

---

**브랜치: feature/smartfarm**
**기준 날짜: 2026-04-10**
