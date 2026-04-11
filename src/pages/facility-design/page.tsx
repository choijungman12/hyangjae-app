import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';

// ─────────────────────────────────────────────
// 실제 시장 단가 데이터 (2025~2026년 기준)
// 출처: 농림축산식품부, 한국농업기술진흥원, 고창군 기준단가 고시
// ─────────────────────────────────────────────
const FACILITY_TYPES = [
  {
    id: 'vinyl',
    name: '비닐하우스',
    sub: '연동 파이프 구조',
    icon: 'ri-home-4-line',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-300',
    costPerPyeong: 250000,        // 연동형 평균 25만원/평
    costRange: '20~30만원/평',
    pros: ['초기 투자 최소', '빠른 시공(2~4주)', '정부 보조 용이'],
    cons: ['단열 취약', '내구성 15~20년', '폭설·강풍 취약'],
    source: '2026 농림부 비닐하우스 표준 기준단가',
  },
  {
    id: 'truss',
    name: '트러스하우스',
    sub: 'H빔 + 폴리카보네이트(렉산)',
    icon: 'ri-home-gear-line',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    costPerPyeong: 650000,        // H빔+PC 기준 65만원/평
    costRange: '50~80만원/평',
    pros: ['우수한 내재해성', '건축허가 면제(농업용)', '단열·차광 우수'],
    cons: ['비닐 대비 3~4배 비용', '시공기간 4~8주'],
    source: '2026 H빔 경량철골 온실 시장 평균가',
    recommended: true,
  },
  {
    id: 'glass',
    name: '유리온실',
    sub: '알루미늄 프레임 + 복층유리',
    icon: 'ri-building-2-line',
    color: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    costPerPyeong: 1100000,       // 90~130만원/평, 평균 110만원
    costRange: '90~130만원/평',
    pros: ['최고 수준 채광', '고급 이미지', '내구성 30년 이상'],
    cons: ['높은 초기 비용', '파손 위험', '여름 과열 관리 필요'],
    source: '2026 유리온실 시공업체 평균 견적가',
  },
  {
    id: 'passive',
    name: '패시브하우스',
    sub: '고단열·기밀 에너지절약형',
    icon: 'ri-home-smile-line',
    color: 'from-purple-400 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    costPerPyeong: 2000000,       // 150~250만원/평, 평균 200만원
    costRange: '150~250만원/평',
    pros: ['에너지비 60~80% 절감', '사계절 안정 재배', '탄소중립 적합'],
    cons: ['초기 투자 최대', '설계·시공 전문성 필요', '표준화 미확립'],
    source: '농식품부 에너지절약형 온실 시범사업 단가',
  },
] as const;

type FacilityId = typeof FACILITY_TYPES[number]['id'];

const SMART_LEVELS = [
  {
    id: 'basic',
    name: '기초형',
    sub: '단순 IoT · 원격 모니터링',
    costPerPyeong: 50000,    // 5만원/평 (700만/150평 환산)
    icon: 'ri-wifi-line',
    color: 'text-gray-600',
    features: ['온·습도 센서', '원격 모니터링', '수동 제어'],
  },
  {
    id: 'standard',
    name: '표준형',
    sub: '복합환경제어 · 자동 관수',
    costPerPyeong: 200000,   // 20만원/평 (농식품부 ICT 융복합 표준사업비 2,000만/1,000평)
    icon: 'ri-settings-3-line',
    color: 'text-blue-600',
    features: ['CO2·광량 제어', '자동 개폐·관수', '데이터 분석'],
    recommended: true,
  },
  {
    id: 'advanced',
    name: '첨단형',
    sub: 'AI 자동화 · 무인 관리',
    costPerPyeong: 400000,   // 40만원/평
    icon: 'ri-robot-line',
    color: 'text-purple-600',
    features: ['AI 생육 예측', '완전 자동화', '클라우드 연동'],
  },
];

type SmartId = typeof SMART_LEVELS[number]['id'];

