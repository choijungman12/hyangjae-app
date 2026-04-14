/**
 * 쇼핑 장바구니 상태 관리
 * localStorage 기반 · 이벤트 발행으로 실시간 UI 반영
 */

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

const STORAGE_KEY = 'hyangjae_cart';
const EVENT_NAME = 'hyangjae-cart-updated';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getCart(): CartItem[] {
  return loadCart();
}

export function getCartCount(): number {
  return loadCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(productId: string, quantity: number = 1) {
  const cart = loadCart();
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, addedAt: new Date().toISOString() });
  }
  saveCart(cart);
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = loadCart();
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  if (quantity <= 0) {
    saveCart(cart.filter(i => i.productId !== productId));
  } else {
    item.quantity = quantity;
    saveCart(cart);
  }
}

export function removeFromCart(productId: string) {
  saveCart(loadCart().filter(item => item.productId !== productId));
}

export function clearCart() {
  saveCart([]);
}

export function onCartChange(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}
