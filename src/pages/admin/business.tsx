import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/pages/admin/page';
import { CROP_MARKET_DETAILS } from '@/data/cropMarketInfo';

/* ═══════════════════════════════════════════════════════════
 *  사업자 전용 비즈니스 대시보드
 *
 *  - 시설·수확 핵심 지표 (KPI)
 *  - 출하 품목 시세 밴드 (고추냉이·유러피안 채소·노지 조경수)
 *  - 출하 채널 비교표
 *  - 재무 시뮬레이션 (낙관/현실/비관 3개 시나리오)
 *
 *  🔒 /admin 로그인 필요. 일반 고객은 접근 불가.
 * ═══════════════════════════════════════════════════════════ */

// ── 시설 투자 비용 기본값 (슬라이더로 변경 가능) ──
const INVEST_DEFAULTS = {
  area: 150,           // 평
  plants: 10000,       // 주
  seedlingCost: 3000,  // 원/주
  structureCost: 430_815_000,  // 트러스와이어+토목
  equipBaseCost: 225_555_000,  // 샘통설비 (150평 기준)
  subsidy: 90_000_000,  // 무상 보조금
  loan: 200_000_000,    // 융자 (이자 1%)
  reserve: 20_000_000,  // 초기 운영자금
  houseCount: 8,        // 유러피안 특수작물 재배동 수
  houseRevYear: 9_600_000, // 재배동 1동 연 매출 추정 (원)
  fieldTrees: 600,      // 노지 조경수 식재 주수
  treePriceAvg: 36_000, // 조경수 평균 출하 단가 (원/주)
  treeTurnYears: 2,     // 조경수 평균 회전 연수
  leafPriceMonth: 2000, // 잎 B2B 원/주·월
  rootPriceKg: 120_000, // 근경 원/kg
  rootWeight: 45,       // g/주
  rootRatio: 30,        // 근경 비율 %
};

// ── 향재원 출하 품목 시세 밴드 ──
const TARGET_CROPS = ['wasabi', 'rucola', 'radicchio', 'basil', 'lettuce'] as const;

const PRICE_BANDS: Record<string, { low: number; mid: number; high: number; unit: string; source: string }> = {
  wasabi:    { low: 80000, mid: 120000, high: 200000, unit: '원/kg (생근경)', source: 'KAMIS 미등재 · 고급 일식당 직거래 실거래가' },
  rucola:    { low: 11000, mid: 16000,  high: 23000,  unit: '원/kg',          source: '이탈리안 레스토랑 B2B · 여름 고온기 상승' },
  radicchio: { low: 15000, mid: 22000,  high: 32000,  unit: '원/kg',          source: '가을·겨울 적색 발현기 최고가' },
  basil:     { low: 28000, mid: 38000,  high: 52000,  unit: '원/kg',          source: '국내산 프리미엄 · 수입 대비 2배' },
  lettuce:   { low: 3000,  mid: 9500,   high: 18000,  unit: '원/kg',          source: '가락시장 도매 · 여름 고온기 급등' },
};

/** 노지 조경수 — "주" 단위 거래라 kg 시세와 분리해 표시합니다 */
const TREE_PRICE_BANDS = [
  { name: '블루엔젤',      spec: '수고 1.2~2.0m · 근분', low: 28000, mid: 40000, high: 60000, note: '도심 정원·아파트 조경 포인트 수종' },
  { name: '에메랄드그린',  spec: '수고 1.0~1.8m · 포트', low: 22000, mid: 32000, high: 48000, note: '생울타리·경계식재 최다 수요' },
  { name: '에메랄드골드',  spec: '수고 0.8~1.5m · 포트', low: 20000, mid: 29000, high: 42000, note: '황금빛 상록 · 포인트 식재' },
  { name: '블루베리 (묘)', spec: '수고 0.6~1.2m · 포트', low: 12000, mid: 18000, high: 28000, note: '수확 6~8월 · 체험 연계' },
];

