import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { getProductById, CATEGORY_LABELS } from '@/data/products';
import { addToCart, getCartCount, onCartChange } from '@/lib/cart';

const EXTERNAL_MARKETS = [
  { id: 'naver',   name: '네이버 쇼핑', color: 'from-green-500 to-emerald-600', icon: 'ri-store-2-line' },
  { id: 'coupang', name: '쿠팡',      color: 'from-red-500 to-pink-600',     icon: 'ri-truck-line' },
  { id: 'eleven',  name: '11번가',    color: 'from-red-600 to-orange-600',   icon: 'ri-shopping-bag-line' },
] as const;

export default function ProductDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get('id') ?? '';
  const product = getProductById(id);

  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'howto' | 'info'>('desc');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    return onCartChange(() => setCartCount(getCartCount()));
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <i className="ri-error-warning-line text-5xl text-gray-300 mb-3 block" />
          <p className="text-sm font-black text-gray-500 mb-4">제품을 찾을 수 없습니다.</p>
          <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-sm">
            스토어로 돌아가기
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const total = product.price * quantity;
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddCart = () => {
    addToCart(product.id, quantity);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    navigate('/shop/cart');
  };

  const externalLinks = EXTERNAL_MARKETS.filter(m => product.externalLinks[m.id]);

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/shop" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-sm font-black text-gray-900 flex-1 truncate">{product.name}</h1>
          <Link
            to="/shop/cart"
            className="relative w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl"
          >
            <i className="ri-shopping-cart-line text-xl text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 히어로 이미지 */}
      <div className={`relative h-80 bg-gradient-to-br ${product.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute top-6 right-6 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-6 left-6 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <span className="text-[10rem] drop-shadow-2xl relative z-10">{product.emoji}</span>
        {product.tag && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
            <span className="text-[11px] font-black text-gray-900">
              {product.tag === 'best' ? '⭐ BEST' : product.tag === 'new' ? '🆕 NEW' : '🔥 LIMITED'}
            </span>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <section className="bg-white -mt-6 rounded-t-3xl relative z-10 px-5 pt-6 pb-5 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${CATEGORY_LABELS[product.category].gradient} text-white`}>
            {CATEGORY_LABELS[product.category].label}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">{product.unit}</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-1">{product.name}</h2>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{product.shortDesc}</p>

        {/* 가격 */}
        <div className="flex items-baseline gap-2 mb-4">
          {discountPct > 0 && (
            <span className="text-sm font-black text-red-500">{discountPct}%</span>
          )}
          <span className="text-2xl font-black text-gray-900">{product.price.toLocaleString()}<span className="text-sm">원</span></span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</span>
          )}
        </div>

        {/* 재고 */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${product.stock > 20 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="text-xs font-bold text-gray-600">
            {product.stock > 20 ? '재고 충분' : product.stock > 0 ? `재고 ${product.stock}개 남음` : '품절'}
          </span>
        </div>

        {/* 특징 뱃지 */}
        <div className="flex flex-wrap gap-2">
          {product.features.slice(0, 4).map((f, i) => (
            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold border border-emerald-100">
              ✓ {f.split('·')[0].trim().slice(0, 14)}
            </span>
          ))}
        </div>
      </section>

      {/* 탭 */}
      <div className="bg-white mt-2 sticky top-[61px] z-30 border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'desc',  label: '상세 설명', icon: 'ri-file-text-line' },
            { id: 'howto', label: '사용법',    icon: 'ri-book-open-line' },
            { id: 'info',  label: '배송·보관', icon: 'ri-truck-line' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black transition-all ${
                activeTab === t.id ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'
              }`}
            >
              <i className={t.icon} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white px-5 py-5">
        {activeTab === 'desc' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                <i className="ri-leaf-line text-emerald-500" />제품 설명
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                <i className="ri-star-line text-emerald-500" />주요 특징
              </h3>
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <i className="ri-checkbox-circle-fill text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                <i className="ri-flask-line text-emerald-500" />원료 정보
              </h3>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <ul className="space-y-1">
                  {product.ingredients.map((ing, i) => (
                    <li key={i} className="text-xs text-gray-700 font-medium">• {ing}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'howto' && (
          <div>
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-book-open-line text-emerald-500" />사용 방법 & 레시피
            </h3>
            <div className="space-y-3">
              {product.howToUse.map((h, i) => (
                <div key={i} className="flex gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-xs font-black text-white">{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed flex-1">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <i className="ri-fridge-line text-emerald-500 text-xl flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">보관 방법</p>
                  <p className="text-xs font-black text-gray-800">{product.storage}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <i className="ri-calendar-line text-emerald-500 text-xl flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">유통 기한</p>
                  <p className="text-xs font-black text-gray-800">{product.shelfLife}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <i className="ri-truck-line text-emerald-500 text-xl flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">배송 안내</p>
                  <p className="text-xs font-black text-gray-800">5만원 이상 무료배송 · 평일 오후 2시 전 주문 시 당일 출고</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 외부 마켓 연결 */}
      {externalLinks.length > 0 && (
        <section className="bg-white mt-2 px-5 py-5">
          <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-external-link-line text-blue-500" />다른 쇼핑몰에서 구매
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {externalLinks.map(market => (
              <a
                key={market.id}
                href={product.externalLinks[market.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r ${market.color} text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all`}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <i className={`${market.icon} text-lg`} />
                </div>
                <span className="text-sm font-black flex-1">{market.name}에서 구매하기</span>
                <i className="ri-arrow-right-line" />
              </a>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-3">외부 쇼핑몰 링크는 새 탭에서 열립니다</p>
        </section>
      )}

      {/* 하단 고정 구매 바 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* 수량 */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <span className="text-xs font-black text-gray-600">수량</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuantity(q => Math.max(1, q - 1)); }}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30"
            >
              <i className="ri-subtract-line text-gray-700" />
            </button>
            <span className="min-w-[28px] text-center text-sm font-black text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuantity(q => Math.min(product.stock, q + 1)); }}
              disabled={quantity >= product.stock}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30"
            >
              <i className="ri-add-line text-gray-700" />
            </button>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-gray-400">합계</p>
            <p className="text-base font-black text-emerald-600">{total.toLocaleString()}원</p>
          </div>
        </div>
        {/* 버튼 */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddCart}
            className="py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <i className="ri-shopping-cart-line" />장바구니
          </button>
          <button
            onClick={handleBuyNow}
            className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <i className="ri-flashlight-line" />바로 구매
          </button>
        </div>
      </div>

      {/* 카트 담김 토스트 */}
      {showAddedToast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
            <i className="ri-check-line text-emerald-400 text-lg" />
            <span className="text-xs font-black">장바구니에 담았습니다</span>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
