/**
 * 온실 예시 평면도 · 투시도
 *
 * 시설 유형과 입력 면적에 맞춰 동 수·폭·길이를 계산해 도면을 그립니다.
 * 실제 설계 도서가 아니라 **규모감을 잡기 위한 예시 도면**이며,
 * 시공 전에는 구조 계산과 인허가 도서가 따로 필요합니다.
 */

export type GreenhouseType = 'vinyl' | 'truss' | 'glass' | 'passive';

/** 유형별 구조 제원 — 연동 1동(bay)의 폭과 처마·용마루 높이(m) */
const SPEC: Record<GreenhouseType, {
  label: string;
  bayWidth: number;
  eaveH: number;
  ridgeH: number;
  /** 지붕 형상 */
  roof: 'arch' | 'gable' | 'venlo';
  /** 외피 색 */
  skin: string;
  skinOpacity: number;
  frame: string;
  note: string;
}> = {
  vinyl:   { label: '비닐하우스 연동',  bayWidth: 8.0, eaveH: 2.5, ridgeH: 5.0, roof: 'arch',  skin: '#bfdbfe', skinOpacity: 0.45, frame: '#94a3b8', note: '파이프 아치 · PE 피복' },
  truss:   { label: '트러스하우스',     bayWidth: 9.0, eaveH: 4.0, ridgeH: 6.8, roof: 'gable', skin: '#dbeafe', skinOpacity: 0.5,  frame: '#475569', note: 'H빔 트러스 · PC(렉산) 피복' },
  glass:   { label: '벤로형 유리온실',  bayWidth: 9.6, eaveH: 4.5, ridgeH: 6.2, roof: 'venlo', skin: '#cffafe', skinOpacity: 0.55, frame: '#64748b', note: '알루미늄 프레임 · 복층유리' },
  passive: { label: '패시브 온실',      bayWidth: 8.0, eaveH: 4.0, ridgeH: 6.5, roof: 'gable', skin: '#ede9fe', skinOpacity: 0.6,  frame: '#6d28d9', note: '고단열 외피 · 기밀 시공' },
};

export interface GreenhouseDims {
  bays: number;
  /** 전체 폭 (m) */
  width: number;
  /** 전체 길이 (m) */
  length: number;
  bayWidth: number;
  eaveH: number;
  ridgeH: number;
  /** 재배 베드 열 수 */
  bedRows: number;
}

/**
 * 면적에서 동 수·폭·길이를 역산합니다.
 * 길이/폭 비가 1.6 에 가까워지도록 동 수를 고릅니다.
 */
export function deriveDims(type: GreenhouseType, areaSqm: number): GreenhouseDims {
  const spec = SPEC[type];
  const area = Math.max(100, areaSqm);

  let best = { bays: 1, score: Number.POSITIVE_INFINITY };
  for (let bays = 1; bays <= 8; bays++) {
    const width = bays * spec.bayWidth;
    const length = area / width;
    const ratio = length / width;
    // 1.6 에 가까울수록 좋고, 길이가 너무 짧거나(<12m) 너무 길면(>120m) 감점
    const penalty = (length < 12 ? 3 : 0) + (length > 120 ? 3 : 0);
    const score = Math.abs(ratio - 1.6) + penalty;
    if (score < best.score) best = { bays, score };
  }

  const width = best.bays * spec.bayWidth;
  const length = area / width;
  // 베드는 동당 3열 (중앙 통로 1 + 측면 통로 2)
  const bedRows = best.bays * 3;

  return {
    bays: best.bays,
    width: Math.round(width * 10) / 10,
    length: Math.round(length * 10) / 10,
    bayWidth: spec.bayWidth,
    eaveH: spec.eaveH,
    ridgeH: spec.ridgeH,
    bedRows,
  };
}

/* ══════════════════════════════════════════════════════════
 * 평면도
 * ══════════════════════════════════════════════════════════ */