// ── 출하 채널 비교 ──
interface ChannelRow {
  name: string;
  /** 주 취급 품목 */
  items: string;
  /** 향재원 기준 운송 거리·시간 */
  distance: string;
  /** 정산 주기 */
  settlement: string;
  /** 수수료·마진 구조 */
  margin: string;
  /** 채널의 강점 */
  usp: string;
  /** 우선순위 채널 여부 */
  isPrimary?: boolean;
}

const CHANNELS: ChannelRow[] = [
  {
    name: '양재 화훼공판장',
    items: '블루엔젤 · 에메랄드그린 · 절화',
    distance: '같은 양재동 생활권 · 차량 5분대',
    settlement: '경매 후 정산',
    margin: '경매 수수료 차감',
    usp: '초단거리 · 수확 당일 출하로 품질 유지',
    isPrimary: true,
  },
  {
    name: '요식업 직거래',
    items: '고추냉이 생근경 · 유러피안 특수작물',
    distance: '서울 전역 · 당일 배송',
    settlement: '월 정산',
    margin: '중간 유통 없음 (마진 최대)',
    usp: '국산 프리미엄 포지션 · 단가 방어력 높음',
    isPrimary: true,
  },
  {
    name: '조경 시공사',
    items: '블루엔젤 · 에메랄드그린 (근분)',
    distance: '수도권',
    settlement: '현장 검수 후 정산',
    margin: '대량 할인 요구 있음',
    usp: '한 번에 대량 출하 · 재고 회전 빠름',
  },
  {
    name: '온라인 직판',
    items: '고추냉이 가공품 · 소량 생근경',
    distance: '전국 택배',
    settlement: '즉시 결제',
    margin: '플랫폼 수수료 + 배송비',
    usp: '브랜드 노출 · 소비자 데이터 확보',
  },
];

