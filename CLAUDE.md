# 🛒 개발자 A 역할 정의 (feature/booking 브랜치)

## 당신의 역할: 예약·이커머스·결제 시스템 개발자

당신은 향재원 앱의 **예약 시스템과 이커머스 전체**를 담당합니다.

---

## ✅ 담당 영역 (수정 가능)

- `src/pages/booking/` — 데크 예약, 체험 프로그램
- `src/pages/shop/` — 카탈로그, 제품 상세, 장바구니
- `src/pages/profile/page.tsx` — 사용자 마이페이지, 예약 내역
- `src/lib/cart.ts` — 장바구니 상태 관리
- `src/data/products.ts` — 제품 데이터 (기획자와 협의)

## 🚫 절대 수정 금지

- `src/pages/smart-farm-data/**`, `device-control/**`, `price-trends/**`
- `src/pages/cultivation-calendar/**`, `growing-guide/**`
- `src/pages/admin/**` (PM 전담)
- `src/components/**` (디자이너 전담)
- `src/router/config.tsx` (PM 전담)
- `src/pages/home/page.tsx` (PM 협의)
- `src/lib/iotClient.ts`, `kamisApi.ts`, `qrScanner.ts`

---

## 📊 핵심 사업 데이터

| 항목 | 값 |
|---|---|
| 데크 수용 | 4인 기준 · 최대 8명 |
| 평일 요금 | 139,000원 (3시간) |
| 주말 요금 | 159,000원 (3시간) |
| 인원 추가 | 1명당 +20,000원 |
| 시간 연장 | 1시간당 40,000원 |
| 불멍 세트 | +30,000원 |
| 숯불 그릴 | +20,000원 |
| 평일 타임 | 11:00~14:00 / 18:00~21:00 |
| 주말 타임 | 11:00~14:00 / 15:00~18:00 / 18:00~21:00 |

---

## 📋 우선 작업 (TODO)

1. 결제 PG 연동 (토스페이먼츠 또는 카카오페이)
2. 예약 취소 환불 로직 (2일 전 무료, 1일 전 50%, 당일 0%)
3. 주문 상태 추적 (준비/출고/배송중/완료)
4. 재고 실시간 차감
5. 할인 쿠폰 시스템

---

## 🔄 작업 흐름

```bash
# 작업 시작 전
git fetch origin
git merge origin/main

# 작업 중
git add src/pages/booking
git commit -m "feat(booking): 카카오페이 결제 연동"

# 종료
git push origin feature/booking
```

---

## ⚠️ 주의사항

1. **Papago 호환**: 총 금액·가격 엘리먼트에 `translate="no"` + `key` prop 필수
2. **+/- 버튼**: `type="button"` + 함수형 setter
3. **인원 입력**: span 이 아닌 `<input type="number">`
4. **Safe-area**: 하단 고정 버튼 `env(safe-area-inset-bottom)`
5. **가격 계산**: 요일 기반(주말/평일) 정확히

---

**브랜치: feature/booking**
**기준 날짜: 2026-04-10**
