import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';
import { FARM_OUTPUTS, FARM_OUTPUT_CATEGORY_LABELS, PRODUCTS, type FarmOutputCategory } from '@/data/products';

/**
 * 출하 단가 · 판매가 관리
 *
 * 향재원은 공간대여를 운영하지 않으므로 데크 요금·부가 옵션 개념이 없습니다.
 * 이 화면에서는 ① 농산물 출하 단가와 ② 가공품 판매가만 관리합니다.
 */

/* 구 'hyangjae_products'(데크 요금) 대신 쓰는 새 키 — 기존 데이터와 섞이지 않게 분리 */
const PRICING_KEY = 'hyangjae_farm_pricing';

interface OutputPrice {
  id: string;
  /** 출하 단가 (원) */
  price: number;
  /** 출하 가능 여부 */
  active: boolean;
}

/* 🟢 EDIT:OUTPUT_PRICE ─ 품목별 기본 출하 단가 (원)
 *
 * ❗ 값은 **FARM_OUTPUTS 의 unit 당 단가**입니다. kg 단가가 아닙니다.
 *   kg 기준 시세(kamisApi.ts CROP_BASE_PRICES)와 환산이 맞아야 합니다.
 *   예) 고추냉이 생근경 12,000원 / 100g → 120,000원/kg (전역 시세와 일치)
 */
const DEFAULT_OUTPUT_PRICES: Record<string, number> = {
  // 고추냉이 — kg 환산: 근경 120,000 / 잎 20,000
  'wasabi-rhizome': 12000,  // /100g
  'wasabi-leaf': 2000,      // /100g

  // 유러피안 채소 — kg 환산: 루꼴라 16,000 / 바질 38,000 / 차드 12,000 / 카볼로네로 18,000
  rucola: 1600,             // /100g
  basil: 3800,              // /100g
  butterhead: 2300,         // /1통 (약 300g → 7,500원/kg)
  radicchio: 7700,          // /1통 (약 350g → 22,000원/kg)
  'cavolo-nero': 3600,      // /200g
  chard: 2400,              // /200g
  fennel: 6300,             // /1구근 (약 450g → 14,000원/kg)
  beet: 2300,               // /1뿌리 (약 350g → 6,500원/kg)

  // 노지 — 과수는 kg, 조경수는 주(株) 단위
  blueberry: 24000,         // /kg
  'emerald-gold': 29000,    // /주
  'blue-angel': 40000,      // /주
  'emerald-green': 32000,   // /주
  'cut-flower': 12000,      // /단
  nursery: 6000,            // /포트
};

function buildDefaults(): OutputPrice[] {
  return FARM_OUTPUTS.map(o => ({
    id: o.id,
    price: DEFAULT_OUTPUT_PRICES[o.id] ?? 0,
    active: true,
  }));
}

