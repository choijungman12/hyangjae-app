# 🎨 디자이너 역할 정의 (design/ui-refactor 브랜치)

## 당신의 역할: UI/UX 디자이너 + 프론트엔드 스타일링

당신은 **디자인 시스템, 공통 컴포넌트, 애니메이션, 이미지 자산**을 담당합니다.

---

## ✅ 담당 영역 (수정 가능)

- `src/components/` — BottomNav, PageHeader, Toast, CropImage 등
- `src/index.css` — 전역 CSS
- `tailwind.config.ts` — Tailwind 설정
- `public/facility-images/` — 시설 사진
- `public/guide-images/` — 가이드 이미지
- `src/lib/imageStore.ts` — 이미지 업로드 스토어
- 각 페이지의 **JSX 구조와 className 만** (로직 금지)

## 🚫 절대 수정 금지

- **모든 페이지의 로직** — `useState`, `useEffect`, 함수, 이벤트 핸들러
- `src/data/**` (데이터)
- `src/lib/cart.ts`, `iotClient.ts`, `kamisApi.ts`, `kakaoAuth.ts`, `qrScanner.ts`
- `src/router/config.tsx`
- `src/pages/admin/**` (PM)
- `src/pages/login/page.tsx`, `home/page.tsx` (PM 협의)
- **타입 정의, `.env`**

---

## 🎨 디자인 시스템

### 색상
- **메인**: emerald-400 ~ teal-500 (브랜드)
- **경고**: red-500 ~ orange-500
- **정보**: blue-400 ~ indigo-500
- **관리자**: gray-900 ~ gray-800
- **이커머스**: orange-500 ~ red-500

### 공통 스타일
- **카드**: `bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100`
- **버튼**: `hover:scale-105 active:scale-95 transition-all duration-300`
- **모바일 우선**
- **Safe-area**: `env(safe-area-inset-bottom)`

### 애니메이션
- `animate-pulse` — 알림·LIVE
- `animate-bounce` — 호응 (duration: 2~3s)
- `animate-fadeIn` — 모달
- `animate-slideUp` — 바텀시트

### 타이포그래피
- 제목 `font-black` / 본문 `font-bold` / 캡션 `text-xs font-medium`
- 최소 크기 `text-[10px]`

---

## 📋 우선 작업 (TODO)

1. 다크 모드 지원 (`dark:` variant)
2. 실제 글램핑/매점 사진 교체
3. 앱 아이콘 (512, 1024 PNG)
4. 스플래시 스크린
5. 접근성 (aria-label, focus, 대비)
6. 애니메이션 duration 일관성

---

## 🔄 작업 흐름

```bash
git fetch origin
git merge origin/main

git add src/components src/index.css
git commit -m "design: 다크모드 + 카드 그림자 개선"

git push origin design/ui-refactor
```

---

## ⚠️ 주의사항

1. **로직 금지** — `.tsx` 의 `useState`·함수 건들지 말고 `className`·JSX 구조·텍스트만
2. **Papago 호환** — `translate="no"` 속성 유지
3. **이미지 리사이즈**: `imageStore.ts` 로직 유지
4. **실제 디바이스 확인**
5. **브랜드 컬러**: 에메랄드-틸 계열 기본

---

**브랜치: design/ui-refactor**
**기준 날짜: 2026-04-10**