export function GreenhousePlan({ type, areaSqm, className = '' }: {
  type: GreenhouseType; areaSqm: number; className?: string;
}) {
  const spec = SPEC[type];
  const d = deriveDims(type, areaSqm);

  /* 도면 영역 — 치수선 여백을 뺀 안쪽에 평면을 맞춥니다 */
  const PAD_L = 54, PAD_T = 40, PAD_R = 22, PAD_B = 46;
  const VW = 440, VH = 300;
  const drawW = VW - PAD_L - PAD_R;
  const drawH = VH - PAD_T - PAD_B;
  const scale = Math.min(drawW / d.width, drawH / d.length);
  const w = d.width * scale;
  const h = d.length * scale;
  const x0 = PAD_L + (drawW - w) / 2;
  const y0 = PAD_T + (drawH - h) / 2;

  /** 기계실(양액·칠러) 깊이 — 길이의 12%, 최소 20px */
  const machineH = Math.max(20, h * 0.12);

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className={className} role="img"
         aria-label={`${spec.label} 예시 평면도 — 폭 ${d.width}m × 길이 ${d.length.toFixed(1)}m, ${d.bays}연동`}>
      <defs>
        <pattern id={`gp-bed-${type}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#dff5de" />
          <path d="M0 0 V6" stroke="#5dbe5f" strokeWidth="1.6" />
        </pattern>
      </defs>

      <rect width={VW} height={VH} fill="#ffffff" />

      {/* 도면 테두리 */}
      <rect x="8" y="8" width={VW - 16} height={VH - 16} fill="none" stroke="#e5e7eb" strokeWidth="1" />

      {/* 제목 블록 */}
      <text x="18" y="26" fontSize="11" fontWeight="800" fill="#374151">평면도 · PLAN</text>
      <text x={VW - 18} y="26" fontSize="9" fontWeight="700" fill="#9ca3af" textAnchor="end">
        {spec.label} · {d.bays}연동
      </text>

      {/* 온실 외곽 */}
      <rect x={x0} y={y0} width={w} height={h} fill="#f8fafc" stroke={spec.frame} strokeWidth="2.5" />

      {/* 동 경계선 (연동 사이 기둥 열) */}
      {Array.from({ length: d.bays - 1 }).map((_, i) => {
        const x = x0 + ((i + 1) * w) / d.bays;
        return <path key={i} d={`M${x} ${y0} V${y0 + h}`} stroke={spec.frame} strokeWidth="1.2" strokeDasharray="5 4" opacity=".7" />;
      })}

      {/* 기계실 — 양액 탱크 · 워터칠러 · 제어반 */}
      <rect x={x0} y={y0} width={w} height={machineH} fill="#e2e8f0" stroke={spec.frame} strokeWidth="1.2" />
      <text x={x0 + w / 2} y={y0 + machineH / 2 + 4} fontSize="9" fontWeight="800" fill="#475569" textAnchor="middle">
        기계실 · 양액탱크 / 칠러 / 제어반
      </text>

      {/* 재배 베드 열 — 동마다 3열, 사이에 작업 통로 */}
      {Array.from({ length: d.bays }).map((_, b) => {
        const bayX = x0 + (b * w) / d.bays;
        const bayW = w / d.bays;
        const rows = 3;
        const aisle = bayW * 0.1;
        const bedW = (bayW - aisle * (rows + 1)) / rows;
        const bedY = y0 + machineH + 8;
        const bedH = h - machineH - 30;
        return (
          <g key={`bay-${b}`}>
            {Array.from({ length: rows }).map((__, r) => (
              <rect
                key={r}
                x={bayX + aisle + r * (bedW + aisle)}
                y={bedY}
                width={bedW}
                height={bedH}
                fill={`url(#gp-bed-${type})`}
                stroke="#3aa03d"
                strokeWidth="1"
              />
            ))}
          </g>
        );
      })}

      {/* 출입구 — 남쪽 중앙 */}
      <g>
        <rect x={x0 + w / 2 - 14} y={y0 + h - 3} width="28" height="6" fill="#ffffff" stroke={spec.frame} strokeWidth="2" />
        <path d={`M${x0 + w / 2} ${y0 + h + 10} v12`} stroke="#3aa03d" strokeWidth="2" markerEnd="" />
        <path d={`M${x0 + w / 2 - 5} ${y0 + h + 16} l5 -6 l5 6`} fill="none" stroke="#3aa03d" strokeWidth="2" />
        <text x={x0 + w / 2 + 12} y={y0 + h + 22} fontSize="8.5" fontWeight="700" fill="#3aa03d">출입구</text>
      </g>

      {/* 치수선 — 폭 (상단) */}
      <g stroke="#6b7280" strokeWidth="1">
        <path d={`M${x0} ${y0 - 16} H${x0 + w}`} />
        <path d={`M${x0} ${y0 - 21} v10 M${x0 + w} ${y0 - 21} v10`} />
      </g>
      <rect x={x0 + w / 2 - 34} y={y0 - 26} width="68" height="15" fill="#ffffff" />
      <text x={x0 + w / 2} y={y0 - 15} fontSize="9.5" fontWeight="800" fill="#374151" textAnchor="middle">
        W {d.width}m
      </text>

      {/* 치수선 — 길이 (좌측) */}
      <g stroke="#6b7280" strokeWidth="1">
        <path d={`M${x0 - 18} ${y0} V${y0 + h}`} />
        <path d={`M${x0 - 23} ${y0} h10 M${x0 - 23} ${y0 + h} h10`} />
      </g>
      <g transform={`translate(${x0 - 30} ${y0 + h / 2})`}>
        <rect x="-36" y="-8" width="72" height="16" fill="#ffffff" transform="rotate(-90)" />
        <text transform="rotate(-90)" fontSize="9.5" fontWeight="800" fill="#374151" textAnchor="middle" dy="3">
          L {d.length.toFixed(1)}m
        </text>
      </g>

      {/* 방위 */}
      <g transform={`translate(${VW - 40} ${VH - 44})`}>
        <circle r="15" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M0 -13 L4 2 L0 -1 L-4 2 Z" fill="#ef4444" />
        <text y="-17" fontSize="8" fontWeight="800" fill="#6b7280" textAnchor="middle">N</text>
      </g>

      {/* 범례 */}
      <g transform={`translate(18 ${VH - 50})`}>
        <rect width="14" height="10" fill={`url(#gp-bed-${type})`} stroke="#3aa03d" strokeWidth="1" />
        <text x="19" y="9" fontSize="8.5" fontWeight="700" fill="#6b7280">재배 베드</text>
        <rect y="15" width="14" height="10" fill="#e2e8f0" stroke={spec.frame} strokeWidth="1" />
        <text x="19" y="24" fontSize="8.5" fontWeight="700" fill="#6b7280">기계실</text>
      </g>

      {/* 축척 바 — 5m */}
      <g transform={`translate(${VW / 2 - 40} ${VH - 24})`}>
        <path d={`M0 0 H${5 * scale}`} stroke="#374151" strokeWidth="2" />
        <path d={`M0 -4 v8 M${5 * scale} -4 v8`} stroke="#374151" strokeWidth="2" />
        <text x={(5 * scale) / 2} y="-7" fontSize="8" fontWeight="700" fill="#6b7280" textAnchor="middle">5m</text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
 * 투시도
 * ══════════════════════════════════════════════════════════ */

