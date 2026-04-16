import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { PRODUCTS, CATEGORY_LABELS, type ProductCategory } from '@/data/products';
import { getCartCount, onCartChange } from '@/lib/cart';

type CategoryFilter = 'all' | ProductCategory;
type SortMode = 'popular' | 'price-asc' | 'price-desc' | 'new';

const TAG_META = {
  new:     { label: 'NEW',     color: 'bg-blue-500' },
  best:    { label: 'BEST',    color: 'bg-red-500' },
  limited: { label: 'LIMITED', color: 'bg-purple-500' },
};

export default function ShopPage() {
  const scrollY = useScrollY();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    return onCartChange(() => setCartCount(getCartCount()));
  }, []);

  // 필터 + 정렬
  const filtered = PRODUCTS
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search || p.name.includes(search) || p.shortDesc.includes(search));

  const sorted = [...filtered].sort((a, b) => {
    switch (sortMode) {
      case 'price-asc':  return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'new':        return a.tag === 'new' ? -1 : b.tag === 'new' ? 1 : 0;
      default:           return a.tag === 'best' ? -1 : b.tag === 'best' ? 1 : 0;
    }
  });

  const CATEGORY_OPTIONS: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all',       label: '전체',       icon: 'ri-apps-2-line' },
    { id: 'paste',     label: '쌈장',       icon: 'ri-seasoning-line' },
    { id: 'condiment', label: '조미료',    icon: 'ri-scales-3-line' },
    { id: 'beverage',  label: '음료',       icon: 'ri-cup-line' },
    { id: 'processed', label: '가공식품', icon: 'ri-restaurant-line' },
    { id: 'raw',       label: '생고추냉이', icon: 'ri-plant-line' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24 overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${-scrollY * 0.2}px)` }} />
      </div>

      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">향재원 공식 스토어</h1>
          <Link
            to="/shop/cart"
            className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg"
          >
            <i className="ri-shopping-cart-line text-xl text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="px-4 pt-5 pb-5 relative z-10">
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2 border border-white/30">
                <i className="ri-leaf-line text-xs" />
                <span className="text-[10px] font-black">Farm-to-Table · 국내산 100%</span>
              </div>
              <h2 className="text-xl font-black mb-1 drop-shadow-lg">향재원 제품 라인업</h2>
              <p className="text-sm text-white/80">스마트팜에서 재배한 국산 고추냉이로<br />만든 프리미엄 가공식품</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <span className="text-4xl">🌿</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: '총 제품', value: `${PRODUCTS.length}종`, icon: 'ri-box-3-line' },
              { label: '카테고리', value: '5종', icon: 'ri-apps-line' },
              { label: '배송', value: '무료', icon: 'ri-truck-line' },
            ].map(item => (
              <div key={item.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/20">
                <i className={`${item.icon} text-base mb-0.5`} />
                <p className="text-sm font-black leading-tight">{item.value}</p>
                <p className="text-[10px] text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 검색 */}
      <section className="px-4 pb-3 relative z-10">
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="제품명, 카테고리 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent shadow-sm"
          />
        </div>
      </section>

      {/* 카테고리 필터 */}
      <section className="px-4 pb-3 relative z-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setCategory(opt.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                category === opt.id
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              <i className={opt.icon} />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 정렬 */}
      <section className="px-4 pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-gray-500">
            <span className="text-emerald-600">{sorted.length}</span>개 제품
          </p>
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {[
              { id: 'popular',    label: '인기' },
              { id: 'new',        label: '신상' },
              { id: 'price-asc',  label: '낮은 가격' },
              { id: 'price-desc', label: '높은 가격' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortMode(opt.id as SortMode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  sortMode === opt.id ? 'bg-emerald-500 text-white shadow' : 'text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 제품 그리드 */}
      <section className="px-4 pb-6 relative z-10">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <i className="ri-search-line text-4xl text-gray-300 mb-2 block" />
            <p className="text-sm text-gray-400 font-bold">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map(product => {
              const categoryLabel = CATEGORY_LABELS[product.category];
              const tag = product.tag;
              const discountPct = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;

              return (
                <Link
                  key={product.id}
                  to={`/shop/detail?id=${product.id}`}
                  className="relative bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  {/* 태그 */}
                  {tag && (
                    <div className={`absolute top-2 left-2 z-10 ${TAG_META[tag].color} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md`}>
                      {TAG_META[tag].label}
                    </div>
                  )}
                  {/* 할인율 */}
                  {discountPct > 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                      -{discountPct}%
                    </div>
                  )}

                  {/* 이미지 (그라디언트 + 이모지) */}
                  <div className={`relative h-32 bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                    <span className="text-6xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500">{product.emoji}</span>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent h-8" />
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-black text-white/90 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                      {categoryLabel.label}
                    </span>
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <p className="text-sm font-black text-gray-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-snug h-[26px]">{product.shortDesc}</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        {product.originalPrice && (
                          <p className="text-[10px] text-gray-400 line-through leading-none">{product.originalPrice.toLocaleString()}</p>
                        )}
                        <p className="text-base font-black text-gray-900">{product.price.toLocaleString()}<span className="text-[10px] font-bold">원</span></p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{product.unit}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 공지 */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <i className="ri-information-line text-amber-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-900 mb-1">배송 안내</p>
            <ul className="text-[11px] text-amber-700 leading-relaxed space-y-0.5">
              <li>• 5만원 이상 주문 시 <b>무료배송</b> (미만 3,000원)</li>
              <li>• 평일 오후 2시 이전 주문 시 당일 출고</li>
              <li>• 냉장·냉동 상품은 별도 배송</li>
              <li>• 2026년 9월 정식 오픈 예정 · 사전 예약 접수 중</li>
            </ul>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
