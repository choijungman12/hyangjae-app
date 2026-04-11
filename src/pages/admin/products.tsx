import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';

const PRODUCTS_KEY = 'hyangjae_products';

const DEFAULT_PRODUCTS = {
  // 8개 데크는 모두 동일한 요금 체계 (8인 수용)
  deckBase: {
    label: '글램핑 데크',
    capacity: '8인',
    totalCount: 8,
    weekday: 139000,
    weekend: 159000,
    active: true,
  },
  addons: [
    { id: 'fire',  label: '불멍 세트', price: 30000, desc: '장작 + 화로대 + 착화제', active: true },
    { id: 'grill', label: '숯불 그릴', price: 20000, desc: '숯 + 그릴망 + 집게',     active: true },
  ],
  programs: [
    { id: 'harvest', label: '와사비 수확 체험', duration: '30분', price: 25000, unit: '성인 1인', active: true },
    { id: 'tutor',   label: '영어 튜터 프로그램', duration: '60분', price: 45000, unit: '1인', active: true },
    { id: 'tour',    label: '스마트팜 투어', duration: '45분', price: 15000, unit: '1인', active: true },
  ],
};

type Addon   = typeof DEFAULT_PRODUCTS.addons[0];
type Program = typeof DEFAULT_PRODUCTS.programs[0];

export default function AdminProducts() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [tab, setTab] = useState<'deck' | 'program'>('deck');
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const save = (next: typeof data) => {
    setData(next);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateDeckBase = (field: string, val: string | number | boolean) => {
    save({ ...data, deckBase: { ...data.deckBase, [field]: val } });
  };

  const updateAddon = (id: string, field: keyof Addon, val: string | number | boolean) => {
    save({ ...data, addons: data.addons.map((a: Addon) => a.id === id ? { ...a, [field]: val } : a) });
  };

  const updateProgram = (id: string, field: keyof Program, val: string | number | boolean) => {
    save({ ...data, programs: data.programs.map((p: Program) => p.id === id ? { ...p, [field]: val } : p) });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-white text-lg" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">가격 · 메뉴 관리</p>
            <p className="text-gray-400 text-[10px]">데크 요금 및 체험 프로그램 관리</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1.5 rounded-xl">
              <i className="ri-check-line text-emerald-400 text-sm" />
              <span className="text-xs font-black text-emerald-300">저장됨</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 탭 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1">
          {[{ id: 'deck', label: '공간 요금 (데크)', icon: 'ri-layout-2-line' }, { id: 'program', label: '체험 프로그램', icon: 'ri-seedling-line' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${tab === t.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className={t.icon} />{t.label}
            </button>
          ))}
        </div>

        {/* 데크 요금 (통합 · 8개 데크 동일 요금) */}
        {tab === 'deck' && (
          <div className="space-y-4">
            {/* 공통 데크 정보 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <i className="ri-tent-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{data.deckBase.label}</p>
                    <p className="text-xs text-gray-500">{data.deckBase.capacity} · 총 {data.deckBase.totalCount}개소 (동일 요금)</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(editing === 'deckBase' ? null : 'deckBase')}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:bg-purple-100 transition-all shadow-sm"
                >
                  <i className="ri-edit-line text-purple-600 text-sm" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {editing === 'deckBase' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-1">평일 요금 (원)</label>
                      <input
                        type="number"
                        value={data.deckBase.weekday}
                        onChange={e => updateDeckBase('weekday', parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-1">주말 요금 (원)</label>
                      <input
                        type="number"
                        value={data.deckBase.weekend}
                        onChange={e => updateDeckBase('weekend', parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 border-2 border-purple-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 font-bold">평일</p>
                      <p className="text-base font-black text-blue-700">{data.deckBase.weekday.toLocaleString()}원</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 font-bold">주말·공휴일</p>
                      <p className="text-base font-black text-orange-700">{data.deckBase.weekend.toLocaleString()}원</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 부가 옵션 관리 */}
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2 ml-1">부가 옵션</p>
              <div className="space-y-3">
                {data.addons.map((addon: Addon) => (
                  <div key={addon.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                          <i className={`${addon.id === 'fire' ? 'ri-fire-line' : 'ri-restaurant-line'} text-white text-lg`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{addon.label}</p>
                          <p className="text-xs text-gray-500">{addon.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateAddon(addon.id, 'active', !addon.active)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${addon.active ? 'bg-emerald-400' : 'bg-gray-200'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ${addon.active ? 'left-6' : 'left-0.5'}`} />
                        </button>
                        <button
                          onClick={() => setEditing(editing === addon.id ? null : addon.id)}
                          className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center hover:bg-orange-100 transition-all"
                        >
                          <i className="ri-edit-line text-orange-600 text-sm" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      {editing === addon.id ? (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 mb-1">가격 (원)</label>
                          <input
                            type="number"
                            value={addon.price}
                            onChange={e => updateAddon(addon.id, 'price', parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 border-2 border-orange-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                      ) : (
                        <div className="bg-orange-50 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">옵션 추가 요금</span>
                          <span className="text-lg font-black text-orange-700">+{addon.price.toLocaleString()}원</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 체험 프로그램 */}
        {tab === 'program' && (
          <div className="space-y-3">
            {data.programs.map((prog: Program) => (
              <div key={prog.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                      <i className="ri-seedling-line text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{prog.label}</p>
                      <p className="text-xs text-gray-500">{prog.duration} · {prog.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateProgram(prog.id, 'active', !prog.active)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${prog.active ? 'bg-emerald-400' : 'bg-gray-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ${prog.active ? 'left-6' : 'left-0.5'}`} />
                    </button>
                    <button
                      onClick={() => setEditing(editing === prog.id ? null : prog.id)}
                      className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-all"
                    >
                      <i className="ri-edit-line text-emerald-600 text-sm" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {editing === prog.id ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1">프로그램 이름</label>
                        <input
                          type="text"
                          value={prog.label}
                          onChange={e => updateProgram(prog.id, 'label', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-emerald-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1">가격 (원)</label>
                        <input
                          type="number"
                          value={prog.price}
                          onChange={e => updateProgram(prog.id, 'price', parseInt(e.target.value))}
                          className="w-full px-3 py-2.5 border-2 border-emerald-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">{prog.unit}당</span>
                      <span className="text-lg font-black text-emerald-700">{prog.price.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-2">
          <i className="ri-information-line text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            변경된 요금은 즉시 로컬에 저장됩니다. 실제 서비스에 반영하려면 서버 배포가 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