const CATEGORY_TABS: { id: FarmOutputCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all',      label: '전체',   icon: 'ri-apps-2-line' },
  { id: 'wasabi',   label: '고추냉이', icon: 'ri-plant-line' },
  { id: 'european', label: '유러피안', icon: 'ri-home-4-line' },
  { id: 'tree',     label: '조경수',  icon: 'ri-leaf-line' },
  { id: 'flower',   label: '화훼',    icon: 'ri-flower-line' },
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [tab, setTab] = useState<'output' | 'processed'>('output');
  const [category, setCategory] = useState<FarmOutputCategory | 'all'>('all');
  const [prices, setPrices] = useState<OutputPrice[]>(() => {
    const raw = localStorage.getItem(PRICING_KEY);
    if (!raw) return buildDefaults();
    try {
      const parsed = JSON.parse(raw) as OutputPrice[];
      // 품목이 추가된 경우 기본값으로 메움
      const byId = new Map(parsed.map(p => [p.id, p]));
      return buildDefaults().map(d => byId.get(d.id) ?? d);
    } catch {
      return buildDefaults();
    }
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const save = (next: OutputPrice[]) => {
    setPrices(next);
    localStorage.setItem(PRICING_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (id: string, field: keyof OutputPrice, val: number | boolean) => {
    save(prices.map(p => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const visible = FARM_OUTPUTS.filter(o => category === 'all' || o.category === category);
  const activeCount = prices.filter(p => p.active).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                aria-label="뒤로 가기">
            <i className="ri-arrow-left-line text-white text-lg" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">출하 단가 · 판매가</p>
            <p className="text-gray-400 text-[10px]" translate="no">
              출하 품목 {FARM_OUTPUTS.length}종 · 운영 중 {activeCount}종
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 bg-wasabi-500/20 px-2.5 py-1.5 rounded-xl">
              <i className="ri-check-line text-wasabi-300 text-sm" aria-hidden="true" />
              <span className="text-xs font-black text-wasabi-200">저장됨</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 탭 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1">
          {([
            { id: 'output'    as const, label: '농산물 출하 단가', icon: 'ri-scales-3-line' },
            { id: 'processed' as const, label: '가공품 판매가',    icon: 'ri-archive-2-line' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                tab === t.id ? 'bg-gradient-to-r from-wasabi-500 to-emeraldgreen-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <i className={t.icon} aria-hidden="true" />{t.label}
            </button>
          ))}
        </div>

        {tab === 'output' && (
          <div className="space-y-4">
            {/* 분류 필터 */}
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORY_TABS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                    category === c.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <i className={c.icon} aria-hidden="true" />{c.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visible.map(o => {
                const p = prices.find(x => x.id === o.id);
                if (!p) return null;
                const meta = FARM_OUTPUT_CATEGORY_LABELS[o.category];
                return (
                  <div key={o.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-wasabi-400 to-emeraldgreen-700 rounded-xl
                                        flex items-center justify-center shadow-md shrink-0">
                          <i className={`${meta.icon} text-white text-lg`} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">{o.name}</p>
                          <p className="text-xs text-gray-500 truncate" translate="no">
                            {meta.label} · {o.unit} · {o.channel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => update(o.id, 'active', !p.active)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${p.active ? 'bg-wasabi-400' : 'bg-gray-200'}`}
                          aria-label={`${o.name} 출하 ${p.active ? '중지' : '시작'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ${p.active ? 'left-6' : 'left-0.5'}`} />
                        </button>
                        <button
                          onClick={() => setEditing(editing === o.id ? null : o.id)}
                          className="w-9 h-9 bg-wasabi-50 rounded-xl flex items-center justify-center hover:bg-wasabi-100 transition-all"
                          aria-label={`${o.name} 단가 수정`}
                        >
                          <i className="ri-edit-line text-wasabi-600 text-sm" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {editing === o.id ? (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 mb-1" htmlFor={`price-${o.id}`}>
                            출하 단가 (원 / {o.unit})
                          </label>
                          <input
                            id={`price-${o.id}`}
                            type="number"
                            value={p.price}
                            onChange={e => update(o.id, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 border-2 border-wasabi-200 rounded-xl text-sm font-black
                                       focus:outline-none focus:ring-2 focus:ring-wasabi-400"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-wasabi-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-500 font-bold">출하 단가</p>
                            <p className="text-base font-black text-wasabi-700" translate="no">
                              {p.price.toLocaleString()}원
                              <span className="text-[10px] font-bold text-gray-400 ml-1">/ {o.unit}</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-500 font-bold">출하 시기</p>
                            <p className="text-xs font-black text-gray-700 leading-snug">{o.season}</p>
                          </div>
                        </div>
                      )}
                      {o.note && (
                        <p className="mt-2 text-[10px] font-bold text-amber-700 flex items-start gap-1">
                          <i className="ri-information-line mt-px" aria-hidden="true" />{o.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'processed' && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50">
              <p className="text-[11px] font-bold text-gray-500">
                가공품 상세 정보는 <code className="font-mono">src/data/products.ts</code> 에서 관리합니다.
              </p>
            </div>
            {PRODUCTS.map(pr => (
              <div key={pr.id} className="px-4 py-3 flex items-center gap-3">
                <span className="text-2xl shrink-0" aria-hidden="true">{pr.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 truncate">{pr.name}</p>
                  <p className="text-[10px] text-gray-400" translate="no">{pr.unit} · 재고 {pr.stock}</p>
                </div>
                <p className="text-xs font-black text-gray-800 shrink-0" translate="no">
                  {pr.price.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 단위 안내 — kg 단가와 혼동하면 시세 표기와 어긋납니다 */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-2.5">
          <i className="ri-scales-3-line text-blue-500 text-lg flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-black text-blue-900 mb-1">단가는 품목별 출하 단위 기준입니다</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              100g · 1통 · 1구근 · 주(株) · 단 등 품목마다 단위가 다릅니다.
              수정 후에는 kg 환산값이 시세 동향 화면과 어긋나지 않는지 확인해 주세요
              (예: 고추냉이 생근경 12,000원 / 100g = 120,000원 / kg).
            </p>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
          <i className="ri-information-line text-amber-500 text-lg flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-black text-amber-900 mb-1">공간대여 요금 항목 없음</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              향재원은 농산물 생산 시설로, 데크·공간 대여나 숯불·불멍 같은 부가 상품을 운영하지 않습니다.
              이 화면에서는 출하 단가와 가공품 판매가만 관리합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
