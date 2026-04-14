import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  onCartChange,
  type CartItem,
} from '@/lib/cart';
import { getProductById } from '@/data/products';
import { AUTH_KEY, type UserInfo } from '@/pages/login/page';

type CheckoutStep = 'cart' | 'form' | 'complete';

interface OrderForm {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  memo: string;
}

const FREE_SHIPPING_MIN = 50000;
const SHIPPING_FEE = 3000;

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [form, setForm] = useState<OrderForm>({
    name: '', phone: '', address: '', addressDetail: '', memo: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    return onCartChange(refresh);
  }, []);

  // 로그인 사용자 기본값 채우기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const user: UserInfo = JSON.parse(raw);
        setForm(prev => ({ ...prev, name: prev.name || user.name }));
      }
    } catch { /* noop */ }
  }, []);

  const enrichedItems = items
    .map(item => {
      const product = getProductById(item.productId);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = enrichedItems.reduce((sum, { item, product }) => sum + item.quantity * product.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (enrichedItems.length === 0) return;
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = () => {
    if (!form.name.trim()) { setFormError('이름을 입력해 주세요.'); return; }
    if (!form.phone.trim()) { setFormError('연락처를 입력해 주세요.'); return; }
    if (!form.address.trim()) { setFormError('배송지 주소를 입력해 주세요.'); return; }
    setFormError('');
    // 실제로는 서버에 POST — 여기서는 주문 완료 처리
    clearCart();
    setStep('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── 주문 완료 ── */
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col pb-20">
        <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <Link to="/shop" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl">
              <i className="ri-arrow-left-line text-xl text-gray-700" />
            </Link>
            <h1 className="text-base font-black text-gray-900">주문 완료</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl mb-5 animate-bounce" style={{ animationDuration: '1.5s' }}>
            <i className="ri-check-line text-5xl text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">주문이 완료되었습니다!</h2>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            {form.name}님의 주문이 접수되었습니다.<br />
            확인 후 연락드리겠습니다.
          </p>

          <div className="w-full max-w-xs bg-white rounded-3xl shadow-lg p-5 border border-gray-100 mb-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold">주문자</span>
                <span className="text-gray-800 font-black">{form.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold">연락처</span>
                <span className="text-gray-800 font-black">{form.phone}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-600 font-bold">결제 금액</span>
                <span className="text-base font-black text-emerald-600">{total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            <Link to="/shop" className="py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-sm text-center">
              쇼핑 계속하기
            </Link>
            <Link to="/profile" className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm text-center shadow-lg">
              주문 내역
            </Link>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  /* ── 주문서 작성 ── */
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <button onClick={() => setStep('cart')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl">
              <i className="ri-arrow-left-line text-xl text-gray-700" />
            </button>
            <h1 className="text-base font-black text-gray-900 flex-1">주문서 작성</h1>
          </div>
        </header>

        <section className="px-4 pt-5 space-y-4">
          {/* 주문자 정보 */}
          <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-user-line text-emerald-500" />주문자 정보
            </h3>
            <div className="space-y-3">
              {[
                { field: 'name',  label: '이름',    placeholder: '홍길동',         required: true },
                { field: 'phone', label: '연락처', placeholder: '010-0000-0000', required: true },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-[11px] font-black text-gray-600 mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form[f.field as keyof OrderForm]}
                    onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 배송지 */}
          <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-map-pin-line text-emerald-500" />배송지
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-gray-600 mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="서울시 서초구 양재동 178-4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-600 mb-1">상세 주소</label>
                <input
                  type="text"
                  value={form.addressDetail}
                  onChange={e => setForm(prev => ({ ...prev, addressDetail: e.target.value }))}
                  placeholder="아파트 동·호수, 건물명 등"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-600 mb-1">배송 메모</label>
                <textarea
                  value={form.memo}
                  onChange={e => setForm(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="문 앞에 놓아주세요"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* 결제 요약 */}
          <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-wallet-line text-emerald-500" />결제 요약
            </h3>
            <div translate="no" className="notranslate space-y-2 text-xs" key={`form-summary-${total}`}>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">상품 금액</span><span className="font-black">{subtotal.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">배송비</span><span className="font-black">{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span></div>
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="text-sm font-black text-gray-900">총 결제 금액</span>
                <span className="text-xl font-black text-emerald-600">{total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-500" />
              <p className="text-xs font-bold text-red-700">{formError}</p>
            </div>
          )}
        </section>

        {/* 하단 고정 결제 버튼 */}
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30 p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          <button
            onClick={handleSubmitOrder}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
          >
            {total.toLocaleString()}원 결제하기
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  /* ── 장바구니 ── */
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/shop" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">장바구니 <span className="text-emerald-500">{enrichedItems.length}</span></h1>
          {enrichedItems.length > 0 && (
            <button onClick={() => clearCart()} className="text-[11px] text-gray-400 font-bold hover:text-red-500">
              전체 삭제
            </button>
          )}
        </div>
      </header>

      {enrichedItems.length === 0 ? (
        /* 빈 카트 */
        <div className="flex flex-col items-center justify-center pt-20 px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
            <i className="ri-shopping-cart-line text-4xl text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-500 mb-1">장바구니가 비어있습니다</p>
          <p className="text-xs text-gray-400 mb-5">마음에 드는 제품을 담아보세요</p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm shadow-lg"
          >
            쇼핑 시작하기
          </Link>
        </div>
      ) : (
        <>
          {/* 아이템 목록 */}
          <section className="px-4 pt-5 space-y-3">
            {enrichedItems.map(({ item, product }) => (
              <div key={item.productId} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100 flex gap-3">
                {/* 썸네일 */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-4xl">{product.emoji}</span>
                </div>
                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/shop/detail?id=${product.id}`} className="text-sm font-black text-gray-900 line-clamp-2 flex-1">
                      {product.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0"
                    >
                      <i className="ri-close-line text-gray-500 text-sm" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{product.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    {/* 수량 */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg active:scale-95 transition-all"
                      >
                        <i className="ri-subtract-line text-xs text-gray-700" />
                      </button>
                      <span className="min-w-[24px] text-center text-xs font-black text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, Math.min(product.stock, item.quantity + 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg active:scale-95 transition-all"
                      >
                        <i className="ri-add-line text-xs text-gray-700" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-emerald-600">{(product.price * item.quantity).toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* 무료배송 진행바 */}
          <section className="px-4 pt-5">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
              {subtotal >= FREE_SHIPPING_MIN ? (
                <div className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-emerald-500 text-lg" />
                  <p className="text-xs font-black text-emerald-700">무료배송 적용</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-black text-gray-800 mb-2">
                    <span className="text-emerald-600">{(FREE_SHIPPING_MIN - subtotal).toLocaleString()}원</span> 더 구매하면 무료배송!
                  </p>
                  <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 요약 */}
          <section className="px-4 pt-5">
            <div
              translate="no"
              className="notranslate bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-2 text-xs"
              key={`cart-summary-${total}`}
            >
              <div className="flex justify-between"><span className="text-gray-500 font-bold">상품 금액</span><span className="font-black">{subtotal.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">배송비</span><span className="font-black">{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span></div>
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="text-sm font-black text-gray-900">총 결제 금액</span>
                <span className="text-xl font-black text-emerald-600">{total.toLocaleString()}원</span>
              </div>
            </div>
          </section>

          {/* 하단 주문 버튼 */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30 p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <i className="ri-shopping-bag-line" />
              {total.toLocaleString()}원 주문하기
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
