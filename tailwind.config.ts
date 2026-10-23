/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        /* ────────────────────────────────────────────────
         * 향재원 2026 디자인 토큰 — "Spatial Green"
         * 고추냉이(Wasabi) 그린을 중심축으로, 노지 화훼의
         * 블루엔젤(청록 실버)·에메랄드그린(상록)을 보조축으로 사용.
         * ──────────────────────────────────────────────── */
        colors: {
          wasabi: {
            50:  '#f2fbf2',
            100: '#dff5de',
            200: '#bfeabe',
            300: '#92d891',
            400: '#5dbe5f',
            500: '#3aa03d',   // 고추냉이 잎 — 브랜드 메인
            600: '#2a802e',
            700: '#236527',
            800: '#1f5023',
            900: '#1b421f',
            950: '#0a240d',
          },
          /* 노지 조경수 — 블루엔젤(은청)
           * ❗ 보조 팔레트도 50~950 전 단계를 채워 둡니다.
           *   Tailwind 는 정의되지 않은 단계(`from-blueangel-600` 등)를 만나면 유틸리티를
           *   아예 생성하지 않고, `from-*` 이 없으면 --tw-gradient-stops 가 비어
           *   bg-gradient-* 가 background-image: none 이 됩니다.
           *   즉 "색만 조금 다른" 수준이 아니라 그라디언트 배경이 통째로 사라져
           *   그 위의 흰 글자·아이콘이 보이지 않게 됩니다. 단계를 비워 두지 마세요. */
          blueangel: {
            50:  '#f1f8f9',
            100: '#e0f0f2',
            200: '#c3e0e5',
            300: '#9cc9d1',
            400: '#7ab0bb',
            500: '#5b96a4',
            600: '#4a7d8c',
            700: '#3a6675',
            800: '#2e5260',
            900: '#24414c',
            950: '#16282f',
          },
          /* 노지 조경수 — 에메랄드그린(서양측백) */
          emeraldgreen: {
            50:  '#f0faf4',
            100: '#e2f4ea',
            200: '#c5e7d4',
            300: '#95d4b0',
            400: '#66be93',
            500: '#3fa877',
            600: '#339063',
            700: '#27704f',
            800: '#1f5a40',
            900: '#1a4a36',
            950: '#0d2a1e',
          },
          /* 치유농업 — 따뜻한 흙빛 */
          soil: {
            50:  '#faf6f1',
            100: '#f4ede4',
            200: '#e8d8c5',
            300: '#d8bfa3',
            400: '#c09c74',
            500: '#a67c52',
            600: '#8a6542',
            700: '#6f4f32',
            800: '#5a4029',
            900: '#4a3522',
            950: '#291d12',
          },
        },
        fontFamily: {
          sans: ['Pretendard', 'Pretendard Variable', '-apple-system', 'BlinkMacSystemFont',
                 'system-ui', 'Segoe UI', 'Roboto', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
        },
        /* 공간감(Spatial) 그림자 — 레이어 깊이 4단계 */
        boxShadow: {
          'depth-1': '0 1px 2px rgba(10,36,13,.06), 0 2px 8px rgba(10,36,13,.05)',
          'depth-2': '0 2px 4px rgba(10,36,13,.06), 0 8px 24px rgba(10,36,13,.08)',
          'depth-3': '0 4px 8px rgba(10,36,13,.07), 0 18px 48px rgba(10,36,13,.12)',
          'depth-4': '0 8px 16px rgba(10,36,13,.08), 0 32px 80px rgba(10,36,13,.18)',
          'inner-top': 'inset 0 1px 0 rgba(255,255,255,.55)',
          /** 유리 카드 전용 — 상단 하이라이트 + 2단 깊이를 한 선언으로 (shadow 유틸은 중첩되지 않음) */
          'glass-card': 'inset 0 1px 0 rgba(255,255,255,.5), 0 2px 4px rgba(10,36,13,.06), 0 8px 24px rgba(10,36,13,.08)',
          'glow-wasabi': '0 0 0 1px rgba(58,160,61,.18), 0 12px 40px -8px rgba(58,160,61,.45)',
        },
        borderRadius: {
          '4xl': '2rem',
          '5xl': '2.75rem',
        },
        transitionTimingFunction: {
          spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
        keyframes: {
          'bounce-in': {
            '0%':   { opacity: '0', transform: 'translate(-50%, 20px) scale(0.85)' },
            '60%':  { opacity: '1', transform: 'translate(-50%, -6px) scale(1.04)' },
            '100%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
          },
          fadeIn: {
            '0%':   { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%':   { opacity: '0', transform: 'translateY(16px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'stamp-pop': {
            '0%':   { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
            '60%':  { transform: 'scale(1.2) rotate(5deg)',  opacity: '1' },
            '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
          },
          'harvest-glow': {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(58,160,61,0.45)' },
            '50%':      { boxShadow: '0 0 0 10px rgba(58,160,61,0)' },
          },
          'ken-burns': {
            '0%':   { transform: 'scale(1.08) translate(0, 0)' },
            '50%':  { transform: 'scale(1.18) translate(-1.5%, -1.5%)' },
            '100%': { transform: 'scale(1.08) translate(0, 0)' },
          },
          'slide-in-left': {
            '0%':   { opacity: '0', transform: 'translateX(-24px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          shimmer: {
            '0%':   { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(200%)' },
          },
          'pulse-ring': {
            '0%':   { transform: 'scale(0.9)', opacity: '0.8' },
            '100%': { transform: 'scale(1.8)', opacity: '0' },
          },

          /* ── 2026 3D / 공간감 모션 ── */
          /** 떠 있는 오브젝트 — 메시 그라디언트 오브 */
          'float-orb': {
            '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
            '33%':      { transform: 'translate3d(3%, -5%, 0) scale(1.06)' },
            '66%':      { transform: 'translate3d(-4%, 4%, 0) scale(0.96)' },
          },
          /** 오로라 메시 배경 색 이동 */
          'aurora': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%':      { backgroundPosition: '100% 50%' },
          },
          /** 그라디언트 텍스트 스윕 */
          'gradient-pan': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%':      { backgroundPosition: '100% 50%' },
          },
          /** 카드 등장 — Z축 깊이에서 솟아오름 */
          'rise-3d': {
            '0%':   { opacity: '0', transform: 'perspective(1200px) translate3d(0,28px,-80px) rotateX(10deg)' },
            '100%': { opacity: '1', transform: 'perspective(1200px) translate3d(0,0,0) rotateX(0deg)' },
          },
          /** 잎사귀 흔들림 — 마스코트/식물 아이콘 */
          'leaf-sway': {
            '0%, 100%': { transform: 'rotate(-3deg) translateY(0)' },
            '50%':      { transform: 'rotate(3deg) translateY(-4px)' },
          },
          /** 궤도 회전 — 데이터 링 */
          orbit: {
            '0%':   { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
          /** 숨쉬는 발광 — 치유농업 섹션 */
          'glow-breathe': {
            '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
            '50%':      { opacity: '0.7',  transform: 'scale(1.08)' },
          },
          /** 가로 흐름 — 납품 루트 마퀴 */
          marquee: {
            '0%':   { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
          /** 스캔 라인 — 스마트팜 센서 패널 */
          'scan-line': {
            '0%':   { transform: 'translateY(-100%)', opacity: '0' },
            '50%':  { opacity: '1' },
            '100%': { transform: 'translateY(400%)',  opacity: '0' },
          },
          /** 금지 안내 배너 — 부드러운 주의 환기 */
          'alert-breathe': {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,38,38,.28)' },
            '50%':      { boxShadow: '0 0 0 8px rgba(220,38,38,0)' },
          },
          /** 카운트업 숫자 등장 */
          'count-in': {
            '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.92)' },
            '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          },
        },
        animation: {
          'bounce-in':    'bounce-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fadeIn:         'fadeIn 0.3s ease-in',
          slideUp:        'slideUp 0.35s ease-out',
          'stamp-pop':    'stamp-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          'harvest-glow': 'harvest-glow 2.2s ease-in-out infinite',
          'ken-burns':    'ken-burns 12s ease-in-out infinite',
          'slide-in-left':'slide-in-left 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          shimmer:        'shimmer 2.5s linear infinite',
          'pulse-ring':   'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',

          /* 2026 3D */
          'float-orb':    'float-orb 18s ease-in-out infinite',
          aurora:         'aurora 16s ease-in-out infinite',
          'gradient-pan': 'gradient-pan 6s ease-in-out infinite',
          'rise-3d':      'rise-3d 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
          'leaf-sway':    'leaf-sway 4s ease-in-out infinite',
          orbit:          'orbit 24s linear infinite',
          'glow-breathe': 'glow-breathe 5s ease-in-out infinite',
          marquee:        'marquee 28s linear infinite',
          'scan-line':    'scan-line 3.2s ease-in-out infinite',
          'alert-breathe':'alert-breathe 2.6s ease-in-out infinite',
          'count-in':     'count-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        },
      },
    },
    plugins: [],
  }
