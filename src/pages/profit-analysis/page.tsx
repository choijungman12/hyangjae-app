import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';
import { getMultipleCropPrices, type CropPriceInfo } from '@/lib/kamisApi';
import { isBusinessAuth } from '@/lib/businessAuth';

/* ───────── 작물 데이터 (2026년 KAMIS 평균 시세 기준) ─────────
 * pricePerKg는 KAMIS API에서 받아온 실시간 값으로 런타임에 덮어씁니다.
 * 아래 값은 API 실패 시 fallback 기본값입니다.
 */
interface CropInfo {
  id: string; name: string;
  pricePerKg: number;  // 원/kg (런타임에 실시간 시세로 갱신)
  yieldPerPlant: number; // g/주/수확
  rotationsPerYear: number;
  seedlingCost: number; // 원/주
  category: 'leafy' | 'fruit' | 'root' | 'herb';
  tag?: string;
}

/* 2026년 기준 수정된 데이터
 * - 고추냉이: 2만원 → 85,000원 (희귀작물 고가 반영)
 * - 바질: 1만원 → 38,000원 (수입 대비 국내산 프리미엄)
 * - 민트: 9천원 → 32,000원
 * - 딸기: 1.5만원 → 18,500원 (시세 반영)
 * - 깻잎: 8천원 → 13,000원
 * - 수율은 농진청 스마트팜 표준 매뉴얼 기준으로 재계산
 */
const CROP_DB_INITIAL: CropInfo[] = [
  // 엽채류
  { id: 'lettuce',       name: '상추',     pricePerKg: 9500,  yieldPerPlant: 250, rotationsPerYear: 8,  seedlingCost: 500,  category: 'leafy' },
  { id: 'kale',          name: '케일',     pricePerKg: 12000, yieldPerPlant: 280, rotationsPerYear: 6,  seedlingCost: 600,  category: 'leafy' },
  { id: 'spinach',       name: '시금치',   pricePerKg: 6500,  yieldPerPlant: 180, rotationsPerYear: 8,  seedlingCost: 400,  category: 'leafy' },
  { id: 'perilla',       name: '깻잎',     pricePerKg: 13000, yieldPerPlant: 220, rotationsPerYear: 6,  seedlingCost: 500,  category: 'leafy' },
  // 과채류
  { id: 'tomato',        name: '토마토',   pricePerKg: 4800,  yieldPerPlant: 5500, rotationsPerYear: 2, seedlingCost: 1000, category: 'fruit' },
  { id: 'strawberry',    name: '딸기',     pricePerKg: 18500, yieldPerPlant: 1800, rotationsPerYear: 1, seedlingCost: 1500, category: 'fruit', tag: '고수익' },
  { id: 'pepper',        name: '파프리카', pricePerKg: 7800,  yieldPerPlant: 3500, rotationsPerYear: 2, seedlingCost: 1200, category: 'fruit' },
  { id: 'cucumber',      name: '오이',     pricePerKg: 3900,  yieldPerPlant: 4500, rotationsPerYear: 3, seedlingCost: 800,  category: 'fruit' },
  { id: 'cherry-tomato', name: '방울토마토',pricePerKg: 9200,  yieldPerPlant: 3200, rotationsPerYear: 2, seedlingCost: 1000, category: 'fruit' },
  // 근채류
  { id: 'radish',        name: '무',       pricePerKg: 2800,  yieldPerPlant: 2500, rotationsPerYear: 4, seedlingCost: 300,  category: 'root' },
  { id: 'carrot',        name: '당근',     pricePerKg: 4200,  yieldPerPlant: 1800, rotationsPerYear: 3, seedlingCost: 350,  category: 'root' },
  // 허브류
  { id: 'wasabi',        name: '고추냉이', pricePerKg: 120000, yieldPerPlant: 45,  rotationsPerYear: 1, seedlingCost: 3000, category: 'herb', tag: '향재원 주력' },
  { id: 'basil',         name: '바질',     pricePerKg: 38000, yieldPerPlant: 180,  rotationsPerYear: 8, seedlingCost: 600,  category: 'herb' },
  { id: 'mint',          name: '민트',     pricePerKg: 32000, yieldPerPlant: 200,  rotationsPerYear: 7, seedlingCost: 600,  category: 'herb' },
];

const CATEGORY_META = [
  { id: 'leafy', name: '엽채류', icon: 'ri-leaf-line', gradient: 'from-green-400 to-emerald-600' },
  { id: 'fruit', name: '과채류', icon: 'ri-apple-line', gradient: 'from-red-400 to-pink-600' },
  { id: 'root',  name: '근채류', icon: 'ri-plant-line', gradient: 'from-orange-400 to-amber-600' },
  { id: 'herb',  name: '허브류', icon: 'ri-seedling-line', gradient: 'from-purple-400 to-indigo-600' },
];