// ── 재무 시뮬레이션 ──
interface Scenario {
  id: 'optimistic' | 'realistic' | 'pessimistic';
  name: string;
  shipRate: number;     // 계획 대비 출하 달성률 (%)
  monthlyRevenue: number; // 월 매출 (원)
  monthlyCost: number;    // 월 운영비 (원)
  color: string;
  bg: string;
  border: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'optimistic',
    name: '낙관',
    shipRate: 85,
    monthlyRevenue: 42_000_000, // 월 4,200만원
    monthlyCost: 18_000_000,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  {
    id: 'realistic',
    name: '현실',
    shipRate: 65,
    monthlyRevenue: 33_000_000, // 월 3,300만원 → 연 4억
    monthlyCost: 19_000_000,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  {
    id: 'pessimistic',
    name: '비관',
    shipRate: 45,
    monthlyRevenue: 22_000_000,
    monthlyCost: 20_000_000,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
];

/**
 * 시나리오 분석 기준 투자액.
 *
 * ❗ 상단 통합 시뮬레이터의 totalInvest(시설·설비·묘·노지 식재 합계)와는 범위가 다릅니다.
 *   이 값은 토지 취득비를 포함한 **총사업비** 기준이라 시뮬레이터 산출액보다 큽니다.
 *   화면에서도 두 숫자를 나란히 보여 주고 범위를 명시합니다.
 */
const INITIAL_INVESTMENT = 1_500_000_000; // 15억 (토지 포함 총사업비)

function fmtWon(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000_000)  return `${(n / 10_000_000).toFixed(1)}천만`;
  if (n >= 10_000)      return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

export default function AdminBusiness() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [authed, setAuthed] = useState(false);
  const [scenarioId, setScenarioId] = useState<Scenario['id']>('realistic');

  // ── 통합 시뮬레이터 상태 ──
  const [simArea, setSimArea] = useState(INVEST_DEFAULTS.area);
  const [simPlants, setSimPlants] = useState(INVEST_DEFAULTS.plants);
  const [simHouses, setSimHouses] = useState(INVEST_DEFAULTS.houseCount);
  const [simTrees, setSimTrees] = useState(INVEST_DEFAULTS.fieldTrees);
  const [simRootRatio, setSimRootRatio] = useState(INVEST_DEFAULTS.rootRatio);
  const [simLeafPrice, setSimLeafPrice] = useState(INVEST_DEFAULTS.leafPriceMonth);
  const [simRootPrice, setSimRootPrice] = useState(INVEST_DEFAULTS.rootPriceKg);
  const [simRootWeight, setSimRootWeight] = useState(INVEST_DEFAULTS.rootWeight);

  // 🧪 테스트 모드: 인증 없이 접근 허용 (운영 시 아래 블록으로 교체)
  useEffect(() => { setAuthed(true); }, []);
  // useEffect(() => {
  //   const ok = isAuth();
  //   setAuthed(ok);
  //   if (!ok) navigate('/admin', { replace: true });
  // }, [isAuth, navigate]);

  const activeScenario = useMemo(
    () => SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[1],
    [scenarioId],
  );

  const monthlyProfit = activeScenario.monthlyRevenue - activeScenario.monthlyCost;
  const annualProfit = monthlyProfit * 12;
  const bepMonths = monthlyProfit > 0 ? Math.ceil(INITIAL_INVESTMENT / monthlyProfit) : Infinity;
  const roiPercent = monthlyProfit > 0 ? ((annualProfit / INITIAL_INVESTMENT) * 100) : 0;

  // ── 통합 시뮬레이션 계산 ──
  const sim = useMemo(() => {
    const areaRatio = simArea / 150;
    const equipCost = Math.round(INVEST_DEFAULTS.equipBaseCost * areaRatio);
    const seedlingCost = simPlants * INVEST_DEFAULTS.seedlingCost;
    // 재배동 1동당 설비(관수·환기·센서) 약 900만 + 노지 묘목 식재비
    const houseInvest = simHouses * 9_000_000;
    const fieldInvest = simTrees * 12_000;
    const totalInvest = INVEST_DEFAULTS.structureCost + equipCost + seedlingCost + houseInvest + fieldInvest + INVEST_DEFAULTS.reserve;
    const selfFund = Math.max(0, totalInvest - INVEST_DEFAULTS.subsidy - INVEST_DEFAULTS.loan);

    // 작물 매출 (2년차 기준)
    const rootPlants = Math.round(simPlants * simRootRatio / 100);
    const leafPlants = simPlants - rootPlants;
    const leafRevYear = leafPlants * simLeafPrice * 12;
    const rootPerPlant = (simRootWeight / 1000) * simRootPrice;
    const rootRevYear = rootPlants * rootPerPlant;
    const cropRevYear = leafRevYear + rootRevYear;

    // 유러피안 특수작물 매출 (재배동 × 동당 연 매출)
    const houseRevYear = simHouses * INVEST_DEFAULTS.houseRevYear;

    // 노지 조경수·화훼 매출 (회전 연수로 나눠 연 환산)
    const fieldRevYear = Math.round(
      (simTrees * INVEST_DEFAULTS.treePriceAvg) / INVEST_DEFAULTS.treeTurnYears
    );

    // 제품 판매 매출 (추정)
    const productRevYear = Math.round(cropRevYear * 0.15); // 작물의 15%를 가공 제품으로

    const totalRevYear = cropRevYear + houseRevYear + fieldRevYear + productRevYear;

    // 연간 운영비
    const annualOpex = Math.round(
      15_000_000 * Math.pow(areaRatio, 0.7) + 5_250_000 * areaRatio +
      6_000_000 * Math.pow(areaRatio, 0.6) + 12_000_000 * Math.pow(areaRatio, 0.5) +
      2_000_000 + 3_000_000 +
      simHouses * 1_800_000 +  // 재배동 운영비 (난방·관수·자재)
      Math.round(simTrees * 4_000) // 노지 관리비 (전정·방제·관수)
    );

    const annualNetProfit = totalRevYear - annualOpex;
    const roi = annualOpex > 0 ? (annualNetProfit / totalInvest) * 100 : 0;
    const recoverYears = annualNetProfit > 0 ? selfFund / annualNetProfit : Infinity;

    return {
      totalInvest, selfFund, equipCost, seedlingCost, houseInvest, fieldInvest,
      leafRevYear, rootRevYear, cropRevYear, houseRevYear, fieldRevYear, productRevYear, totalRevYear,
      annualOpex, annualNetProfit, roi, recoverYears,
      rootPlants, leafPlants,
    };
  }, [simArea, simPlants, simHouses, simTrees, simRootRatio, simLeafPrice, simRootPrice, simRootWeight]);

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" aria-label="관리자 홈으로">
            <i className="ri-arrow-left-line text-xl text-gray-700" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-black text-gray-900 flex items-center gap-2">
              <i className="ri-bar-chart-box-line text-emerald-500" aria-hidden="true" />
              사업자 전용 대시보드
            </h1>
            <p className="text-[11px] text-gray-500">작목반장 시세 · 출하 채널 비교 · 재무 시뮬레이션</p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            사업자 전용
          </span>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* ═══ 통합 시뮬레이터 — 온실 + 재배동 + 노지 종합 ═══ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-settings-3-line text-emerald-500" />
              통합 시나리오 설정
            </h2>
            <span className="text-[10px] text-emerald-600 font-black">슬라이더 조절 → 실시간 반영</span>
          </div>

          {/* 슬라이더 패널 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-4 space-y-4">
            {/* 면적 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">재배 면적</span>
                <span className="font-black text-emerald-600" translate="no">{simArea}평</span>
              </div>
              <input type="range" min={50} max={500} step={10} value={simArea} onChange={e => setSimArea(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
            {/* 주수 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">재식 주수</span>
                <span className="font-black text-emerald-600" translate="no">{simPlants.toLocaleString()}주</span>
              </div>
              <input type="range" min={1000} max={30000} step={500} value={simPlants} onChange={e => setSimPlants(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
            {/* 근경 비율 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">근경 비율</span>
                <span className="font-black text-amber-600" translate="no">{simRootRatio}% ({Math.round(simPlants * simRootRatio / 100).toLocaleString()}주)</span>
              </div>
              <input type="range" min={0} max={70} step={5} value={simRootRatio} onChange={e => setSimRootRatio(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
            {/* 유러피안 재배동 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">유러피안 재배동</span>
                <span className="font-black text-lime-600" translate="no">{simHouses}동</span>
              </div>
              <input type="range" min={0} max={16} step={1} value={simHouses} onChange={e => setSimHouses(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lime-500"
                aria-label="유러피안 재배동 수" />
            </div>
            {/* 노지 조경수 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">노지 조경수 (블루엔젤·에메랄드그린)</span>
                <span className="font-black text-blueangel-700" translate="no">{simTrees.toLocaleString()}주</span>
              </div>
              <input type="range" min={0} max={2000} step={50} value={simTrees} onChange={e => setSimTrees(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                aria-label="노지 조경수 식재 주수" />
            </div>
          </div>

          {/* 최종 KPI 결과 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2"><i className="ri-building-line text-sm" /></div>
                <p className="text-lg font-black" translate="no">{fmtWon(sim.totalInvest)}</p>
                <p className="text-[10px] text-white/80 mt-0.5">총 시설 투자비</p>
                <p className="text-[9px] text-white/60">자부담 {fmtWon(sim.selfFund)}</p>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2"><i className="ri-money-dollar-circle-line text-sm" /></div>
                <p className="text-lg font-black" translate="no">{fmtWon(sim.totalRevYear)}</p>
                <p className="text-[10px] text-white/80 mt-0.5">연간 총 매출</p>
                <p className="text-[9px] text-white/60">고추냉이 {fmtWon(sim.cropRevYear)} + 특수작물 {fmtWon(sim.houseRevYear)} + 노지 {fmtWon(sim.fieldRevYear)}</p>
              </div>
            </div>
            <div className={`relative bg-gradient-to-br ${sim.annualNetProfit >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} rounded-2xl p-4 text-white shadow-lg overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2"><i className="ri-line-chart-line text-sm" /></div>
                <p className="text-lg font-black" translate="no">{fmtWon(sim.annualNetProfit)}</p>
                <p className="text-[10px] text-white/80 mt-0.5">연간 순이익</p>
                <p className="text-[9px] text-white/60">ROI {sim.roi.toFixed(1)}%</p>
              </div>
            </div>
            <div className={`relative bg-gradient-to-br ${sim.recoverYears <= 3 ? 'from-purple-500 to-pink-600' : sim.recoverYears <= 5 ? 'from-amber-500 to-orange-600' : 'from-gray-500 to-gray-700'} rounded-2xl p-4 text-white shadow-lg overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2"><i className="ri-timer-line text-sm" /></div>
                <p className="text-lg font-black" translate="no">{sim.recoverYears < 100 ? `${sim.recoverYears.toFixed(1)}년` : '—'}</p>
                <p className="text-[10px] text-white/80 mt-0.5">투자 회수 기간</p>
                <p className="text-[9px] text-white/60">자부담 {fmtWon(sim.selfFund)} 기준</p>
              </div>
            </div>
          </div>

          {/* 매출 분해 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-3">
            <p className="text-[11px] font-black text-gray-600 mb-2">매출 구성 (연간)</p>
            <div className="space-y-2">
              {[
                { label: `잎 매출 (${sim.leafPlants.toLocaleString()}주)`, value: sim.leafRevYear, color: 'bg-emerald-500' },
                { label: `근경 매출 (${sim.rootPlants.toLocaleString()}주)`, value: sim.rootRevYear, color: 'bg-amber-500' },
                { label: `유러피안 특수작물 (${simHouses}동)`, value: sim.houseRevYear, color: 'bg-lime-500' },
                { label: `노지 조경수·화훼 (${simTrees.toLocaleString()}주)`, value: sim.fieldRevYear, color: 'bg-cyan-600' },
                { label: '가공 제품 (추정)', value: sim.productRevYear, color: 'bg-purple-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="flex-1 text-[11px] text-gray-600">{item.label}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${sim.totalRevYear > 0 ? (item.value / sim.totalRevYear * 100) : 0}%` }} />
                  </div>
                  <span className="text-[11px] font-mono font-black text-gray-800 w-16 text-right" translate="no">{fmtWon(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
                <span className="font-black text-gray-700">합계</span>
                <span className="font-mono font-black text-emerald-600" translate="no">{fmtWon(sim.totalRevYear)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 작목반장 시세 ═══ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-plant-line text-emerald-500" aria-hidden="true" />
              출하 품목 시세 밴드
            </h2>
            <Link to="/price-trends" className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
              전체 보기 <i className="ri-arrow-right-s-line" />
            </Link>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-3">
            {TARGET_CROPS.map(id => {
              const crop = CROP_MARKET_DETAILS[id];
              const band = PRICE_BANDS[id];
              if (!crop || !band) return null;
              const range = band.high - band.low;
              return (
                <div key={id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-black text-gray-900">{crop.koreanName}</p>
                      <p className="text-[10px] text-gray-500 italic">{crop.category} · {crop.origin.split(' · ')[0]}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      crop.volatility === 'high'   ? 'bg-red-50 text-red-700 border-red-200' :
                      crop.volatility === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                     'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {crop.volatility === 'high' ? '변동 大' : crop.volatility === 'medium' ? '변동 中' : '안정'}
                    </span>
                  </div>
                  {/* 가격 밴드 바 */}
                  <div className="relative h-7 bg-gradient-to-r from-amber-200 via-emerald-300 to-red-200 rounded-full overflow-hidden mb-2">
                    <div className="absolute inset-y-0 left-[30%] right-[30%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-black text-white drop-shadow" translate="no">
                        {band.mid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold" translate="no">
                    <span className="text-amber-700">최저 {band.low.toLocaleString()}</span>
                    <span className="text-gray-500">{band.unit}</span>
                    <span className="text-red-700">최고 {band.high.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                    💡 {crop.priceInsight}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">※ 밴드 폭 {fmtWon(range)} · {band.source}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ 노지 조경수 단가 — "주" 단위 거래 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-leaf-line text-emerald-500" aria-hidden="true" />
              노지 조경수 · 과수 단가
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              kg 이 아니라 <b>주(株) 단위</b> 거래입니다. 규격(수고)이 단가를 결정합니다.
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {TREE_PRICE_BANDS.map(t => (
              <div key={t.name} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5" translate="no">{t.spec}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-700" translate="no">
                      {t.mid.toLocaleString()}원
                    </p>
                    <p className="text-[9px] text-gray-400">주당 평균</p>
                  </div>
                </div>
                {/* 단가 밴드 */}
                <div className="relative h-5 bg-gradient-to-r from-amber-200 via-emerald-300 to-red-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 bg-emerald-500 rounded-full"
                    style={{
                      left: `${((t.mid - t.low) / (t.high - t.low)) * 100 - 8}%`,
                      width: '16%',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold mt-1.5" translate="no">
                  <span className="text-amber-700">최저 {t.low.toLocaleString()}</span>
                  <span className="text-gray-400">원 / 주</span>
                  <span className="text-red-700">최고 {t.high.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">💡 {t.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-1">
            ※ 출하 성수기(3~5월 · 9~11월)에 단가가 올라갑니다. 양재 화훼공판장 경매가와 조경 시공사 직거래가의 차이가 큽니다.
          </p>
        </section>

        {/* ═══ 출하 채널 비교표 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-truck-line text-blue-500" aria-hidden="true" />
              출하 채널 비교
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">거리 · 정산 · 마진 구조로 본 채널 우선순위</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {CHANNELS.map(c => (
                <div key={c.name} className={`p-4 ${c.isPrimary ? 'bg-gradient-to-br from-wasabi-50 to-emeraldgreen-100' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black ${c.isPrimary ? 'text-wasabi-900' : 'text-gray-900'}`}>{c.name}</p>
                        {c.isPrimary && (
                          <span className="text-[9px] font-black bg-wasabi-500 text-white px-1.5 py-0.5 rounded">우선</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{c.items}</p>
                    </div>
                    <div className="text-right flex-shrink-0 max-w-[40%]">
                      <p className="text-[10px] font-black text-gray-700 leading-tight">{c.distance}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">정산</span>
                      <span className="text-gray-700">{c.settlement}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">마진</span>
                      <span className="text-gray-700">{c.margin}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">강점</span>
                      <span className={`${c.isPrimary ? 'text-wasabi-800 font-bold' : 'text-gray-700'}`}>{c.usp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-1">
            💡 채널별 수수료·정산 조건은 계약 시점에 확정됩니다. 실제 거래 데이터가 쌓이면 갱신하세요.
          </p>
        </section>

        {/* ═══ 재무 시뮬레이션 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-line-chart-line text-purple-500" aria-hidden="true" />
              재무 시뮬레이션
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">출하 달성률·매출·원가 시나리오 3종 비교</p>
          </div>

          {/* 시나리오 탭 */}
          <div className="flex gap-2 mb-3">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                  scenarioId === s.id ? `${s.bg} ${s.color} ${s.border} shadow-md` : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* 시나리오 카드 */}
          <div className={`rounded-3xl shadow-sm border-2 p-5 ${activeScenario.bg} ${activeScenario.border}`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold">출하 달성률</p>
                <p className="text-xl font-black text-gray-900" translate="no">{activeScenario.shipRate}%</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold">월 매출</p>
                <p className="text-xl font-black text-gray-900" translate="no">{fmtWon(activeScenario.monthlyRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold">월 원가</p>
                <p className="text-xl font-black text-gray-900" translate="no">{fmtWon(activeScenario.monthlyCost)}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold">월 순이익</p>
                <p className={`text-xl font-black ${monthlyProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`} translate="no">
                  {monthlyProfit >= 0 ? fmtWon(monthlyProfit) : `-${fmtWon(Math.abs(monthlyProfit))}`}
                </p>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-3 space-y-2 border border-white">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600 font-bold">연 순이익</span>
                <span className={`font-black ${annualProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`} translate="no">
                  {annualProfit >= 0 ? fmtWon(annualProfit) : `-${fmtWon(Math.abs(annualProfit))}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600 font-bold">ROI (연)</span>
                <span className="font-black text-gray-900" translate="no">{roiPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600 font-bold">BEP 회수 기간</span>
                <span className="font-black text-gray-900" translate="no">
                  {bepMonths === Infinity ? '—' : bepMonths > 120 ? '120개월 초과' : `${bepMonths}개월 (${(bepMonths / 12).toFixed(1)}년)`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-bold">초기 투자 (토지 포함 총사업비)</span>
                <span className="font-black text-gray-900" translate="no">{fmtWon(INITIAL_INVESTMENT)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-bold">└ 시설 투자만 (위 시뮬레이터 산출)</span>
                <span className="font-black text-gray-600" translate="no">{fmtWon(sim.totalInvest)}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                ※ 위 ROI·BEP 는 토지 포함 총사업비 {fmtWon(INITIAL_INVESTMENT)} 기준입니다.
                시설 투자만으로 보려면 시뮬레이터 산출액 {fmtWon(sim.totalInvest)} 을 기준으로 다시 읽어 주세요.
              </p>
            </div>

            <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
              💡 시나리오는 단순 가정치입니다. 실제 운영 데이터(월별 출하량, 계절 변동, 인건비, 감가상각)가 쌓이면 더 정확한 예측이 가능합니다.
            </p>
          </div>
        </section>

        {/* ═══ 심화 분석 링크 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900">심화 분석 페이지</h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <Link to="/profit-analysis" className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-bar-chart-box-line text-white text-xl" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">수익성 분석</p>
                <p className="text-[11px] text-gray-500 leading-tight">작물별 ROI · 원가 · 판매가 계산기</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400" aria-hidden="true" />
            </Link>
            <Link to="/facility-design" className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-building-line text-white text-xl" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">시설 설비 설계</p>
                <p className="text-[11px] text-gray-500 leading-tight">하우스 종류별 평당 비용 시뮬레이터</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400" aria-hidden="true" />
            </Link>
            <Link to="/price-trends" className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-line-chart-line text-white text-xl" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">KAMIS 시세 동향</p>
                <p className="text-[11px] text-gray-500 leading-tight">가락시장 경락가 그래프·과거 비교</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400" aria-hidden="true" />
            </Link>
            <Link to="/smart-farm-data" className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-cpu-line text-white text-xl" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">스마트팜 실시간 데이터</p>
                <p className="text-[11px] text-gray-500 leading-tight">온·습도·CO₂·EC·pH 센서 대시보드</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* 안내 카드 */}
        <section>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <i className="ri-information-line text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-blue-900 mb-1">사업자 전용 페이지 안내</p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  이 페이지는 <b>관리자 로그인 후에만 접근</b>할 수 있으며, 일반 고객 앱에서는 노출되지 않습니다.
                  시세·비교·시뮬레이션 데이터는 현재 추정치이며, 실제 운영 데이터(출하·매출·원가)가 쌓이면
                  자동으로 갱신되도록 Supabase 연동 후 고도화 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
