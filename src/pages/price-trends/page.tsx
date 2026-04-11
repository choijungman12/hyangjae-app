import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';
import { CROP_MARKET_DETAILS, VOLATILITY_META } from '@/data/cropMarketInfo';
import {
  getCropPrice,
  getSupportedCropIds,
  clearPriceCache,
  KAMIS_CONFIGURED,
  type CropPriceInfo,
} from '@/lib/kamisApi';

type Period = '7d' | '14d' | '30d';

export default function PriceTrends() {
  const scrollY = useScrollY();
  const [cropId, setCropId] = useState<string>('wasabi');
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<CropPriceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allCrops, setAllCrops] = useState<CropPriceInfo[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | '엽채류' | '과채류' | '근채류' | '허브류'>('all');
  const heroRef = useRef<HTMLDivElement | null>(null);

  const loadAllCrops = useCallback(async () => {
    const ids = getSupportedCropIds();
    const results = await Promise.all(ids.map(id => getCropPrice(id)));
    setAllCrops(results);
  }, []);

  const loadPriceData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await getCropPrice(id);
      setData(result);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로딩 - 한 번만 전체 작물 리스트 로드
  useEffect(() => {
    loadAllCrops();
  }, [loadAllCrops]);

  // 선택 작물 변경 시 해당 작물만 재조회
  useEffect(() => {
    loadPriceData(cropId);
  }, [cropId, loadPriceData]);

  // 작물 선택 핸들러 (상단 스크롤 포함)
  const handleSelectCrop = useCallback((id: string) => {
    if (id === cropId) return;
    setCropId(id);
    // 히어로 카드까지 부드럽게 스크롤
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [cropId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearPriceCache();
    await loadAllCrops();
    await loadPriceData(cropId);
    setTimeout(() => setRefreshing(false), 500);
  };

  /* ── 그래프 데이터 ── */
  const periodDays = period === '7d' ? 7 : period === '14d' ? 14 : 30;
  const chartData = data ? data.history.slice(-periodDays) : [];

  const prices = chartData.map(d => d.wholesale);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = maxPrice - minPrice || 1;

  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];
  const changeAmount = latest && previous ? latest.wholesale - previous.wholesale : 0;
  const changePercent = previous ? (changeAmount / previous.wholesale) * 100 : 0;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // 30일 고점/저점
  const allPrices = data ? data.history.map(d => d.wholesale) : [];
  const periodHigh = allPrices.length ? Math.max(...allPrices) : 0;
  const periodLow = allPrices.length ? Math.min(...allPrices) : 0;

  // SVG 경로
  const chartWidth = 320;
  const chartHeight = 160;
  const padding = 20;
  const innerW = chartWidth - padding * 2;
  const innerH = chartHeight - padding * 2;

  const pathD = chartData.length > 0
    ? chartData.map((d, i) => {
        const x = padding + (i / (chartData.length - 1)) * innerW;
        const y = padding + (1 - (d.wholesale - minPrice) / priceRange) * innerH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  const areaD = chartData.length > 0
    ? `${pathD} L ${padding + innerW} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`
    : '';

  // 현재 선택 작물의 상세 정보
  const detail = CROP_MARKET_DETAILS[cropId];
  const filteredCrops = categoryFilter === 'all'
    ? allCrops
    : allCrops.filter(c => CROP_MARKET_DETAILS[c.cropId]?.category === categoryFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-24 overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${-scrollY * 0.2}px)` }} />
      </div>

      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">가격 동향</h1>
          <button
            onClick={handleRefresh}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transition-all"
            disabled={refreshing}
          >
            <i className={`ri-refresh-line text-xl text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 데이터 소스 배지 */}
      <section className="px-4 pt-4 relative z-10">
        <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${data?.source === 'kamis' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${data?.source === 'kamis' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
            <i className={`${data?.source === 'kamis' ? 'ri-cloud-line' : 'ri-database-2-line'} text-white text-lg`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black ${data?.source === 'kamis' ? 'text-emerald-900' : 'text-amber-900'}`}>
              {data?.source === 'kamis' ? 'KAMIS 실시간 시세 연동 중' : '시세 참고 데이터 (목업)'}
            </p>
            <p className={`text-[11px] ${data?.source === 'kamis' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {KAMIS_CONFIGURED
                ? '가락시장 + 전국 도매시장 경락가 기준'
                : 'KAMIS API 연동 전 · 2025년 평균 시세 기반'}
            </p>
          </div>
          {data && (
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-500">업데이트</p>
              <p className="text-[10px] font-bold text-gray-700">{new Date(data.updatedAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ 히어로 가격 카드 ═══════ */}
      <section className="px-4 pt-4 relative z-10" ref={heroRef}>
        {loading || !data || !latest ? (
          <div className="h-52 bg-white/80 rounded-3xl flex items-center justify-center border border-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-bold">시세 로딩 중...</p>
            </div>
          </div>
        ) : (
          <div className={`relative bg-gradient-to-br ${CROP_VISUAL[cropId]?.gradient ?? 'from-blue-500 to-indigo-600'} rounded-3xl p-6 text-white shadow-2xl overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/70 font-bold mb-1">{detail?.category ?? ''} · 도매가 (원/kg)</p>
                  <h2 className="text-2xl font-black mb-1 drop-shadow-lg truncate">{data.cropName}</h2>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-4xl font-black drop-shadow-lg">{latest.wholesale.toLocaleString()}</p>
                    <p className="text-sm text-white/80 font-bold">원</p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${changeAmount >= 0 ? 'bg-red-500/30' : 'bg-blue-500/30'} backdrop-blur-md border border-white/30`}>
                    <i className={`${changeAmount >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`} />
                    <span className="text-xs font-black">
                      {changeAmount >= 0 ? '+' : ''}{changeAmount.toLocaleString()}원 ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl flex-shrink-0">
                  <span className="text-5xl">{CROP_VISUAL[cropId]?.emoji ?? '🌱'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '도매가', value: latest.wholesale, icon: 'ri-store-2-line' },
                  { label: '경매가', value: latest.auction ?? 0, icon: 'ri-auction-line' },
                  { label: '소매가', value: latest.retail, icon: 'ri-shopping-cart-line' },
                ].map(item => (
                  <div key={item.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                    <i className={`${item.icon} text-base mb-1`} />
                    <p className="text-sm font-black">{item.value.toLocaleString()}</p>
                    <p className="text-[10px] text-white/70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════ 그래프 ═══════ */}
      <section className="px-4 pt-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <i className="ri-line-chart-line text-blue-500" />
              가격 동향 그래프
            </h3>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['7d', '14d', '30d'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${period === p ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  {p === '7d' ? '7일' : p === '14d' ? '14일' : '30일'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="relative">
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                  {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const y = padding + ratio * innerH;
                    const val = Math.round(maxPrice - ratio * priceRange);
                    // 한국 원화 단위 축약: 만원 / 천원
                    const label = val >= 10000
                      ? `${(val / 10000).toFixed(val >= 100000 ? 0 : 1)}만`
                      : `${(val / 1000).toFixed(0)}천`;
                    return (
                      <g key={ratio}>
                        <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e5e7eb" strokeDasharray="2 2" />
                        <text x={padding - 4} y={y + 3} fontSize="8" textAnchor="end" fill="#9ca3af" fontWeight="bold">
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill="url(#areaGradient)" />
                  <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {chartData.map((d, i) => {
                    const x = padding + (i / (chartData.length - 1)) * innerW;
                    const y = padding + (1 - (d.wholesale - minPrice) / priceRange) * innerH;
                    const isLast = i === chartData.length - 1;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={isLast ? 5 : 2} fill="white" stroke="#3b82f6" strokeWidth={isLast ? 3 : 1.5} />
                        {isLast && <circle cx={x} cy={y} r="10" fill="#3b82f6" opacity="0.2" className="animate-ping" />}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between mt-2 px-5">
                {chartData.length > 0 && (
                  <>
                    <span className="text-[10px] text-gray-400 font-bold">{chartData[0].date.slice(5)}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{chartData[Math.floor(chartData.length / 2)].date.slice(5)}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{chartData[chartData.length - 1].date.slice(5)}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold">기간 최고</p>
                  <p className="text-sm font-black text-red-500">{maxPrice.toLocaleString()}원</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold">평균가</p>
                  <p className="text-sm font-black text-blue-600">{Math.round(avgPrice).toLocaleString()}원</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold">기간 최저</p>
                  <p className="text-sm font-black text-emerald-600">{minPrice.toLocaleString()}원</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════ 작물 상세 정보 ═══════ */}
      {detail && !loading && (
        <>
          {/* 기본 정보 카드 */}
          <section className="px-4 pt-5 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className={`px-5 py-4 bg-gradient-to-r ${CROP_VISUAL[cropId]?.gradient ?? 'from-blue-500 to-indigo-500'} text-white`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-md">
                    <i className="ri-file-text-line text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">{detail.koreanName} 상세 정보</h3>
                    <p className="text-[11px] text-white/80 italic">{detail.scientificName} · {detail.family}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { icon: 'ri-map-pin-line',    label: '주요 산지',    value: detail.origin,     color: 'blue' },
                  { icon: 'ri-calendar-check-line', label: '출하 성수기', value: detail.peakSeason, color: 'emerald' },
                  { icon: 'ri-calendar-close-line', label: '출하 비수기', value: detail.lowSeason, color: 'amber' },
                  { icon: 'ri-scales-3-line',   label: '거래 단위',    value: detail.unit,       color: 'purple' },
                  { icon: 'ri-fridge-line',     label: '저장성',       value: detail.shelfLife,  color: 'cyan' },
                  { icon: 'ri-flashlight-line', label: '가격 변동성', value: `${VOLATILITY_META[detail.volatility].label} (${VOLATILITY_META[detail.volatility].desc})`, color: VOLATILITY_META[detail.volatility].color },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className={`${item.icon} text-${item.color}-500 text-sm`} />
                      <p className="text-[10px] font-black text-gray-500">{item.label}</p>
                    </div>
                    <p className="text-[11px] font-black text-gray-800 leading-snug">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 30일 고점·저점 */}
          <section className="px-4 pt-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                    <i className="ri-arrow-up-line text-white" />
                  </div>
                  <p className="text-[11px] font-black text-red-700">30일 최고가</p>
                </div>
                <p className="text-lg font-black text-red-600">{periodHigh.toLocaleString()}원</p>
                <p className="text-[10px] text-red-500 mt-0.5">/kg 기준</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                    <i className="ri-arrow-down-line text-white" />
                  </div>
                  <p className="text-[11px] font-black text-emerald-700">30일 최저가</p>
                </div>
                <p className="text-lg font-black text-emerald-600">{periodLow.toLocaleString()}원</p>
                <p className="text-[10px] text-emerald-500 mt-0.5">/kg 기준</p>
              </div>
            </div>
          </section>

          {/* 가격 동향 해설 */}
          <section className="px-4 pt-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-lightbulb-flash-line text-yellow-500" />
                시장 분석 & 거래 인사이트
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-line-chart-line text-blue-600" />
                    <p className="text-xs font-black text-blue-900">가격 동향 해설</p>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">{detail.priceInsight}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-store-2-line text-purple-600" />
                    <p className="text-xs font-black text-purple-900">유통 특이사항</p>
                  </div>
                  <p className="text-xs text-purple-800 leading-relaxed">{detail.marketNotes}</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-shopping-bag-3-line text-emerald-600" />
                    <p className="text-xs font-black text-emerald-900">거래 팁</p>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">{detail.tradingTip}</p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-heart-pulse-line text-amber-600" />
                    <p className="text-xs font-black text-amber-900">영양 특징</p>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">{detail.nutritionHighlight}</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════ 작물 선택 리스트 ═══════ */}
      <section className="px-4 pt-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <i className="ri-plant-line text-blue-500" />
            작물별 시세 ({filteredCrops.length}종)
          </h3>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
          {(['all', '엽채류', '과채류', '근채류', '허브류'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {cat === 'all' ? '전체' : cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredCrops.map(crop => {
            const isSelected = crop.cropId === cropId;
            const latestPrice = crop.history[crop.history.length - 1];
            const prev = crop.history[crop.history.length - 2];
            const change = latestPrice && prev ? latestPrice.wholesale - prev.wholesale : 0;
            const changePct = prev ? (change / prev.wholesale) * 100 : 0;
            const d = CROP_MARKET_DETAILS[crop.cropId];

            // 미니 스파크라인
            const mini = crop.history.slice(-14);
            const mPrices = mini.map(d => d.wholesale);
            const mMin = Math.min(...mPrices);
            const mMax = Math.max(...mPrices);
            const mRange = mMax - mMin || 1;
            const mPath = mini.map((d, i) => {
              const x = (i / (mini.length - 1)) * 60;
              const y = 20 - ((d.wholesale - mMin) / mRange) * 20;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');

            return (
              <button
                key={crop.cropId}
                onClick={() => handleSelectCrop(crop.cropId)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left active:scale-[0.99] ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${CROP_VISUAL[crop.cropId]?.gradient ?? 'from-gray-300 to-gray-400'} shadow-md`}>
                  <span className="text-2xl">{CROP_VISUAL[crop.cropId]?.emoji ?? '🌱'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-gray-900 truncate">{crop.cropName}</p>
                    {isSelected && <i className="ri-check-double-line text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {d?.category ?? ''} · {latestPrice?.wholesale.toLocaleString()}원/kg
                  </p>
                </div>
                <svg width="60" height="20" className="flex-shrink-0">
                  <path d={mPath} fill="none" stroke={change >= 0 ? '#ef4444' : '#3b82f6'} strokeWidth="1.5" />
                </svg>
                <div className="text-right flex-shrink-0 min-w-[58px]">
                  <p className={`text-xs font-black ${change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {change >= 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(1)}%
                  </p>
                </div>
              </button>
            );
          })}
          {filteredCrops.length === 0 && (
            <div className="py-10 text-center bg-white/60 rounded-2xl">
              <p className="text-sm text-gray-400 font-bold">해당 카테고리에 작물이 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* 안내 */}
      <section className="px-4 pt-5 pb-6 relative z-10">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex gap-3">
            <i className="ri-information-line text-indigo-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-indigo-900 mb-1">데이터 안내</p>
              <ul className="text-[11px] text-indigo-700 space-y-1 leading-relaxed">
                <li>• 데이터는 매일 자정 자동 업데이트됩니다 (24시간 캐시)</li>
                <li>• 도매가는 가락시장 · 전국 공영도매시장 경락가 기준</li>
                <li>• 고추냉이·바질·민트는 국내 유통량이 적어 전문 시세 참조</li>
                <li>• 계절·작황에 따라 실제 가격과 차이가 있을 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