/* ───────── 계산 함수 ───────── */
function calcProfit(params: {
  crop: CropInfo;
  plants: number;
  areaM2: number;
  electricCostMon: number;
  laborCostMon: number;
  nutrientCostMon: number;
  sellPriceOverride: number | null; // null = 시세 사용
}) {
  const { crop, plants, electricCostMon, laborCostMon, nutrientCostMon, sellPriceOverride } = params;
  const pricePerKg = sellPriceOverride ?? crop.pricePerKg;

  const annualProdKg = (plants * crop.yieldPerPlant * crop.rotationsPerYear) / 1000;
  const revenue = annualProdKg * pricePerKg;

  const electricity = electricCostMon * 12;
  const labor       = laborCostMon * 12;
  const nutrient    = nutrientCostMon * 12;
  const seedling    = plants * crop.seedlingCost;
  const misc        = 1800000; // 기타(보험·수수료 등)
  const totalCost   = electricity + labor + nutrient + seedling + misc;

  const profit      = revenue - totalCost;
  const roi         = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const bepMonths   = profit > 0 ? Math.ceil(totalCost / (profit / 12)) : 0;

  return {
    annualProdKg, revenue, electricity, labor, nutrient, seedling, misc,
    totalCost, profit, roi, bepMonths,
    monthlyRevenue: revenue / 12,
    monthlyProfit: profit / 12,
    profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
  };
}

function fmt만(v: number) {
  const abs = Math.abs(v);
  if (abs >= 100000000) return `${(v / 100000000).toFixed(1)}억`;
  return `${Math.round(v / 10000).toLocaleString()}만원`;
}