export function GreenhousePerspective({ type, areaSqm, className = '' }: {
  type: GreenhouseType; areaSqm: number; className?: string;
}) {
  const spec = SPEC[type];
  const d = deriveDims(type, areaSqm);

  const VW = 440, VH = 300;

  /* 정면(좌) 기준점과 안쪽(우)으로 들어가는 소실 방향 */
  const fx = 86;          // 정면 좌측 x
  const baseY = 232;      // 지면 라인
  const pxPerM = Math.min(13, 230 / d.width);   // 정면 폭 스케일
  const faceW = d.width * pxPerM;
  const eave = d.eaveH * pxPerM * 1.05;
  const ridge = d.ridgeH * pxPerM * 1.05;

  /* 안쪽으로 가는 깊이 — 길이에 따라 줄어듭니다 */
  const depthX = 118;
  const depthY = -58;

  const bx = fx + faceW;              // 정면 우측
  const rx = bx + depthX;             // 안쪽 우측
  const ry = baseY + depthY;

  /** 지붕 윗선 — 유형별 */
  function roofPath(x: number, y: number, width: number): string {
    const bays = d.bays;
    const bw = width / bays;
    let p = `M${x} ${y - eave}`;
    for (let i = 0; i < bays; i++) {
      const sx = x + i * bw;
      if (spec.roof === 'arch') {
        p += ` Q${sx + bw / 2} ${y - ridge - 6} ${sx + bw} ${y - eave}`;
      } else if (spec.roof === 'venlo') {
        // 벤로형 — 한 동에 작은 쌍지붕 2개
        p += ` L${sx + bw * 0.25} ${y - ridge} L${sx + bw * 0.5} ${y - eave}`;
        p += ` L${sx + bw * 0.75} ${y - ridge} L${sx + bw} ${y - eave}`;
      } else {
        p += ` L${sx + bw / 2} ${y - ridge} L${sx + bw} ${y - eave}`;
      }
    }
    return p;
  }

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className={className} role="img"
         aria-label={`${spec.label} 예시 투시도 — 처마높이 ${d.eaveH}m, 용마루 ${d.ridgeH}m`}>
      <defs>
        <linearGradient id={`gper-sky-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#ecfdf5" />
        </linearGradient>
        <linearGradient id={`gper-side-${type}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={spec.skin} stopOpacity={spec.skinOpacity + 0.15} />
          <stop offset="100%" stopColor={spec.skin} stopOpacity={spec.skinOpacity - 0.1} />
        </linearGradient>
      </defs>

      <rect width={VW} height={VH} fill={`url(#gper-sky-${type})`} />
      <rect x="8" y="8" width={VW - 16} height={VH - 16} fill="none" stroke="#e5e7eb" strokeWidth="1" />

      <text x="18" y="26" fontSize="11" fontWeight="800" fill="#374151">투시도 · PERSPECTIVE</text>
      <text x={VW - 18} y="26" fontSize="9" fontWeight="700" fill="#9ca3af" textAnchor="end">
        {spec.note}
      </text>

      {/* 지면 */}
      <path d={`M20 ${baseY} H${VW - 20} L${rx} ${ry} H${fx + depthX} Z`} fill="#dcfce7" opacity=".55" />
      <path d={`M20 ${baseY} H${VW - 20}`} stroke="#86efac" strokeWidth="2" />

      {/* 측면(안쪽으로 들어가는 면) */}
      <path
        d={`M${bx} ${baseY} L${rx} ${ry} L${rx} ${ry - eave} L${bx} ${baseY - eave} Z`}
        fill={`url(#gper-side-${type})`}
        stroke={spec.frame}
        strokeWidth="1.8"
      />
      {/* 측면 기둥 */}
      {[0.25, 0.5, 0.75].map(t => {
        const px = bx + (rx - bx) * t;
        const py = baseY + (ry - baseY) * t;
        return <path key={t} d={`M${px} ${py} V${py - eave}`} stroke={spec.frame} strokeWidth="1.2" opacity=".65" />;
      })}

      {/* 안쪽 지붕면 */}
      <path
        d={`M${bx} ${baseY - eave} L${rx} ${ry - eave} L${rx} ${ry - ridge} L${bx} ${baseY - ridge} Z`}
        fill={spec.skin}
        fillOpacity={spec.skinOpacity * 0.6}
        stroke={spec.frame}
        strokeWidth="1.2"
      />

      {/* 정면 벽 */}
      <path
        d={`M${fx} ${baseY} H${bx} V${baseY - eave} H${fx} Z`}
        fill={spec.skin}
        fillOpacity={spec.skinOpacity}
        stroke={spec.frame}
        strokeWidth="2"
      />

      {/* 정면 지붕 */}
      <path
        d={`${roofPath(fx, baseY, faceW)} L${bx} ${baseY - eave} H${fx} Z`}
        fill={spec.skin}
        fillOpacity={spec.skinOpacity + 0.12}
        stroke={spec.frame}
        strokeWidth="2"
      />

      {/* 동 경계 기둥 (정면) */}
      {Array.from({ length: d.bays + 1 }).map((_, i) => {
        const x = fx + (i * faceW) / d.bays;
        return <path key={i} d={`M${x} ${baseY} V${baseY - eave}`} stroke={spec.frame} strokeWidth="1.6" opacity=".8" />;
      })}

      {/* 정면 출입문 */}
      <rect x={fx + faceW / 2 - 13} y={baseY - 30} width="26" height="30" fill="#ffffff" stroke={spec.frame} strokeWidth="1.6" />
      <path d={`M${fx + faceW / 2} ${baseY - 30} V${baseY}`} stroke={spec.frame} strokeWidth="1" opacity=".6" />

      {/* 내부 베드 암시 — 정면 유리 너머 */}
      {Array.from({ length: d.bays * 2 }).map((_, i) => {
        const x = fx + 10 + (i * (faceW - 20)) / (d.bays * 2);
        return (
          <g key={i} opacity=".55">
            <rect x={x} y={baseY - 16} width="9" height="16" fill="#86efac" />
            <ellipse cx={x + 4.5} cy={baseY - 19} rx="6" ry="3.5" fill="#3aa03d" />
          </g>
        );
      })}

      {/* 높이 치수 — 처마 / 용마루 */}
      <g stroke="#6b7280" strokeWidth="1">
        <path d={`M${fx - 20} ${baseY} V${baseY - ridge}`} />
        <path d={`M${fx - 25} ${baseY} h10 M${fx - 25} ${baseY - eave} h10 M${fx - 25} ${baseY - ridge} h10`} />
      </g>
      <text x={fx - 28} y={baseY - eave / 2} fontSize="8.5" fontWeight="700" fill="#374151" textAnchor="end">
        처마 {d.eaveH}m
      </text>
      <text x={fx - 28} y={baseY - ridge + 4} fontSize="8.5" fontWeight="700" fill="#374151" textAnchor="end">
        용마루 {d.ridgeH}m
      </text>

      {/* 폭 치수 */}
      <g stroke="#6b7280" strokeWidth="1">
        <path d={`M${fx} ${baseY + 16} H${bx}`} />
        <path d={`M${fx} ${baseY + 11} v10 M${bx} ${baseY + 11} v10`} />
      </g>
      <text x={(fx + bx) / 2} y={baseY + 30} fontSize="9" fontWeight="800" fill="#374151" textAnchor="middle">
        폭 {d.width}m · {d.bays}연동
      </text>

      {/* 길이 안내 */}
      <text x={(bx + rx) / 2 + 14} y={(baseY + ry) / 2 + 24} fontSize="9" fontWeight="800" fill="#6b7280">
        길이 {d.length.toFixed(1)}m →
      </text>
    </svg>
  );
}

export { SPEC as GREENHOUSE_SPEC };
