interface HydroponicBedArtProps {
  className?: string;
  title?: string;
}

/**
 * 고추냉이 3단 다단 수경 베드 단면도.
 *
 * 사진 대신 설비 구조를 그대로 그렸습니다 — 3단 베드, 순환 양액 배관,
 * 워터칠러, 차광·보광 설비, 센서 위치까지 실제 구성과 같은 순서로 배치했습니다.
 */
export default function HydroponicBedArt({ className = '', title }: HydroponicBedArtProps) {
  /** 베드 3단 — 위에서 아래로 */
  const tiers = [58, 108, 158];

  return (
    <svg
      viewBox="0 0 440 240"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="hb-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#92d891" />
          <stop offset="100%" stopColor="#2a802e" />
        </linearGradient>
        <linearGradient id="hb-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9cc9d1" />
          <stop offset="100%" stopColor="#3a6675" />
        </linearGradient>
        <linearGradient id="hb-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
      </defs>

      {/* 온실 외피 — 아치 */}
      <path d="M16 212 V96 C16 40 108 14 220 14 C332 14 424 40 424 96 V212"
            fill="none" stroke="#cbd5e1" strokeWidth="3" opacity=".8" />

      {/* 차광 스크린 — 2중 산광 + 알루미늄 75% */}
      <g opacity=".75">
        <path d="M30 70 H410" stroke="#d1d5db" strokeWidth="5" strokeLinecap="round" strokeDasharray="14 6" />
        <path d="M30 44 H410" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
      </g>
      <text x="36" y="36" fontSize="9" fontWeight="700" fill="#64748b">2중 산광 + 알루미늄 차광 75%</text>

      {/* 보광 LED */}
      {[110, 220, 330].map(x => (
        <g key={x}>
          <rect x={x - 22} y="76" width="44" height="7" rx="3.5" fill="#a855f7" opacity=".85" />
          {[-14, 0, 14].map(dx => (
            <path key={dx} d={`M${x + dx} 84 v9`} stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          ))}
        </g>
      ))}

      {/* 3단 베드 */}
      {tiers.map((y, tier) => (
        <g key={y}>
          {/* 베드 몸체 */}
          <rect x="54" y={y} width="300" height="26" rx="6" fill="url(#hb-frame)" />
          {/* 양액 */}
          <rect x="60" y={y + 9} width="288" height="14" rx="4" fill="url(#hb-water)" opacity=".85" />
          {/* 수면 하이라이트 */}
          <path d={`M62 ${y + 11} q18 -4 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0`}
                stroke="#e0f0f2" strokeWidth="2" fill="none" opacity=".7" />

          {/* 정식 포트 + 고추냉이 */}
          {[86, 134, 182, 230, 278, 326].map(x => (
            <g key={x}>
              <rect x={x - 11} y={y - 6} width="22" height="10" rx="5" fill="#f3f4f6" />
              {/* 잎 3장 */}
              <ellipse cx={x - 9} cy={y - 16} rx="11" ry="6" fill="url(#hb-leaf)" transform={`rotate(-24 ${x - 9} ${y - 16})`} />
              <ellipse cx={x + 9} cy={y - 18} rx="11" ry="6" fill="url(#hb-leaf)" transform={`rotate(24 ${x + 9} ${y - 18})`} />
              <ellipse cx={x} cy={y - 25} rx="10" ry="6" fill="#5dbe5f" />
              <path d={`M${x} ${y - 6} v-16`} stroke="#2a802e" strokeWidth="1.8" />
              {/* 뿌리 */}
              <path d={`M${x} ${y + 4} C${x - 4} ${y + 12} ${x + 4} ${y + 16} ${x - 1} ${y + 22}`}
                    stroke="#f2fbf2" strokeWidth="1.6" fill="none" opacity=".75" />
            </g>
          ))}

          {/* 단 라벨 */}
          <text x="40" y={y + 20} fontSize="10" fontWeight="800" fill="#2a802e" textAnchor="middle">
            {tier + 1}
          </text>
        </g>
      ))}

      {/* 순환 배관 — 오른쪽 상승관, 왼쪽 회수관 */}
      <path d="M354 171 H378 V58 H354" stroke="#5b96a4" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M54 71 H34 V184 H54" stroke="#5b96a4" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[96, 130, 164].map(y => (
        <path key={y} d={`M378 ${y} l-5 -6 l5 -6 l5 6 z`} fill="#5b96a4" opacity=".8" />
      ))}

      {/* 워터칠러 — 수온 13℃ */}
      <g>
        <rect x="300" y="186" width="92" height="40" rx="8" fill="#1f2937" />
        <rect x="308" y="194" width="46" height="18" rx="4" fill="#0a240d" />
        <text x="331" y="207" textAnchor="middle" fontSize="11" fontWeight="800" fill="#9cc9d1">13.0℃</text>
        <circle cx="372" cy="203" r="10" fill="none" stroke="#5b96a4" strokeWidth="3" />
        <path d="M372 196 v7 l5 4" stroke="#9cc9d1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="346" y="222" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#9ca3af">워터칠러 · 양액 순환</text>
      </g>

      {/* 센서 — EC / pH / DO */}
      <g>
        <rect x="48" y="196" width="112" height="32" rx="8" fill="#ffffff" opacity=".92" />
        {[
          { x: 72,  label: 'EC',  value: '1.2' },
          { x: 104, label: 'pH',  value: '6.4' },
          { x: 138, label: 'DO',  value: '8.1' },
        ].map(s => (
          <g key={s.label}>
            <text x={s.x} y="209" textAnchor="middle" fontSize="8" fontWeight="800" fill="#6b7280">{s.label}</text>
            <text x={s.x} y="221" textAnchor="middle" fontSize="10" fontWeight="800" fill="#2a802e">{s.value}</text>
          </g>
        ))}
      </g>

      {/* 총 연장 치수선 */}
      <g opacity=".7">
        <path d="M54 232 H354" stroke="#6b7280" strokeWidth="1.5" />
        <path d="M54 228 v8 M354 228 v8" stroke="#6b7280" strokeWidth="1.5" />
        <rect x="160" y="224" width="90" height="15" rx="4" fill="#f9fafb" />
        <text x="205" y="235" textAnchor="middle" fontSize="9" fontWeight="800" fill="#374151">총 연장 634.5m</text>
      </g>
    </svg>
  );
}