const CULTIVATION_TYPES = [
  { id: 'soil',       name: '토경재배',  icon: 'ri-plant-line',   costPerPyeong: 0,      desc: '일반 토양 재배' },
  { id: 'hydroponic', name: '수경재배',  icon: 'ri-drop-line',    costPerPyeong: 150000, desc: '양액시스템 포함 (평균 15만/평)' },
  { id: 'vertical',   name: '수직농장',  icon: 'ri-stack-line',   costPerPyeong: 500000, desc: '다층 선반+LED (평균 50만/평)' },
];

type CultivationId = typeof CULTIVATION_TYPES[number]['id'];

const SUBSIDY_OPTIONS = [
  { id: 'none',   name: '보조 없음',    rate: 0,    desc: '자비 전액 부담' },
  { id: 'ict',    name: 'ICT 스마트팜', rate: 0.60, desc: '국고30%+지방30% · 자부담 40%' },
  { id: 'youth',  name: '청년농업인',   rate: 0.80, desc: 'ICT보조 + 청년 추가 · 자부담 20%' },
];

type SubsidyId = typeof SUBSIDY_OPTIONS[number]['id'];

const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR');
const fmtM = (n: number) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000000)  return `${(n / 10000000).toFixed(0)}천만원`;
  return `${fmt(n)}원`;
};