/* ═══════ 고추냉이 전용 5개년 수지분석 ═══════ */
function WasabiDetailAnalysis({ plants, area }: { plants: number; area: number }) {
  const [rootRatio, setRootRatio] = useState(30);
  const [leafRoute, setLeafRoute] = useState<'wholesale' | 'b2b' | 'direct'>('b2b');
  const [rootRoute, setRootRoute] = useState<'wholesale' | 'b2b' | 'premium'>('b2b');
  const [rootWeight, setRootWeight] = useState(45);

  const LEAF_PRICES = { wholesale: 1200, b2b: 2000, direct: 3000 };
  const ROOT_PRICES = { wholesale: 80000, b2b: 120000, premium: 180000 };
  const leafPrice = LEAF_PRICES[leafRoute];
  const rootPriceKg = ROOT_PRICES[rootRoute];

  const rootPlants = Math.round(plants * rootRatio / 100);
  const leafPlants = plants - rootPlants;
  const rootPerPlant = (rootWeight / 1000) * rootPriceKg;

  // 투자 구조 (150평 기준 비례)
  const areaRatio = area / 500; // 500m² = 약 150평
  const investStructure = 430_815_000;
  const investEquip = Math.round(225_555_000 * areaRatio);
  const investSeedling = plants * 3000;
  const investReserve = 20_000_000;
  const totalInvest = investStructure + investEquip + investSeedling + investReserve;
  const subsidy = 90_000_000;
  const loan = 200_000_000;
  const selfFund = Math.max(0, totalInvest - subsidy - loan);

  // 연간 운영비
  const annualCost = Math.round(
    15_000_000 * Math.pow(areaRatio, 0.7) + 5_250_000 * areaRatio +
    6_000_000 * Math.pow(areaRatio, 0.6) + 12_000_000 * Math.pow(areaRatio, 0.5) +
    2_000_000 + 3_000_000
  );

  // 5개년 계산
  const years = [
    { label: '1년차', leafRev: leafPlants * leafPrice * 8, rootRev: 0 },
    { label: '2년차', leafRev: leafPlants * leafPrice * 12, rootRev: rootPlants * rootPerPlant * 1 },
    { label: '3년차', leafRev: leafPlants * leafPrice * 12, rootRev: rootPlants * rootPerPlant * 1.5 },
    { label: '4년차', leafRev: leafPlants * leafPrice * 12, rootRev: rootPlants * rootPerPlant * 2 },
    { label: '5년차', leafRev: leafPlants * leafPrice * 12, rootRev: rootPlants * rootPerPlant * 2 },
  ];

  let cumulative = -selfFund;
  const yearData = years.map(y => {
    const rev = y.leafRev + y.rootRev;
    const profit = rev - annualCost;
    cumulative += profit;
    return { ...y, rev, profit, cumulative };
  });

  const maxRev = Math.max(...yearData.map(y => y.rev), 1);
  let recoverYear: number | null = null;
  for (let i = 0; i < yearData.length; i++) {
    if (yearData[i].cumulative >= 0) {
      recoverYear = i === 0 ? 1 : i + (-yearData[i - 1].cumulative) / yearData[i].profit;
      break;
    }
  }

  const fmt = (n: number) => {
    const a = Math.abs(n);
    if (a >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
    if (a >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* 슬라이더 패널 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-[11px] font-black text-emerald-700 mb-4 flex items-center gap-1.5">
          <i className="ri-settings-3-line" /> 변수 설정 — 슬라이더 조절 시 모든 수치 실시간 반영
        </p>

        <div className="space-y-5">
          {/* 근경 비율 */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">근경 재배 비율</span>
              <span className="text-sm font-black text-emerald-600" translate="no">{rootRatio}%</span>
            </div>
            <input type="range" min={0} max={70} step={5} value={rootRatio}
              onChange={e => setRootRatio(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-[9px] text-gray-400 mt-1">
              <span>잎 전용 0%</span><span>근경 70%</span>
            </div>
          </div>

          {/* 근경 무게 */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">근경 수확 무게</span>
              <span className="text-sm font-black text-emerald-600" translate="no">{rootWeight}g/주</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={rootWeight}
              onChange={e => setRootWeight(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>

          {/* 잎 판로 */}
          <div>
            <p className="text-xs text-gray-600 mb-2">잎 판로</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([['wholesale', '도매', '1,200원'], ['b2b', 'B2B', '2,000원'], ['direct', '직판', '3,000원']] as const).map(([k, l, p]) => (
                <button key={k} type="button" onClick={() => setLeafRoute(k)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all ${leafRoute === k ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 text-gray-600'}`}>
                  {l}<br /><span className="text-[9px] opacity-70">{p}/주·월</span>
                </button>
              ))}
            </div>
          </div>

          {/* 근경 판로 */}
          <div>
            <p className="text-xs text-gray-600 mb-2">근경 판로</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([['wholesale', '도매', '8만/kg'], ['b2b', '가공B2B', '12만/kg'], ['premium', '고급소매', '18만/kg']] as const).map(([k, l, p]) => (
                <button key={k} type="button" onClick={() => setRootRoute(k)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all ${rootRoute === k ? 'bg-amber-500 text-white shadow' : 'bg-gray-100 text-gray-600'}`}>
                  {l}<br /><span className="text-[9px] opacity-70">{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-1">묘목 비용</p>
          <p className="text-lg font-black text-gray-900" translate="no">{fmt(investSeedling)}</p>
          <p className="text-[10px] text-gray-400">{plants.toLocaleString()}주 × 3,000원</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-1">실 자부담</p>
          <p className="text-lg font-black text-amber-600" translate="no">{fmt(selfFund)}</p>
          <p className="text-[10px] text-gray-400">총 {fmt(totalInvest)} - 보조·융자</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-1">2년차 매출</p>
          <p className="text-lg font-black text-emerald-600" translate="no">{fmt(yearData[1].rev)}</p>
          <p className="text-[10px] text-gray-400">잎 {fmt(yearData[1].leafRev)} + 근경 {fmt(yearData[1].rootRev)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-1">투자 회수</p>
          <p className={`text-lg font-black ${recoverYear && recoverYear <= 3 ? 'text-emerald-600' : recoverYear ? 'text-amber-600' : 'text-red-500'}`} translate="no">
            {recoverYear ? `${recoverYear.toFixed(1)}년` : '5년+ 초과'}
          </p>
          <p className="text-[10px] text-gray-400">자부담 {fmt(selfFund)} 기준</p>
        </div>
      </div>

      {/* 연도별 바 차트 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-[11px] font-black text-gray-700 mb-3">연도별 매출 구성</p>
        <div className="flex gap-4 mb-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded" />잎 매출</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" />근경 매출</span>
        </div>
        <div className="space-y-2">
          {yearData.map(y => (
            <div key={y.label} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-12 flex-shrink-0 font-mono">{y.label}</span>
              <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center px-1.5 transition-all duration-500"
                  style={{ width: `${(y.leafRev / maxRev * 100).toFixed(1)}%` }}>
                  {y.leafRev > maxRev * 0.1 && <span className="text-[9px] font-black text-white whitespace-nowrap">{fmt(y.leafRev)}</span>}
                </div>
                {y.rootRev > 0 && (
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center px-1.5 transition-all duration-500"
                    style={{ width: `${(y.rootRev / maxRev * 100).toFixed(1)}%` }}>
                    {y.rootRev > maxRev * 0.08 && <span className="text-[9px] font-black text-white whitespace-nowrap">{fmt(y.rootRev)}</span>}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono font-black text-gray-700 w-16 text-right" translate="no">{fmt(y.rev)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5개년 상세 테이블 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-[11px] font-black text-gray-700">5개년 수지 상세</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-black text-gray-500">연도</th>
                <th className="px-3 py-2 text-right font-black text-gray-500">잎 매출</th>
                <th className="px-3 py-2 text-right font-black text-gray-500">근경 매출</th>
                <th className="px-3 py-2 text-right font-black text-gray-500">운영비</th>
                <th className="px-3 py-2 text-right font-black text-gray-500">순이익</th>
                <th className="px-3 py-2 text-right font-black text-gray-500">누적</th>
              </tr>
            </thead>
            <tbody>
              {yearData.map((y, i) => (
                <tr key={y.label} className="border-t border-gray-50 hover:bg-emerald-50/30">
                  <td className="px-3 py-2.5 font-black text-gray-900">
                    {y.label}
                    {recoverYear && i === Math.ceil(recoverYear) - 1 && (
                      <span className="ml-1 text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">회수</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-600" translate="no">{fmt(y.leafRev)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-amber-600" translate="no">{y.rootRev > 0 ? fmt(y.rootRev) : '—'}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-red-500" translate="no">{fmt(annualCost)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono font-black ${y.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`} translate="no">{fmt(y.profit)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono font-black ${y.cumulative >= 0 ? 'text-emerald-600' : 'text-red-500'}`} translate="no">{fmt(y.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 투자 구조 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-[11px] font-black text-gray-700 mb-3">투자 구조 (보조금·융자 포함)</p>
        <div className="space-y-2 text-xs">
          {[
            { label: '트러스와이어 구조물·토목', value: investStructure, color: 'bg-gray-400' },
            { label: `샘통 재배설비 (${Math.round(area / 3.3)}평)`, value: investEquip, color: 'bg-emerald-500' },
            { label: '묘목 비용', value: investSeedling, color: 'bg-amber-500' },
            { label: '초기 운영자금', value: investReserve, color: 'bg-blue-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="flex-1 text-gray-600">{item.label}</span>
              <span className="font-mono text-gray-900" translate="no">{fmt(item.value)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">총합계</span><span className="font-mono font-black" translate="no">{fmt(totalInvest)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">보조금 (무상)</span><span className="font-mono text-emerald-600" translate="no">-{fmt(subsidy)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">융자 (이자 1%)</span><span className="font-mono text-blue-600" translate="no">-{fmt(loan)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-black text-gray-900">실 자부담</span><span className="font-mono font-black text-amber-600" translate="no">{fmt(selfFund)}</span></div>
          </div>
        </div>
      </div>

      {/* 투자 회수 게이지 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-[11px] font-black text-gray-700 mb-3">연도별 투자 회수 진행률</p>
        {yearData.map(y => {
          const pct = Math.min(100, Math.max(0, ((selfFund + y.cumulative) / selfFund) * 100));
          const done = y.cumulative >= 0;
          return (
            <div key={y.label} className="mb-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500 font-mono">{y.label}</span>
                <span className={`font-mono font-black ${done ? 'text-emerald-600' : 'text-gray-500'}`}>{done ? '✓ 완료' : `${pct.toFixed(0)}%`}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-emerald-300'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── 컴포넌트 ───────── */
export default function ProfitAnalysis() {
  const navigate = useNavigate();
  const scrollY = useScrollY();

  // 🔒 사업자/관리자 인증 — 테스트 기간 중 개방 (운영 시 아래 주석 해제)
  // useEffect(() => {
  //   if (!isBusinessAuth()) navigate('/login?redirect=profit-analysis&role=business', { replace: true });
  // }, [navigate]);

  // 입력 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('herb');
  const [cropId, setCropId] = useState<string>('wasabi');
  const [plants, setPlants] = useState<string>('3000');
  const [areaM2, setAreaM2] = useState<string>('500');
  const [electricCost, setElectricCost] = useState<string>('150000');
  const [laborCost, setLaborCost] = useState<string>('3000000');
  const [nutrientCost, setNutrientCost] = useState<string>('200000');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [chartProgress, setChartProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'detail' | 'monthly'>('summary');

  // 실시간 시세
  const [cropDB, setCropDB] = useState<CropInfo[]>(CROP_DB_INITIAL);
  const [priceSource, setPriceSource] = useState<'kamis' | 'garak' | 'mock' | 'loading'>('loading');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 초기 로딩: 실시간 시세 조회
  useEffect(() => {
    (async () => {
      try {
        const prices: CropPriceInfo[] = await getMultipleCropPrices(CROP_DB_INITIAL.map(c => c.id));
        const updated = CROP_DB_INITIAL.map(crop => {
          const priceInfo = prices.find(p => p.cropId === crop.id);
          return priceInfo
            ? { ...crop, pricePerKg: priceInfo.latestPrice.wholesale }
            : crop;
        });
        setCropDB(updated);
        setPriceSource(prices[0]?.source ?? 'mock');
        setLastUpdated(prices[0]?.updatedAt ?? new Date().toISOString());
      } catch (err) {
        console.error('시세 조회 실패', err);
        setPriceSource('mock');
      }
    })();
  }, []);

  const cropData = cropDB.find(c => c.id === cropId) ?? cropDB[0];
  const categoryList = cropDB.filter(c => c.category === selectedCategory);

  const result = calcProfit({
    crop: cropData,
    plants: parseInt(plants) || 3000,
    areaM2: parseInt(areaM2) || 500,
    electricCostMon: parseInt(electricCost) || 150000,
    laborCostMon: parseInt(laborCost) || 3000000,
    nutrientCostMon: parseInt(nutrientCost) || 200000,
    sellPriceOverride: customPrice ? parseInt(customPrice) : null,
  });

  useEffect(() => {
    if (showResult) {
      setChartProgress(0);
      const t = setInterval(() => {
        setChartProgress(p => { if (p >= 100) { clearInterval(t); return 100; } return p + 2; });
      }, 16);
      return () => clearInterval(t);
    }
  }, [showResult, cropId, plants, areaM2, electricCost, laborCost, nutrientCost, customPrice]);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    const first = cropDB.find(c => c.category === catId);
    if (first) setCropId(first.id);
  }, []);

  const maxVal = Math.max(result.revenue, result.totalCost, 1);

  const monthlyRows = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenue: result.monthlyRevenue,
    cost: result.totalCost / 12,
    profit: result.monthlyProfit,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24 overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${-scrollY * 0.2}px)` }} />
      </div>

      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-purple-50 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">수익성 분석</h1>
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-full border border-purple-200">
            <i className="ri-flashlight-line text-purple-600 text-xs animate-pulse" />
            <span className="text-xs font-bold text-purple-700">실시간</span>
          </div>
        </div>
      </header>

      {/* 사업자 대시보드 링크 */}
      <section className="px-4 pt-4 relative z-10">
        <Link
          to="/admin/business"
          className="block relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <i className="ri-bar-chart-box-line text-white text-xl" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white">사업자 전용 대시보드</p>
              <p className="text-[10px] text-white/85 mt-0.5 leading-tight">시설 KPI · 작목반장 시세 · 경쟁업체 · 재무 시나리오</p>
            </div>
            <i className="ri-arrow-right-s-line text-white text-xl" aria-hidden="true" />
          </div>
        </Link>
      </section>

      {/* 히어로 */}
      <section className="px-4 pt-5 pb-5 relative z-10">
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70 font-bold mb-1">향재원 스마트팜</p>
              <h2 className="text-xl font-black mb-1.5 drop-shadow-lg">수익 시뮬레이터</h2>
              <p className="text-sm text-white/80">작물·재배 조건을 입력하고<br />연간 수익을 즉시 확인하세요</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <i className="ri-bar-chart-box-line text-3xl text-white drop-shadow-lg" />
            </div>
          </div>
          {/* 실시간 미리보기 */}
          <div className="mt-4 grid grid-cols-3 gap-2 relative z-10">
            {[
              { label: '예상 매출', value: fmt만(result.revenue), icon: 'ri-money-dollar-circle-line' },
              { label: '예상 순익', value: fmt만(result.profit), icon: 'ri-line-chart-line' },
              { label: 'ROI',      value: `${result.roi.toFixed(0)}%`,      icon: 'ri-percent-line' },
            ].map(item => (
              <div key={item.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className={`${item.icon} text-base mb-0.5`} />
                <p className="text-xs font-black leading-tight">{item.value}</p>
                <p className="text-[10px] text-white/70 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 실시간 시세 배지 */}
      <section className="px-4 pb-4 relative z-10">
        {(() => {
          const isLive = priceSource === 'kamis' || priceSource === 'garak';
          const liveLabel =
            priceSource === 'garak' ? '가락시장 실시간 경락가 반영' :
            priceSource === 'kamis' ? 'KAMIS 실시간 시세 반영' :
            priceSource === 'mock'  ? '2026년 평균 시세 기반' :
            '시세 불러오는 중...';
          return (
        <Link
          to="/price-trends"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md border transition-all hover:shadow-lg ${
            isLive ? 'bg-emerald-50 border-emerald-200' : priceSource === 'mock' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-emerald-500' : priceSource === 'mock' ? 'bg-amber-500' : 'bg-gray-400'}`}>
            {priceSource === 'loading' ? (
              <i className="ri-loader-4-line text-white text-lg animate-spin" />
            ) : (
              <i className={`${isLive ? 'ri-cloud-line' : 'ri-database-2-line'} text-white text-lg`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black ${isLive ? 'text-emerald-900' : 'text-amber-900'}`}>
              {liveLabel}
            </p>
            <p className={`text-[11px] ${isLive ? 'text-emerald-700' : 'text-amber-700'}`} translate="no">
              <span key={cropData.id}>{cropData.name}</span> {cropData.pricePerKg.toLocaleString()}원/kg{' '}
              {lastUpdated && `· ${new Date(lastUpdated).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`}
            </p>
          </div>
          <div className="flex items-center gap-1 text-blue-600 flex-shrink-0">
            <span className="text-[11px] font-black">가격 그래프</span>
            <i className="ri-arrow-right-s-line" />
          </div>
        </Link>
          );
        })()}
      </section>

      {/* 향재원 목표 현황 */}
      <section className="px-4 pb-5 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-building-4-line text-white text-lg" />
            </div>
            <div>
              <p className="text-white font-black text-sm">향재원 매출 목표</p>
              <p className="text-white/70 text-xs">서초구 양재동 · 2026년 9월 오픈</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {[
              { label: '1개월차 목표', value: '2,700만원', sub: '공간대여 + 스마트팜', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: '3개월차 목표', value: '3,540만원', sub: '복합 수익 모델',      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
              { label: '연간 매출 목표', value: '₩4억', sub: 'ROI 22% · 3.5년 회수',  color: 'text-pink-600',   bg: 'bg-pink-50',   border: 'border-pink-100' },
              { label: 'BEP 달성',   value: '3개월',     sub: '월 단위 흑자 전환',   color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-3`}>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className={`text-base font-black ${item.color}`}>{item.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 입력 폼 ══ */}
      <section className="px-4 pb-5 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
              <i className="ri-edit-box-line text-xl text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">재배 조건 입력</h3>
              <p className="text-xs text-gray-500">값을 변경하면 위 결과가 실시간 업데이트됩니다</p>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <p className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wide">작물 카테고리</p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_META.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative p-3 rounded-2xl border-2 text-center transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <i className={`${cat.icon} text-xl block mb-1 ${selectedCategory === cat.id ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-[11px] font-black ${selectedCategory === cat.id ? 'text-purple-900' : 'text-gray-600'}`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 작물 선택 */}
          <div>
            <p className="text-xs font-black text-gray-600 mb-2 uppercase tracking-wide">작물 선택</p>
            <div className="grid grid-cols-2 gap-2.5">
              {categoryList.map(crop => {
                const vis = CROP_VISUAL[crop.id];
                return (
                  <button
                    key={crop.id}
                    onClick={() => setCropId(crop.id)}
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden ${
                      cropId === crop.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-[1.03]'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    {crop.tag && (
                      <span className="absolute top-2 right-2 text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full">{crop.tag}</span>
                    )}
                    {cropId === crop.id && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-xs" />
                      </div>
                    )}
                    <div className={`w-16 h-16 mx-auto mb-2.5 rounded-2xl shadow-md flex items-center justify-center bg-gradient-to-br ${vis?.gradient ?? 'from-gray-300 to-gray-400'}`}>
                      <span className="text-3xl">{vis?.emoji ?? '🌱'}</span>
                    </div>
                    <p className={`text-sm font-black mb-1 ${cropId === crop.id ? 'text-purple-900' : 'text-gray-800'}`}>{crop.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{(crop.pricePerKg / 1000).toFixed(0)}천원/kg</p>
                    <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px]">
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">연{crop.rotationsPerYear}회</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택된 작물 정보 카드 — key로 강제 리렌더 (Papago 번역 캐시 우회) */}
          <div key={cropData.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${CROP_VISUAL[cropData.id]?.gradient ?? 'from-gray-300 to-gray-400'} shadow-md`}>
                <span className="text-2xl">{CROP_VISUAL[cropData.id]?.emoji ?? '🌱'}</span>
              </div>
              <div>
                <p className="text-sm font-black text-gray-900" translate="no">
                  <span>{cropData.name}</span> 기준 데이터
                </p>
                <p className="text-xs text-gray-500">시장 평균가 · 스마트팜 수율 기준</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '판매가', value: `${(cropData.pricePerKg/1000).toFixed(0)}천원/kg` },
                { label: '수율', value: `${cropData.yieldPerPlant}g/주` },
                { label: '연간회전', value: `${cropData.rotationsPerYear}회` },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-2.5 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                  <p className="text-xs font-black text-purple-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 기본 입력 */}
          <div className="space-y-4">
            {[
              { label: '재배 주수', icon: 'ri-seedling-line', value: plants, setter: setPlants, unit: '주', color: 'purple', placeholder: '3000' },
              { label: '재배 면적', icon: 'ri-layout-grid-line', value: areaM2, setter: setAreaM2, unit: '㎡', color: 'blue', placeholder: '500' },
            ].map(field => (
              <div key={field.label}>
                <label className="flex items-center gap-1.5 text-xs font-black text-gray-700 mb-2">
                  <i className={`${field.icon} text-${field.color}-500`} />
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3.5 bg-gradient-to-r from-${field.color}-50 to-${field.color}-50/50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-${field.color}-400 focus:border-transparent transition-all`}
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-${field.color}-600 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-gray-100`}>{field.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 고급 설정 토글 */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center gap-2">
              <i className="ri-settings-3-line text-gray-500" />
              <span className="text-sm font-black text-gray-700">고급 설정 (비용·판매가)</span>
            </div>
            <i className={`ri-arrow-${showAdvanced ? 'up' : 'down'}-s-line text-gray-500 transition-transform duration-300`} />
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-500">월별 비용 (기본값: 시장 평균)</p>
              {[
                { label: '전기 비용', icon: 'ri-flashlight-line', value: electricCost, setter: setElectricCost, color: 'yellow', unit: '원/월' },
                { label: '인건비', icon: 'ri-group-line', value: laborCost, setter: setLaborCost, color: 'blue', unit: '원/월' },
                { label: '배양액 비용', icon: 'ri-flask-line', value: nutrientCost, setter: setNutrientCost, color: 'teal', unit: '원/월' },
              ].map(field => (
                <div key={field.label}>
                  <label className="flex items-center gap-1.5 text-xs font-black text-gray-700 mb-1.5">
                    <i className={`${field.icon} text-${field.color}-500`} />
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">{field.unit}</span>
                  </div>
                </div>
              ))}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-gray-700 mb-1.5">
                  <i className="ri-price-tag-3-line text-orange-500" />
                  판매가 직접 입력 <span className="text-gray-400 font-normal">(비울 시 시세 자동 적용)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={e => setCustomPrice(e.target.value)}
                    placeholder={`시세: ${cropData.pricePerKg.toLocaleString()}원/kg`}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-orange-50/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">원/kg</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResult(true)}
            className="relative w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white py-4 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <i className="ri-calculator-line text-xl relative z-10" />
            <span className="relative z-10">정밀 수익 분석하기</span>
          </button>
        </div>
      </section>

      {/* ══ 고추냉이 전문 5개년 분석 (wasabi 선택 시) ══ */}
      {cropId === 'wasabi' && showResult && (
        <section className="px-4 pb-6 relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <i className="ri-seedling-fill text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">고추냉이 전문 5개년 수지분석</p>
              <p className="text-[10px] text-gray-500">잎 + 근경 분리 · 투자 회수 · 보조금/융자 포함</p>
            </div>
          </div>
          <WasabiDetailAnalysis plants={parseInt(plants) || 3000} area={parseInt(areaM2) || 500} />
        </section>
      )}

      {/* ══ 결과 ══ */}
      {showResult && (
        <>
          {/* 탭 헤더 */}
          <section className="px-4 pb-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-1.5 flex gap-1">
              {(['summary', 'detail', 'monthly'] as const).map(tab => {
                const meta = { summary: { label: '요약', icon: 'ri-dashboard-line' }, detail: { label: '세부 비용', icon: 'ri-pie-chart-line' }, monthly: { label: '월별 현황', icon: 'ri-calendar-line' } };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                      activeTab === tab ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <i className={meta[tab].icon} />
                    {meta[tab].label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 요약 탭 */}
          {activeTab === 'summary' && (
            <section className="px-4 pb-5 relative z-10 space-y-4">
              {/* KPI 카드 2×2 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '연간 매출', value: fmt만(result.revenue), sub: `월 ${fmt만(result.monthlyRevenue)}`, icon: 'ri-money-dollar-circle-fill', grad: 'from-green-500 to-emerald-600' },
                  { label: '연간 순이익', value: fmt만(result.profit), sub: result.profit >= 0 ? '흑자' : '적자', icon: 'ri-bar-chart-fill', grad: result.profit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600' },
                  { label: '투자 수익률', value: `${result.roi.toFixed(1)}%`, sub: 'ROI 지표', icon: 'ri-line-chart-fill', grad: 'from-purple-500 to-pink-600' },
                  { label: '연간 생산량', value: `${result.annualProdKg.toFixed(0)}kg`, sub: `${cropData.name} · ${cropData.rotationsPerYear}회전`, icon: 'ri-plant-fill', grad: 'from-teal-500 to-cyan-600' },
                ].map(card => (
                  <div key={card.label} className={`relative bg-gradient-to-br ${card.grad} rounded-3xl p-5 text-white shadow-xl overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/15 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                        <i className={`${card.icon} text-lg`} />
                      </div>
                      <p className="text-xs text-white/80 font-bold mb-1">{card.label}</p>
                      <p className="text-xl font-black drop-shadow">{card.value}</p>
                      <p className="text-[10px] text-white/70 mt-0.5">{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 수익 막대 차트 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="ri-bar-chart-2-line text-white text-lg" />
                  </div>
                  <h4 className="text-sm font-black text-gray-900">수익 구조</h4>
                </div>
                {[
                  { label: '연간 매출', value: result.revenue, color: 'from-emerald-500 to-green-400', textColor: 'text-emerald-600' },
                  { label: '총 비용', value: result.totalCost, color: 'from-red-500 to-orange-400', textColor: 'text-red-600' },
                  { label: '순이익', value: Math.abs(result.profit), color: result.profit >= 0 ? 'from-purple-500 to-pink-400' : 'from-gray-400 to-gray-500', textColor: result.profit >= 0 ? 'text-purple-600' : 'text-gray-500' },
                ].map(item => (
                  <div key={item.label} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-gray-700">{item.label}</span>
                      <span className={`text-xs font-black ${item.textColor}`}>{fmt만(item.value)}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${(chartProgress / 100) * (item.value / maxVal) * 100}%`, minWidth: '4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 수익성 지표 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
                <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-trophy-line text-amber-500" />수익성 지표
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '이익률',          value: `${result.profitMargin.toFixed(1)}%`, good: result.profitMargin > 20, icon: 'ri-percent-line' },
                    { label: '월 순이익',        value: fmt만(result.monthlyProfit),         good: result.monthlyProfit > 0, icon: 'ri-calendar-line' },
                    { label: '투자 회수 기간',   value: result.bepMonths > 0 ? `약 ${result.bepMonths}개월` : '손실', good: result.bepMonths > 0 && result.bepMonths <= 36, icon: 'ri-time-line' },
                    { label: '묘목 투자 비용',   value: fmt만(result.seedling),              good: true, icon: 'ri-seedling-line' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <i className={`${row.icon} text-gray-400 text-sm`} />
                        <span className="text-xs font-bold text-gray-700">{row.label}</span>
                      </div>
                      <span className={`text-sm font-black ${row.good ? 'text-emerald-600' : 'text-red-500'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 세부 비용 탭 */}
          {activeTab === 'detail' && (
            <section className="px-4 pb-5 relative z-10">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
                <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-pie-chart-line text-purple-500" />연간 비용 세부 내역
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '전기 비용', value: result.electricity, icon: 'ri-flashlight-line', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: '인건비',   value: result.labor,       icon: 'ri-group-line',       color: 'text-blue-600',   bg: 'bg-blue-50' },
                    { label: '배양액',   value: result.nutrient,    icon: 'ri-flask-line',        color: 'text-teal-600',   bg: 'bg-teal-50' },
                    { label: '묘목비',   value: result.seedling,    icon: 'ri-seedling-line',     color: 'text-green-600',  bg: 'bg-green-50' },
                    { label: '기타(보험·수수료 등)', value: result.misc, icon: 'ri-more-line', color: 'text-gray-600', bg: 'bg-gray-50' },
                  ].map(item => {
                    const pct = result.totalCost > 0 ? (item.value / result.totalCost) * 100 : 0;
                    return (
                      <div key={item.label} className={`${item.bg} rounded-2xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <i className={`${item.icon} ${item.color}`} />
                            <span className="text-xs font-bold text-gray-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-black ${item.color}`}>{fmt만(item.value)}</span>
                            <span className="text-[10px] text-gray-400 ml-1.5">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current rounded-full transition-all duration-1000"
                            style={{ width: `${(chartProgress / 100) * pct}%`, color: 'currentColor', opacity: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900">총 비용</span>
                  <span className="text-lg font-black text-red-600">{fmt만(result.totalCost)}</span>
                </div>
              </div>
            </section>
          )}

          {/* 월별 현황 탭 */}
          {activeTab === 'monthly' && (
            <section className="px-4 pb-5 relative z-10">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
                <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-calendar-check-line text-purple-500" />월별 예상 수익 현황
                </h4>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="py-2 px-1 text-left font-black text-gray-600">월</th>
                        <th className="py-2 px-1 text-right font-black text-emerald-600">매출</th>
                        <th className="py-2 px-1 text-right font-black text-red-500">비용</th>
                        <th className="py-2 px-1 text-right font-black text-purple-600">순이익</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRows.map(row => (
                        <tr key={row.month} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                          <td className="py-2.5 px-1 font-black text-gray-700">{row.month}월</td>
                          <td className="py-2.5 px-1 text-right font-bold text-emerald-600">{fmt만(row.revenue)}</td>
                          <td className="py-2.5 px-1 text-right font-bold text-red-500">{fmt만(row.cost)}</td>
                          <td className={`py-2.5 px-1 text-right font-black ${row.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>{fmt만(row.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-purple-50">
                        <td className="py-2.5 px-1 font-black text-gray-900">연간</td>
                        <td className="py-2.5 px-1 text-right font-black text-emerald-700">{fmt만(result.revenue)}</td>
                        <td className="py-2.5 px-1 text-right font-black text-red-700">{fmt만(result.totalCost)}</td>
                        <td className={`py-2.5 px-1 text-right font-black text-base ${result.profit >= 0 ? 'text-purple-700' : 'text-red-700'}`}>{fmt만(result.profit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 다시 계산 버튼 */}
          <section className="px-4 pb-6 relative z-10">
            <button
              onClick={() => { setShowResult(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full bg-white border-2 border-purple-300 text-purple-700 py-3.5 rounded-2xl font-black text-sm shadow-md hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
            >
              <i className="ri-refresh-line" />
              조건 변경 후 재분석
            </button>
          </section>
        </>
      )}

      <BottomNav />
    </div>
  );
}
