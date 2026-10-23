interface WasabiMarkProps {
  className?: string;
  /** 잎 흔들림 애니메이션 */
  animated?: boolean;
  title?: string;
}

/**
 * 향재원 브랜드 마크 — 고추냉이 잎과 뿌리줄기(근경) 모티프.
 *
 * 사진에 의존하지 않는 벡터 심볼이라 어떤 배경 위에서도 선명하고,
 * 다크 모드에서도 색이 무너지지 않습니다.
 */
export default function WasabiMark({ className = 'w-8 h-8', animated = false, title }: WasabiMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} ${animated ? 'animate-leaf-sway' : ''}`}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="wm-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#92d891" />
          <stop offset="55%"  stopColor="#3aa03d" />
          <stop offset="100%" stopColor="#1f5023" />
        </linearGradient>
        <linearGradient id="wm-root" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#bfeabe" />
          <stop offset="100%" stopColor="#5dbe5f" />
        </linearGradient>
      </defs>

      {/* 뿌리줄기(근경) — 고추냉이의 상품 부위 */}
      <path
        d="M32 36c4.6 0 7.4 3 7.4 7.6 0 5.6-3 11.4-7.4 14.4-4.4-3-7.4-8.8-7.4-14.4 0-4.6 2.8-7.6 7.4-7.6Z"
        fill="url(#wm-root)"
      />
      <path d="M27.5 44.5h9M28.5 50h7" stroke="#2a802e" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />

      {/* 잎 3장 — 심장형 */}
      <path
        d="M32 34c-7.8-1.2-13-6.4-13-13.2C19 14.6 24.4 10 32 10s13 4.6 13 10.8C45 27.6 39.8 32.8 32 34Z"
        fill="url(#wm-leaf)"
      />
      <path
        d="M20.6 31.4c-4.8 2.4-9.6 1.4-12.2-2.2 3.2-3.6 8.4-4.4 12.8-1.8 1 .6 1.6 1.4 1.8 2.2-.6.8-1.4 1.4-2.4 1.8Z"
        fill="url(#wm-leaf)"
        opacity=".88"
      />
      <path
        d="M43.4 31.4c4.8 2.4 9.6 1.4 12.2-2.2-3.2-3.6-8.4-4.4-12.8-1.8-1 .6-1.6 1.4-1.8 2.2.6.8 1.4 1.4 2.4 1.8Z"
        fill="url(#wm-leaf)"
        opacity=".88"
      />

      {/* 잎맥 */}
      <path
        d="M32 12v22M32 20c-3.2-2-5.6-3-8.6-3.6M32 20c3.2-2 5.6-3 8.6-3.6M32 27c-3.4-1.8-6-2.6-9.4-3M32 27c3.4-1.8 6-2.6 9.4-3"
        stroke="#f2fbf2"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".7"
        fill="none"
      />
    </svg>
  );
}
