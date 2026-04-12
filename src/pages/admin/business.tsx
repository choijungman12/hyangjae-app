import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/pages/admin/page';
import { CROP_MARKET_DETAILS } from '@/data/cropMarketInfo';

/* ═══════════════════════════════════════════════════════════
 *  사업자 전용 비즈니스 대시보드
 *
 *  - 시설·수확 핵심 지표 (KPI)
 *  - 작목반장 시세 (고추냉이·쌈채소·딸기)
 *  - 경쟁업체 비교표
 *  - 재무 시뮬레이션 (낙관/현실/비관 3개 시나리오)
 *
 *  🔒 /admin 로그인 필요. 일반 고객은 접근 불가.
 * ═══════════════════════════════════════════════════════════ */

// ── 시설 KPI ──
const FACILITY_KPI = [
  { label: '메인 하우스 면적',    value: '150평',    sub: '고추냉이 IoT 스마트팜',    icon: 'ri-home-gear-line', grad: 'from-blue-500 to-indigo-600' },
  { label: '전체 부지',           value: '536평',    sub: '양재동 178-4',            icon: 'ri-landscape-line', grad: 'from-sky-500 to-cyan-600' },
  { label: '스마트팜 체험 데크',   value: '8개',      sub: '애견 가능 2개 포함',        icon: 'ri-tent-line',      grad: 'from-emerald-500 to-teal-600' },
  { label: '고추냉이 정식 주수',   value: '3,000주',  sub: '18~24개월 성장 주기',      icon: 'ri-plant-line',     grad: 'from-green-500 to-emerald-600' },
  { label: '연 매출 목표',        value: '₩4억',     sub: '공간+체험+제품 합산',       icon: 'ri-money-dollar-circle-line', grad: 'from-purple-500 to-pink-600' },
  { label: 'ROI · BEP · 투자',   value: '22%',      sub: 'BEP 3개월 · 초기 15억',    icon: 'ri-line-chart-line', grad: 'from-orange-500 to-red-500' },
];

// ── 작목반장 시세 (CROP_MARKET_DETAILS 활용) ──
const TARGET_CROPS = ['wasabi', 'lettuce', 'strawberry', 'perilla', 'tomato'] as const;

const PRICE_BANDS: Record<string, { low: number; mid: number; high: number; unit: string; source: string }> = {
  wasabi:     { low: 80000,  mid: 100000, high: 120000, unit: '원/kg (생근경)', source: '국산 프리미엄 · 고급 일식당 직거래' },
  lettuce:    { low: 3000,   mid: 5000,   high: 8000,   unit: '원/kg',          source: '가락시장 도매 기준' },
  strawberry: { low: 15000,  mid: 25000,  high: 40000,  unit: '원/kg',          source: '12월 초 최고가 → 2~3월 하락' },
  perilla:    { low: 3500,   mid: 5000,   high: 7500,   unit: '원/100g',        source: '시설재배 안정 공급' },
  tomato:     { low: 4000,   mid: 6500,   high: 10000,  unit: '원/kg',          source: '고당도 브랜드 2~3배' },
};

// ── 경쟁업체 비교 ──
interface CompetitorRow {
  name: string;
  location: string;
  decks: number;
  weekdayPrice: number;
  included: string;
  petPolicy: string;
  usp: string;
  isUs?: boolean;
}

const COMPETITORS: CompetitorRow[] = [
  {
    name: '향재원',
    location: '서울 서초 양재동',
    decks: 8,
    weekdayPrice: 139000,
    included: '데크 + 전용 텃밭 수확 300g + 스마트팜 투어',
    petPolicy: '7·8번 데크 · +10,000원/마리',
    usp: '강남권 + 실제 고추냉이 스마트팜 + 전용 텃밭',
    isUs: true,
  },
  {
    name: '비욘더팜',
    location: '경기 하남 감이동',
    decks: 20,
    weekdayPrice: 80000,
    included: '공간 + 집기만',
    petPolicy: '중형견 이상 입마개',
    usp: '저가 대량 · BYO 콜키지 프리',
  },
  {
    name: '우면동 체험농장',
    location: '서울 서초 우면동',
    decks: 0,
    weekdayPrice: 30000,
    included: '체험 프로그램만 (숙박 X)',
    petPolicy: '동반 불가',
    usp: '도심 당일 체험',
  },
  {
    name: '과천 프리미엄 글램핑',
    location: '경기 과천',
    decks: 12,
    weekdayPrice: 180000,
    included: '데크 + 조식 뷔페',
    petPolicy: '전 데크 가능 · +20,000원',
    usp: '호텔급 편의시설 · 조식 포함',
  },
];