export default function FacilityDesign() {
  const [areaUnit, setAreaUnit] = useState<'pyeong' | 'sqm'>('pyeong');
  const [areaInput, setAreaInput] = useState('150');
  const [facilityType, setFacilityType] = useState<FacilityId>('truss');
  const [smartLevel, setSmartLevel] = useState<SmartId>('standard');
  const [cultivationType, setCultivationType] = useState<CultivationId>('hydroponic');
  const [subsidyType, setSubsidyType] = useState<SubsidyId>('none');
  const [showResult, setShowResult] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // 면적 계산
  const rawArea = parseFloat(areaInput) || 150;
  const areaPyeong = areaUnit === 'pyeong' ? rawArea : rawArea / 3.3;
  const areaSqm    = areaUnit === 'sqm'    ? rawArea : rawArea * 3.3;

  const facility   = FACILITY_TYPES.find(f => f.id === facilityType)!;
  const smart      = SMART_LEVELS.find(s => s.id === smartLevel)!;
  const cultivation = CULTIVATION_TYPES.find(c => c.id === cultivationType)!;
  const subsidy    = SUBSIDY_OPTIONS.find(s => s.id === subsidyType)!;

  const buildCost    = areaPyeong * facility.costPerPyeong;
  const smartCost    = areaPyeong * smart.costPerPyeong;
  const cultivCost   = areaPyeong * cultivation.costPerPyeong;
  const electricCost = areaPyeong * 80000;    // 전기/기계설비 8만원/평
  const subTotal     = buildCost + smartCost + cultivCost + electricCost;
  const permitCost   = subTotal * 0.03;       // 인허가·설계비 3%
  const contingency  = subTotal * 0.05;       // 예비비 5%
  const totalCost    = subTotal + permitCost + contingency;
  const subsidyAmt   = totalCost * subsidy.rate;
  const selfPay      = totalCost - subsidyAmt;

  const costItems = [
    { label: '시설 골조·구조',      amount: buildCost,    icon: 'ri-building-line',   color: 'blue',   note: `${facility.name} ${facility.costRange}` },
    { label: 'IoT·환경제어 시스템', amount: smartCost,    icon: 'ri-cpu-line',         color: 'indigo', note: `${smart.name} 기준` },
    { label: '재배 시스템',          amount: cultivCost,   icon: 'ri-plant-line',       color: 'emerald', note: cultivation.desc },
    { label: '전기·기계설비',       amount: electricCost,  icon: 'ri-flashlight-line',  color: 'yellow', note: '전기배선·배관·냉난방 8만원/평' },
    { label: '인허가·설계비',       amount: permitCost,    icon: 'ri-file-text-line',   color: 'orange', note: '건축설계 + 인허가 (공사비 3%)' },
    { label: '예비비',               amount: contingency,  icon: 'ri-tools-line',       color: 'gray',   note: '공사비 변동 대비 (5%)' },
  ];

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-100 text-blue-600',
    indigo:  'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    yellow:  'bg-yellow-100 text-yellow-600',
    orange:  'bg-orange-100 text-orange-600',
    gray:    'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="시설 설비 견적" subtitle="2025~2026년 실제 시장 단가 기준" />

      {/* 면적 입력 */}
      <section className="px-4 pt-5 pb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="ri-ruler-line text-blue-500" />
            재배 면적 입력
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setAreaUnit('pyeong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${areaUnit === 'pyeong' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >평 (坪)</button>
            <button
              onClick={() => setAreaUnit('sqm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${areaUnit === 'sqm' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >㎡</button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={areaInput}
              onChange={e => setAreaInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
            />
            <span className="text-sm font-bold text-gray-500">{areaUnit === 'pyeong' ? '평' : '㎡'}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            = 약 {areaUnit === 'pyeong' ? `${Math.round(areaSqm)}㎡` : `${Math.round(areaPyeong)}평`}
            　·　향재원 기준: 150평 (495㎡)
          </p>
        </div>
      </section>

      {/* 시설 유형 선택 */}
      <section className="px-4 pb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-home-gear-line text-blue-500" />
          시설 유형
        </h3>
        <div className="space-y-2">
          {FACILITY_TYPES.map(f => (
            <button
              key={f.id}
              onClick={() => setFacilityType(f.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                facilityType === f.id
                  ? `${f.border} bg-white shadow-md`
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${f.icon} text-white text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{f.name}</p>
                    {f.recommended && (
                      <span className="text-[10px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">추천</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{f.sub}</p>
                  <p className="text-sm font-black text-blue-600">{f.costRange}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">평당 기준 · {f.source}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  facilityType === f.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {facilityType === f.id && <i className="ri-check-line text-white text-xs" />}
                </div>
              </div>
              {facilityType === f.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <p className="text-[10px] text-emerald-600 font-bold mb-0.5">장점</p>
                    {f.pros.map(p => <p key={p} className="text-[10px] text-gray-600">✓ {p}</p>)}
                  </div>
                  <div>
                    <p className="text-[10px] text-red-500 font-bold mb-0.5">단점</p>
                    {f.cons.map(c => <p key={c} className="text-[10px] text-gray-600">· {c}</p>)}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 스마트팜 레벨 */}
      <section className="px-4 pb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-cpu-line text-indigo-500" />
          스마트팜 수준
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SMART_LEVELS.map(s => (
            <button
              key={s.id}
              onClick={() => setSmartLevel(s.id)}
              className={`rounded-2xl p-3 border-2 transition-all text-left ${
                smartLevel === s.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <i className={`${s.icon} text-base ${smartLevel === s.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {s.recommended && <span className="text-[9px] bg-indigo-500 text-white px-1 rounded-full font-bold">추천</span>}
              </div>
              <p className={`text-xs font-black ${smartLevel === s.id ? 'text-indigo-700' : 'text-gray-700'}`}>{s.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.sub}</p>
              <p className={`text-xs font-bold mt-1 ${smartLevel === s.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                +{(s.costPerPyeong / 10000).toFixed(0)}만/평
              </p>
            </button>
          ))}
        </div>
        {smartLevel !== 'basic' && (
          <div className="mt-2 bg-indigo-50 rounded-xl px-3 py-2 flex flex-wrap gap-2">
            {SMART_LEVELS.find(s => s.id === smartLevel)?.features.map(f => (
              <span key={f} className="text-[10px] bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">{f}</span>
            ))}
          </div>
        )}
      </section>

      {/* 재배 방식 */}
      <section className="px-4 pb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-plant-line text-emerald-500" />
          재배 방식
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {CULTIVATION_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => setCultivationType(c.id)}
              className={`rounded-2xl p-3 border-2 transition-all text-left ${
                cultivationType === c.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <i className={`${c.icon} text-lg block mb-1.5 ${cultivationType === c.id ? 'text-emerald-600' : 'text-gray-400'}`} />
              <p className={`text-xs font-black ${cultivationType === c.id ? 'text-emerald-700' : 'text-gray-700'}`}>{c.name}</p>
              <p className={`text-xs font-bold mt-1 ${cultivationType === c.id ? 'text-emerald-600' : 'text-gray-500'}`}>
                {c.costPerPyeong === 0 ? '추가 없음' : `+${(c.costPerPyeong / 10000).toFixed(0)}만/평`}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 정부 보조금 */}
      <section className="px-4 pb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-government-line text-orange-500" />
          정부 보조금
        </h3>
        <div className="space-y-2">
          {SUBSIDY_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSubsidyType(s.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                subsidyType === s.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                subsidyType === s.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {subsidyType === s.id && <i className="ri-check-line text-white text-xs" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
              {s.rate > 0 && (
                <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  {(s.rate * 100).toFixed(0)}% 보조
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 견적 계산 버튼 */}
      <div className="px-4 pb-6">
        <button
          onClick={() => { setShowResult(true); setShowDetail(false); }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-transform"
        >
          <i className="ri-calculator-line mr-2" />
          견적 계산하기
        </button>
      </div>

      {/* 결과 */}
      {showResult && (
        <section className="px-4 pb-6">
          {/* 총액 카드 */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-2xl mb-4">
            <p className="text-xs font-bold opacity-70 mb-1">
              {facility.name} · {Math.round(areaPyeong)}평 ({Math.round(areaSqm)}㎡) · {smart.name} · {cultivation.name}
            </p>
            <p className="text-sm font-bold opacity-80 mb-3">총 예상 견적</p>
            <p className="text-3xl font-black tracking-tight">{fmtM(totalCost)}</p>
            <p className="text-xs opacity-70 mt-1">= {fmt(totalCost)}원</p>

            {subsidy.rate > 0 && (
              <div className="mt-4 bg-white/15 rounded-2xl p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>정부 보조금 ({(subsidy.rate * 100).toFixed(0)}%)</span>
                  <span className="font-black text-yellow-300">-{fmtM(subsidyAmt)}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-white/30 pt-2 mt-2">
                  <span>실제 자부담</span>
                  <span className="text-yellow-200">{fmtM(selfPay)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">평당 단가</p>
                <p className="text-sm font-black">{fmt(Math.round(totalCost / areaPyeong))}원</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">㎡당 단가</p>
                <p className="text-sm font-black">{fmt(Math.round(totalCost / areaSqm))}원</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] opacity-70">면적</p>
                <p className="text-sm font-black">{Math.round(areaPyeong)}평</p>
              </div>
            </div>
          </div>

          {/* 항목별 상세 */}
          <button
            onClick={() => setShowDetail(v => !v)}
            className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm border border-gray-100"
          >
            <span className="text-sm font-bold text-gray-800">항목별 비용 상세</span>
            <i className={`ri-arrow-${showDetail ? 'up' : 'down'}-s-line text-gray-500 text-lg`} />
          </button>

          {showDetail && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 border border-gray-100">
              {costItems.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < costItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[item.color] || 'bg-gray-100 text-gray-600'}`}>
                    <i className={`${item.icon} text-base`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900">{item.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.note}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-gray-900">{fmtM(item.amount)}</p>
                    <p className="text-[10px] text-gray-400">{fmt(Math.round(item.amount / areaPyeong))}원/평</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="text-sm font-black text-gray-900">합계</span>
                <span className="text-base font-black text-blue-600">{fmtM(totalCost)}</span>
              </div>
            </div>
          )}

          {/* 데이터 출처 */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="ri-information-line text-blue-500" />
              단가 산출 근거 (2025~2026년 기준)
            </p>
            <ul className="text-[10px] text-gray-500 space-y-1 leading-relaxed">
              <li>• 비닐하우스: 농림부 비닐하우스 표준 기준단가 (연동 20~30만원/평)</li>
              <li>• 트러스하우스: H빔+PC 경량철골 시장가 (50~80만원/평)</li>
              <li>• 유리온실: 시공업체 평균 견적 (90~130만원/평)</li>
              <li>• 패시브하우스: 농식품부 에너지절약형 온실 단가 (150~250만원/평)</li>
              <li>• IoT·환경제어: 농식품부 ICT 융복합 표준사업비 기준</li>
              <li>• 수경재배: 양액시스템 업체 평균 견적 (5만~20만원/평)</li>
              <li>• 정부보조: 스마트팜 ICT 융복합 확산사업 기준 (국고30%+지방30%)</li>
            </ul>
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}
