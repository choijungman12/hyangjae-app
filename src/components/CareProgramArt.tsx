import type { CareProgram } from '@/data/farmStory';

interface CareProgramArtProps {
  kind: CareProgram['art'];
  className?: string;
  title?: string;
}

/**
 * 치유농업 프로그램 일러스트.
 *
 * 실제 프로그램 사진은 참여자 동의·초상권 문제가 있어, 관리자가 사진을 올리기 전까지는
 * 이 벡터 일러스트가 자리를 지킵니다. 사람 대신 **그 프로그램에서 실제로 쓰는 사물**
 * (화분·재배 베드·계측기·강판·바구니)을 그려 프로그램 내용을 바로 읽히게 했습니다.
 *
 * 관리자 화면(/admin/content)에서 `care-*` 슬롯에 사진을 올리면 자동으로 교체됩니다.
 */
export default function CareProgramArt({ kind, className = '', title }: CareProgramArtProps) {
  return (
    <svg
      viewBox="0 0 400 240"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`cpa-sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2fbf2" />
          <stop offset="100%" stopColor="#dff5de" />
        </linearGradient>
        <linearGradient id={`cpa-leaf-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#92d891" />
          <stop offset="100%" stopColor="#2a802e" />
        </linearGradient>
        <linearGradient id={`cpa-leaf2-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfeabe" />
          <stop offset="100%" stopColor="#3aa03d" />
        </linearGradient>
        <linearGradient id={`cpa-soil-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a67c52" />
          <stop offset="100%" stopColor="#6f4f32" />
        </linearGradient>
        <linearGradient id={`cpa-water-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9cc9d1" />
          <stop offset="100%" stopColor="#3a6675" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect width="400" height="240" fill={`url(#cpa-sky-${kind})`} />
      <circle cx="340" cy="46" r="26" fill="#fcd34d" opacity=".55" />
      <ellipse cx="60" cy="206" rx="120" ry="26" fill="#3aa03d" opacity=".10" />
      <ellipse cx="300" cy="212" rx="130" ry="24" fill="#3aa03d" opacity=".10" />

      {kind === 'worker'  && <WorkerScene k={kind} />}
      {kind === 'senior'  && <SeniorScene k={kind} />}
      {kind === 'kids'    && <KidsScene k={kind} />}
      {kind === 'family'  && <FamilyScene k={kind} />}
      {kind === 'public'  && <PublicScene k={kind} />}
    </svg>
  );
}

/* ── 1. 흙 만지는 주말 — 4회기 동안 자라는 바질 화분 4개 ── */
function WorkerScene({ k }: { k: string }) {
  /** 회차별 생육 높이 — 왼쪽에서 오른쪽으로 자랍니다 */
  const pots = [
    { x: 58,  grow: 0 },
    { x: 148, grow: 1 },
    { x: 238, grow: 2 },
    { x: 328, grow: 3 },
  ];

  return (
    <g>
      {/* 작업대 */}
      <rect x="20" y="176" width="360" height="12" rx="6" fill={`url(#cpa-soil-${k})`} opacity=".85" />

      {pots.map(({ x, grow }) => (
        <g key={x}>
          {/* 화분 */}
          <path d={`M${x - 26} 148 h52 l-6 28 h-40 z`} fill={`url(#cpa-soil-${k})`} />
          <rect x={x - 28} y="142" width="56" height="9" rx="4" fill="#d8bfa3" />

          {/* 줄기 */}
          {grow > 0 && (
            <path
              d={`M${x} 142 V${142 - grow * 22}`}
              stroke="#2a802e"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* 떡잎 — 0회차는 새싹만 */}
          {grow === 0 ? (
            <path d={`M${x} 142 c-9 -4 -13 -12 -5 -16 5 -2 9 3 5 16 z`} fill={`url(#cpa-leaf2-${k})`} />
          ) : (
            Array.from({ length: grow + 1 }).map((_, i) => {
              const ly = 138 - i * 20;
              const side = i % 2 === 0 ? 1 : -1;
              return (
                <g key={i}>
                  <ellipse
                    cx={x + side * 16}
                    cy={ly}
                    rx="16"
                    ry="9"
                    fill={`url(#cpa-leaf-${k})`}
                    transform={`rotate(${side * -18} ${x + side * 16} ${ly})`}
                  />
                  <ellipse
                    cx={x - side * 16}
                    cy={ly - 6}
                    rx="14"
                    ry="8"
                    fill={`url(#cpa-leaf2-${k})`}
                    transform={`rotate(${side * 18} ${x - side * 16} ${ly - 6})`}
                  />
                </g>
              );
            })
          )}

          {/* 회차 라벨 */}
          <circle cx={x} cy={196} r="12" fill="#ffffff" opacity=".85" />
          <text x={x} y={200} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2a802e">
            {grow + 1}
          </text>
        </g>
      ))}

      {/* 계측기 — 양액 EC·pH */}
      <rect x="22" y="36" width="64" height="40" rx="9" fill="#ffffff" opacity=".9" />
      <rect x="30" y="44" width="48" height="16" rx="4" fill="#1b421f" opacity=".85" />
      <text x="54" y="57" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92d891">EC 1.2</text>
      <circle cx="40" cy="68" r="4" fill="#3aa03d" />
      <circle cx="54" cy="68" r="4" fill="#d8bfa3" />
      <circle cx="68" cy="68" r="4" fill="#d8bfa3" />
    </g>
  );
}

/* ── 2. 손끝 텃밭 — 높낮이 조절 베드 · 케일 잎 · 고추냉이 잎 차 ── */
function SeniorScene({ k }: { k: string }) {
  return (
    <g>
      {/* 높낮이 조절 베드 — 앉아서도 닿는 높이 */}
      <rect x="40" y="120" width="220" height="30" rx="8" fill={`url(#cpa-soil-${k})`} />
      <rect x="40" y="114" width="220" height="12" rx="6" fill="#d8bfa3" />
      <rect x="62"  y="150" width="12" height="52" rx="5" fill="#6f4f32" />
      <rect x="226" y="150" width="12" height="52" rx="5" fill="#6f4f32" />
      {/* 높이 조절 눈금 */}
      {[160, 172, 184].map(y => (
        <rect key={y} x="58" y={y} width="20" height="3" rx="1.5" fill="#d8bfa3" opacity=".8" />
      ))}

      {/* 카볼로 네로 — 길쭉한 잎 다발 */}
      {[80, 118, 156, 194, 232].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} 118 C${x - 14} 96 ${x - 10} 66 ${x} 52 C${x + 10} 66 ${x + 14} 96 ${x} 118 z`}
            fill={i % 2 ? `url(#cpa-leaf-${k})` : `url(#cpa-leaf2-${k})`}
          />
          <path d={`M${x} 114 V58`} stroke="#1b421f" strokeWidth="1.6" opacity=".45" />
        </g>
      ))}

      {/* 고추냉이 잎 차 — 김이 오르는 찻잔 */}
      <g>
        <path d="M296 150 h58 l-7 34 h-44 z" fill="#ffffff" opacity=".95" />
        <path d="M354 156 c14 0 14 18 0 18" stroke="#ffffff" strokeWidth="6" fill="none" opacity=".95" />
        <path d="M303 156 h44 l-3 12 h-38 z" fill="#5dbe5f" opacity=".7" />
        {/* 김 */}
        {[310, 325, 340].map((x, i) => (
          <path
            key={x}
            d={`M${x} 140 c6 -8 -6 -14 0 -22 c5 -7 -4 -12 0 -18`}
            stroke="#3aa03d"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity={0.3 + i * 0.12}
          />
        ))}
      </g>

      {/* 포트 옮겨심기 — 작은 포트 2개 */}
      <g>
        <path d="M292 196 h34 l-4 18 h-26 z" fill={`url(#cpa-soil-${k})`} />
        <ellipse cx="309" cy="192" rx="13" ry="7" fill={`url(#cpa-leaf2-${k})`} />
        <path d="M336 200 h28 l-3 15 h-22 z" fill={`url(#cpa-soil-${k})`} />
        <ellipse cx="350" cy="197" rx="11" ry="6" fill={`url(#cpa-leaf-${k})`} />
      </g>
    </g>
  );
}

/* ── 3. 흙 없는 농장 교실 — 수경 베드 단면 · 뿌리 · 계측기 ── */
function KidsScene({ k }: { k: string }) {
  return (
    <g>
      {/* 수경 베드 단면 — 물에 잠긴 뿌리가 보입니다 */}
      <rect x="40" y="110" width="250" height="78" rx="12" fill="#ffffff" opacity=".55" />
      <rect x="48" y="134" width="234" height="48" rx="8" fill={`url(#cpa-water-${k})`} opacity=".75" />
      {/* 수면 */}
      <path d="M48 136 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0" stroke="#e0f0f2" strokeWidth="3" fill="none" opacity=".8" />

      {/* 정식 구멍 + 루꼴라 + 뿌리 */}
      {[90, 150, 210, 262].map((x, i) => (
        <g key={x}>
          <rect x={x - 16} y="104" width="32" height="12" rx="6" fill="#ffffff" opacity=".9" />
          {/* 잎 */}
          <ellipse cx={x - 12} cy="92" rx="15" ry="8" fill={`url(#cpa-leaf-${k})`} transform={`rotate(-22 ${x - 12} 92)`} />
          <ellipse cx={x + 12} cy="88" rx="15" ry="8" fill={`url(#cpa-leaf2-${k})`} transform={`rotate(22 ${x + 12} 88)`} />
          <ellipse cx={x} cy="78" rx="13" ry="8" fill={`url(#cpa-leaf-${k})`} />
          {/* 뿌리 — 물속으로 */}
          {[-7, 0, 7].map(dx => (
            <path
              key={dx}
              d={`M${x + dx} 116 C${x + dx - 6} 140 ${x + dx + 6} 152 ${x + dx - 2} 174`}
              stroke="#f2fbf2"
              strokeWidth="2"
              fill="none"
              opacity={0.55 + i * 0.05}
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}

      {/* 산소 기포 */}
      {[70, 120, 180, 240].map((x, i) => (
        <g key={x} opacity=".6">
          <circle cx={x} cy={166 - i * 4} r="3.5" fill="#e0f0f2" />
          <circle cx={x + 10} cy={152 - i * 3} r="2.5" fill="#e0f0f2" />
        </g>
      ))}

      {/* EC · pH 계측기 */}
      <g>
        <rect x="306" y="96" width="62" height="96" rx="12" fill="#1b421f" />
        <rect x="314" y="106" width="46" height="34" rx="6" fill="#0a240d" />
        <text x="337" y="121" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92d891">pH</text>
        <text x="337" y="134" textAnchor="middle" fontSize="12" fontWeight="700" fill="#bfeabe">6.4</text>
        {[150, 164, 178].map((y, i) => (
          <rect key={y} x="316" y={y} width="42" height="8" rx="4" fill={i === 0 ? '#3aa03d' : '#2a802e'} opacity={i === 0 ? 1 : 0.5} />
        ))}
        <rect x="332" y="190" width="10" height="26" rx="5" fill="#5b96a4" />
      </g>

      {/* 돋보기 — 뿌리 관찰 */}
      <g transform="translate(176 150) rotate(-18)">
        <circle cx="0" cy="0" r="24" fill="#ffffff" opacity=".35" stroke="#2a802e" strokeWidth="4" />
        <rect x="-4" y="22" width="8" height="26" rx="4" fill="#6f4f32" />
      </g>
    </g>
  );
}

/* ── 4. 마루의 하루 — 수확 바구니 · 강판에 가는 생고추냉이 ── */
function FamilyScene({ k }: { k: string }) {
  return (
    <g>
      {/* 수확 바구니 */}
      <g>
        <path d="M46 140 h132 l-16 60 h-100 z" fill="#d8bfa3" />
        <path d="M46 140 h132 l-3 11 h-126 z" fill="#a67c52" />
        {[74, 100, 126, 152].map(x => (
          <path key={x} d={`M${x} 151 l-5 49`} stroke="#a67c52" strokeWidth="3" opacity=".5" />
        ))}
        {/* 바구니 속 채소 */}
        <ellipse cx="80"  cy="134" rx="22" ry="15" fill={`url(#cpa-leaf-${k})`} />
        <ellipse cx="116" cy="128" rx="24" ry="16" fill={`url(#cpa-leaf2-${k})`} />
        <ellipse cx="150" cy="134" rx="20" ry="14" fill={`url(#cpa-leaf-${k})`} />
        {/* 비트 — 붉은 뿌리채소 */}
        <circle cx="134" cy="120" r="12" fill="#9d174d" />
        <path d="M134 108 c-4 -10 2 -14 6 -16 M134 108 c4 -9 -2 -13 -7 -15"
              stroke="#2a802e" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* 강판 + 생고추냉이 근경 */}
      <g>
        <rect x="224" y="150" width="112" height="46" rx="10" fill="#ffffff" opacity=".92" />
        {/* 강판 돌기 */}
        {[0, 1, 2, 3].map(r =>
          [0, 1, 2, 3, 4, 5, 6].map(c => (
            <circle key={`${r}-${c}`} cx={240 + c * 14} cy={161 + r * 10} r="2.2" fill="#9cc9d1" />
          )),
        )}
        {/* 근경 */}
        <path d="M268 146 c16 -2 26 6 26 16 0 12 -10 16 -24 14 -12 -2 -18 -8 -16 -17 2 -8 6 -12 14 -13 z"
              fill={`url(#cpa-leaf2-${k})`} />
        <path d="M262 152 h26 M264 160 h22" stroke="#2a802e" strokeWidth="1.8" opacity=".5" />
        {/* 잎 */}
        <ellipse cx="286" cy="132" rx="16" ry="10" fill={`url(#cpa-leaf-${k})`} transform="rotate(-24 286 132)" />
        <ellipse cx="306" cy="126" rx="14" ry="9" fill={`url(#cpa-leaf2-${k})`} transform="rotate(16 306 126)" />
        {/* 간 와사비 더미 */}
        <ellipse cx="318" cy="186" rx="16" ry="7" fill="#92d891" />
      </g>

      {/* 마루 — 고추냉이 잎을 쓴 작은 수호자 */}
      <g transform="translate(348 86)">
        <ellipse cx="0" cy="54" rx="22" ry="8" fill="#3aa03d" opacity=".15" />
        <rect x="-18" y="8" width="36" height="46" rx="17" fill="#5dbe5f" />
        <rect x="-15" y="26" width="30" height="26" rx="8" fill="#a67c52" />
        <circle cx="-7" cy="20" r="3.4" fill="#0a240d" />
        <circle cx="7"  cy="20" r="3.4" fill="#0a240d" />
        <path d="M-6 30 q6 5 12 0" stroke="#0a240d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="0" cy="4" rx="22" ry="6" fill="#d8bfa3" />
        <path d="M0 2 C-14 -10 -10 -26 0 -30 C10 -26 14 -10 0 2 z" fill={`url(#cpa-leaf-${k})`} />
      </g>
    </g>
  );
}

/* ── 5. 공익형 — 무장애 베드 · 나눔 ── */
function PublicScene({ k }: { k: string }) {
  return (
    <g>
      {/* 무장애 베드 — 휠체어가 들어갈 수 있도록 아래가 비어 있습니다 */}
      <rect x="54" y="118" width="196" height="26" rx="8" fill={`url(#cpa-soil-${k})`} />
      <rect x="54" y="112" width="196" height="12" rx="6" fill="#d8bfa3" />
      <rect x="64"  y="144" width="11" height="56" rx="5" fill="#6f4f32" />
      <rect x="229" y="144" width="11" height="56" rx="5" fill="#6f4f32" />

      {/* 베드 위 작물 */}
      {[86, 122, 158, 194, 226].map((x, i) => (
        <g key={x}>
          <ellipse cx={x - 9} cy="104" rx="14" ry="8" fill={`url(#cpa-leaf-${k})`} transform={`rotate(-20 ${x - 9} 104)`} />
          <ellipse cx={x + 9} cy="100" rx="14" ry="8" fill={`url(#cpa-leaf2-${k})`} transform={`rotate(20 ${x + 9} 100)`} />
          <ellipse cx={x} cy="90" rx="12" ry="7" fill={i % 2 ? `url(#cpa-leaf-${k})` : `url(#cpa-leaf2-${k})`} />
        </g>
      ))}

      {/* 휠체어 접근 표시 — 바퀴와 진입 화살표 */}
      <g opacity=".55">
        <circle cx="140" cy="182" r="26" fill="none" stroke="#3a6675" strokeWidth="4" />
        <circle cx="140" cy="182" r="7"  fill="#3a6675" />
        {[0, 45, 90, 135].map(a => (
          <path
            key={a}
            d="M140 160 V204"
            stroke="#3a6675"
            strokeWidth="2.5"
            transform={`rotate(${a} 140 182)`}
          />
        ))}
      </g>

      {/* 나눔 — 건네는 포트와 하트 */}
      <g>
        <path d="M288 160 h46 l-6 30 h-34 z" fill={`url(#cpa-soil-${k})`} />
        <rect x="285" y="153" width="52" height="10" rx="5" fill="#d8bfa3" />
        <ellipse cx="300" cy="144" rx="15" ry="9" fill={`url(#cpa-leaf-${k})`} transform="rotate(-22 300 144)" />
        <ellipse cx="322" cy="140" rx="15" ry="9" fill={`url(#cpa-leaf2-${k})`} transform="rotate(20 322 140)" />
        <ellipse cx="311" cy="130" rx="13" ry="8" fill={`url(#cpa-leaf-${k})`} />
        {/* 하트 */}
        <path
          d="M346 92 c0 -9 -13 -13 -17 -4 -4 -9 -17 -5 -17 4 0 11 17 20 17 20 s17 -9 17 -20 z"
          fill="#fb7185"
          opacity=".85"
        />
      </g>
    </g>
  );
}