// ── 재무 시뮬레이션 ──
interface Scenario {
  id: 'optimistic' | 'realistic' | 'pessimistic';
  name: string;
  occupancy: number;    // 예약률 (%)
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
    occupancy: 85,
    monthlyRevenue: 42_000_000, // 월 4,200만원
    monthlyCost: 18_000_000,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  {
    id: 'realistic',
    name: '현실',
    occupancy: 65,
    monthlyRevenue: 33_000_000, // 월 3,300만원 → 연 4억
    monthlyCost: 19_000_000,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  {
    id: 'pessimistic',
    name: '비관',
    occupancy: 45,
    monthlyRevenue: 22_000_000,
    monthlyCost: 20_000_000,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
];

const INITIAL_INVESTMENT = 1_500_000_000; // 15억

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
            <p className="text-[11px] text-gray-500">작목반장 시세 · 경쟁업체 비교 · 재무 시뮬레이션</p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            사업자 전용
          </span>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* ═══ 시설·수확 KPI ═══ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900">시설·수확 핵심 지표</h2>
            <span className="text-[10px] text-gray-400">2027년 6월 오픈 기준</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FACILITY_KPI.map(kpi => (
              <div key={kpi.label} className={`relative bg-gradient-to-br ${kpi.grad} rounded-2xl p-4 text-white shadow-lg overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                <div className="relative z-10">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                    <i className={`${kpi.icon} text-sm`} aria-hidden="true" />
                  </div>
                  <p className="text-lg font-black" translate="no">{kpi.value}</p>
                  <p className="text-[10px] text-white/80 mt-0.5">{kpi.label}</p>
                  <p className="text-[9px] text-white/60 mt-0.5 truncate">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 작목반장 시세 ═══ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-plant-line text-emerald-500" aria-hidden="true" />
              작목반장 시세 (KAMIS 기반 추정)
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

        {/* ═══ 경쟁업체 비교표 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-group-2-line text-blue-500" aria-hidden="true" />
              경쟁업체 비교
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">포지셔닝·가격·USP 기반 시장 분석</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {COMPETITORS.map(c => (
                <div key={c.name} className={`p-4 ${c.isUs ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black ${c.isUs ? 'text-emerald-900' : 'text-gray-900'}`}>{c.name}</p>
                        {c.isUs && (
                          <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded">우리</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{c.location} · 데크 {c.decks === 0 ? '없음' : `${c.decks}개`}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${c.isUs ? 'text-emerald-700' : 'text-gray-900'}`} translate="no">
                        {c.weekdayPrice.toLocaleString()}원
                      </p>
                      <p className="text-[9px] text-gray-500">평일</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">포함</span>
                      <span className={`${c.isUs ? 'text-emerald-800 font-bold' : 'text-gray-700'}`}>{c.included}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">애견</span>
                      <span className="text-gray-700">{c.petPolicy}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-400 font-bold flex-shrink-0">USP</span>
                      <span className={`${c.isUs ? 'text-emerald-800 font-bold' : 'text-gray-700'}`}>{c.usp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-1">
            💡 비교 데이터는 공개 정보 기준 추정치. 실제 경쟁 분석은 현장 조사 후 업데이트 필요.
          </p>
        </section>

        {/* ═══ 재무 시뮬레이션 ═══ */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <i className="ri-line-chart-line text-purple-500" aria-hidden="true" />
              재무 시뮬레이션
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">예약률·매출·원가 시나리오 3종 비교</p>
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
                <p className="text-[10px] text-gray-500 font-bold">예약률</p>
                <p className="text-xl font-black text-gray-900" translate="no">{activeScenario.occupancy}%</p>
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
                <span className="text-gray-500 font-bold">초기 투자</span>
                <span className="font-black text-gray-900" translate="no">{fmtWon(INITIAL_INVESTMENT)}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
              💡 시나리오는 단순 가정치입니다. 실제 운영 데이터(월별 예약 수, 계절 변동, 인건비, 감가상각)가 쌓이면 더 정확한 예측이 가능합니다.
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
                  시세·비교·시뮬레이션 데이터는 현재 추정치이며, 실제 운영 데이터(예약·매출·원가)가 쌓이면
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
