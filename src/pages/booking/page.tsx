import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import ColkijeFreeBanner from '@/components/ColkijeFreeBanner';
import IncludedItemsList from '@/components/IncludedItemsList';
import HarvestCalendar from '@/components/HarvestCalendar';
import DepositBreakdown from '@/components/DepositBreakdown';
import PartnerStoreCard from '@/components/PartnerStoreCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getImage, type ImageKey } from '@/lib/imageStore';
import { requestNaverPayMock, splitBookingPayment } from '@/lib/naverPayMock';
import { calcHarvestGrams, getHarvestForMonth, PARTNER_STORES, BOOKING_ADDONS } from '@/data/products';

type BookingItem = {
  type: 'deck' | 'experience';
  name: string;
  deckId?: number;
  date: string;
  time: string;
  guests: number;
  price: number;
  /** 예약금 (총액 30%, 100원 단위 반올림) */
  depositAmount?: number;
  /** 현장 결제 잔액 */
  remainderAmount?: number;
  /** 예약금 결제 트랜잭션 ID (네이버페이 Mock) */
  depositTransactionId?: string;
  addons?: string[];
  createdAt: string;
};

/* ── 공간 정보 ── */
// * 🟢 EDIT:DECK_PRICE ─ 데크 요금 정책 (4인 평균, 1명 추가 시 +2만원)
const DECK_BASE = {
  capacity: 8,
  baseGuests: 4,       // * 4인 기준이 평균 가격
  weekday: 139000,     // * 평일 3시간 기본 요금 (4인 기준)
  weekend: 159000,     // * 주말/공휴일 3시간 기본 요금 (4인 기준)
  extraPerGuest: 20000, // * 1명 추가 시 2만원 추가
  duration: '2.5~3시간',
};

const TOTAL_DECKS = 8;

/* 8개 데크 목록 (추후 관리자에서 상태 변경 가능) */
const DECKS = Array.from({ length: TOTAL_DECKS }, (_, i) => ({
  id: i + 1,
  label: `${i + 1}번 데크`,
}));

/* 부가 옵션 */
// * 🟢 EDIT:ADDONS ─ 불멍·숯불 옵션 가격 수정
const ADDONS = [
  {
    id: 'fire',
    label: '불멍 세트',
    price: 30000,
    icon: 'ri-fire-line',
    color: 'from-orange-500 to-red-500',
    desc: '장작 + 화로대 + 착화제 제공',
  },
  {
    id: 'grill',
    label: '숯불 그릴',
    price: 20000,
    icon: 'ri-restaurant-line',
    color: 'from-amber-500 to-orange-600',
    desc: '숯 + 그릴망 + 집게 세트',
  },
];

/* 매점 제공 품목 */
const STORE_ITEMS = [
  { icon: 'ri-shopping-basket-2-line', label: '과자 · 스낵', desc: '간단한 스낵류' },
  { icon: 'ri-cup-line', label: '일회용 식기', desc: '접시·컵·수저' },
  { icon: 'ri-fire-line', label: '버너·부탄', desc: '휴대용 버너 대여' },
  { icon: 'ri-scissors-cut-line', label: '집게·가위', desc: '조리 도구 대여' },
  { icon: 'ri-restaurant-2-line', label: '식판', desc: '식사용 식판' },
  { icon: 'ri-plant-line', label: '고추냉이', desc: '매장 판매 상품' },
];

/* 체험 프로그램은 데크 예약자 전용.
 * 와사비 강판 체험은 데크 옵션(BOOKING_ADDONS)으로도 제공되며, 여기서는 단독 체험으로도 선택 가능.
 */
const EXPERIENCE_PROGRAMS = [
  {
    id: 'wasabi-grater',
    name: '와사비 강판 체험',
    duration: '15분',
    price: 5000,
    unit: '1인',
    icon: 'ri-knife-line',
    color: 'from-emerald-500 to-teal-600',
    image: '/facility-images/facility-00.jpg',
    desc: '메인 하우스(스마트팜 150평) 투어 중 직접 강판으로 고추냉이를 갈아보는 체험 (수확 불가)',
  },
  {
    id: 'tutor',
    name: '영어 튜터 프로그램',
    duration: '60분',
    price: 45000,
    unit: '1인',
    icon: 'ri-book-open-line',
    color: 'from-blue-500 to-indigo-600',
    image: '/facility-images/facility-16.jpg',
    desc: '팜 환경에서 진행하는 영어 교육 프로그램',
  },
  {
    id: 'tour',
    name: '메인 하우스 스마트팜 투어',
    duration: '45분',
    price: 15000,
    unit: '1인',
    icon: 'ri-walk-line',
    color: 'from-purple-500 to-pink-600',
    image: '/facility-images/facility-00.jpg',
    desc: '메인 하우스에서 진행하는 고추냉이 IoT 재배 시설 심화 견학 (기본 20분 투어는 데크 예약에 포함)',
  },
];

/* 데크 예약 타임 — 평일 2타임 (11~14 / 18~21), 주말 3타임 (11~14 / 15~18 / 18~21)
 * 각 이용 시간 3시간, 1시간 연장당 40,000원 / 1텐트
 */
const WEEKDAY_SLOTS = [
  { label: '오전', time: '11:00', endTime: '14:00' },
  { label: '저녁', time: '18:00', endTime: '21:00' },
];

const WEEKEND_SLOTS = [
  { label: '오전', time: '11:00', endTime: '14:00' },
  { label: '오후', time: '15:00', endTime: '18:00' },
  { label: '저녁', time: '18:00', endTime: '21:00' },
];

/* 체험 프로그램 타임 — 평일 오전 1타임 / 주말 오전·오후 2타임
 * 체험은 데크 예약자 전용 · 같은 날짜 데크 예약이 있어야 예약 가능
 */
const EXPERIENCE_WEEKDAY_SLOTS = [
  { label: '오전', time: '11:00', endTime: '12:00' },
];

const EXPERIENCE_WEEKEND_SLOTS = [
  { label: '오전', time: '11:00', endTime: '12:00' },
  { label: '오후', time: '15:00', endTime: '16:00' },
];

// * 🟢 EDIT:EXTEND_PRICE ─ 시간 연장 요금 (1텐트당 1시간)
const EXTEND_PRICE_PER_HOUR = 40000;

function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** 커스텀 업로드 이미지가 있으면 사용, 없으면 기존 facility 이미지 fallback */
function useCustomImage(key: ImageKey, fallback: string): string {
  const [src, setSrc] = useState<string>(() => getImage(key) ?? fallback);
  useEffect(() => {
    const update = () => setSrc(getImage(key) ?? fallback);
    update();
    window.addEventListener('hyangjae-image-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('hyangjae-image-updated', update);
      window.removeEventListener('storage', update);
    };
  }, [key, fallback]);
  return src;
}

export default function Booking() {
  const [activeTab, setActiveTab] = useState<'deck' | 'experience'>('deck');
  const glampingOutdoor  = useCustomImage('glamping-outdoor',  '/facility-images/facility-09.jpg');
  const glampingInterior = useCustomImage('glamping-interior', '/facility-images/facility-00.jpg');
  const storeInterior    = useCustomImage('store-interior',    '/facility-images/facility-16.jpg');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState('4');
  const [extendHours, setExtendHours] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [combineDiscount, setCombineDiscount] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formError, setFormError] = useState('');
  const [bookings, setBookings] = useLocalStorage<BookingItem[]>('farm-bookings', []);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedBookingAddons, setSelectedBookingAddons] = useState<string[]>([]);

  const currentMonth = new Date().getMonth() + 1;
  const currentHarvest = getHarvestForMonth(currentMonth);

  const weekend = isWeekend(selectedDate);
  const deckSlots = weekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  const experienceSlots = weekend ? EXPERIENCE_WEEKEND_SLOTS : EXPERIENCE_WEEKDAY_SLOTS;
  const availableSlots = activeTab === 'experience' ? experienceSlots : deckSlots;
  /** 같은 날짜에 확정된 데크 예약이 있어야 체험 예약 가능 */
  const hasDeckBookingOnSelectedDate = Boolean(
    selectedDate && bookings.some(b => b.type === 'deck' && b.date === selectedDate),
  );
  const basePrice = weekend ? DECK_BASE.weekend : DECK_BASE.weekday;
  // 인원 추가 요금 (4인 초과 시 1명당 +2만원)
  const parsedGuests = parseInt(guestCount) || DECK_BASE.baseGuests;
  const extraGuests = Math.max(0, parsedGuests - DECK_BASE.baseGuests);
  const extraGuestTotal = extraGuests * DECK_BASE.extraPerGuest;
  const extendTotal = extendHours * EXTEND_PRICE_PER_HOUR;
  const addonsTotal = selectedAddons.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price ?? 0), 0);
  const bookingAddonsTotal = selectedBookingAddons.reduce(
    (sum, id) => sum + (BOOKING_ADDONS.find(a => a.id === id)?.price ?? 0),
    0,
  );
  const subtotal = basePrice + extraGuestTotal + extendTotal + addonsTotal + bookingAddonsTotal;
  const discountedPrice = combineDiscount ? Math.round(subtotal * 0.9) : subtotal;
  const payment = splitBookingPayment(discountedPrice);
  const harvestGrams = calcHarvestGrams(parsedGuests);

  // 날짜가 바뀌면 현재 선택된 시간이 평일/주말 슬롯 목록에 없을 때 초기화
  useEffect(() => {
    if (selectedTime && !availableSlots.find(s => s.time === selectedTime)) {
      setSelectedTime('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const expInfo = EXPERIENCE_PROGRAMS.find(p => p.id === selectedExp);
  const expTotal = expInfo ? expInfo.price * (parseInt(guestCount) || 1) : 0;

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleBookDeck = async () => {
    if (!selectedDeckId || !selectedDate || !selectedTime) {
      setFormError('데크, 날짜, 시간을 모두 선택해주세요.');
      return;
    }
    setFormError('');

    const addonLabels = selectedAddons.map(id => ADDONS.find(a => a.id === id)?.label ?? '').filter(Boolean);
    if (extendHours > 0) addonLabels.push(`${extendHours}시간 연장`);
    selectedBookingAddons.forEach(id => {
      const a = BOOKING_ADDONS.find(b => b.id === id);
      if (a) addonLabels.push(a.name);
    });

    const orderId = `ORDER-${Date.now()}`;
    setIsPaying(true);
    try {
      const result = await requestNaverPayMock({
        orderId,
        amount: payment.deposit,
        productName: `${selectedDeckId}번 데크 · ${parsedGuests}인 · ${selectedDate}`,
      });

      const newBooking: BookingItem = {
        type: 'deck',
        name: `${selectedDeckId}번 글램핑 데크 · ${parsedGuests}인 · ${3 + extendHours}시간`,
        deckId: selectedDeckId,
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guestCount) || 4,
        price: discountedPrice,
        depositAmount: payment.deposit,
        remainderAmount: payment.remainder,
        depositTransactionId: result.transactionId,
        addons: addonLabels,
        createdAt: new Date().toISOString(),
      };
      setBookings(prev => [newBooking, ...prev]);
      setSelectedDeckId(null);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedAddons([]);
      setSelectedBookingAddons([]);
      setGuestCount('4');
      setExtendHours(0);
      setCombineDiscount(false);
      setToast({
        message: `예약금 ${payment.deposit.toLocaleString()}원 결제 완료! 현장에서 ${payment.remainder.toLocaleString()}원 결제해 주세요.`,
        type: 'success',
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleBookExp = async () => {
    if (!selectedExp || !selectedDate || !selectedTime) {
      setFormError('프로그램, 날짜, 시간을 모두 선택해주세요.');
      return;
    }
    if (!hasDeckBookingOnSelectedDate) {
      setFormError('체험 프로그램은 같은 날짜에 데크 예약을 하신 분만 이용하실 수 있습니다. 먼저 데크를 예약해 주세요.');
      return;
    }
    setFormError('');

    const expPayment = splitBookingPayment(expTotal);
    const orderId = `EXP-${Date.now()}`;
    setIsPaying(true);
    try {
      const result = await requestNaverPayMock({
        orderId,
        amount: expPayment.deposit,
        productName: `${expInfo?.name ?? '체험'} · ${parseInt(guestCount) || 1}인`,
      });
      const newBooking: BookingItem = {
        type: 'experience',
        name: expInfo?.name || '',
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guestCount) || 1,
        price: expTotal,
        depositAmount: expPayment.deposit,
        remainderAmount: expPayment.remainder,
        depositTransactionId: result.transactionId,
        createdAt: new Date().toISOString(),
      };
      setBookings(prev => [newBooking, ...prev]);
      setSelectedExp(null);
      setSelectedDate('');
      setSelectedTime('');
      setGuestCount('1');
      setToast({
        message: `체험 예약금 ${expPayment.deposit.toLocaleString()}원 결제 완료!`,
        type: 'success',
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="체험·공간대여" subtitle="Farm-to-Table 향재원" />

      {/* Hero Banner */}
      <section className="relative h-56 overflow-hidden">
        <img
          src={glampingOutdoor}
          alt="향재원 스마트팜 데크 전경"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-full mb-2 border border-white/30">
            <i className="ri-plant-fill text-xs" />
            <span className="text-[10px] font-black">데크별 전용 텃밭 · 파머스 글램핑 8개소</span>
          </div>
          <h2 className="text-lg font-black mb-0.5">향재원 파머스 글램핑</h2>
          <p className="text-xs text-white/80">서울 서초구 양재동 · 데크별 전용 텃밭 수확 + 고추냉이 스마트팜 투어</p>
        </div>
      </section>

      {/* Tab */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={() => { setActiveTab('deck'); setFormError(''); }}
          className={`flex-1 py-3.5 text-sm font-bold transition-colors ${activeTab === 'deck' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
        >
          <i className="ri-tent-line mr-1.5" />공간 대여
        </button>
        <button
          onClick={() => { setActiveTab('experience'); setFormError(''); }}
          className={`flex-1 py-3.5 text-sm font-bold transition-colors ${activeTab === 'experience' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
        >
          <i className="ri-seedling-line mr-1.5" />체험 프로그램
        </button>
      </div>

      {/* ═══════ 공간 대여 탭 ═══════ */}
      {activeTab === 'deck' && (
        <>
          {/* 공간 소개 이미지 */}
          <section className="px-4 pt-4">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="grid grid-cols-2 gap-0.5 bg-gray-100">
                <div className="relative h-32">
                  <img
                    src={glampingOutdoor}
                    alt="데크 전용 텃밭 외부"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                    <i className="ri-home-4-fill text-[9px]" />
                    데크 + 전용 텃밭
                  </div>
                </div>
                <div className="relative h-32">
                  <img
                    src={glampingInterior}
                    alt="메인 하우스 고추냉이 스마트팜"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                    <i className="ri-plant-fill text-[9px]" />
                    메인 하우스 (고추냉이)
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-black text-gray-900">데크별 전용 텃밭 · 파머스 글램핑</h3>
                    <p className="text-xs text-gray-500 mt-0.5">1~8번 · 4인 기준 · 최대 8인 · 시기별 작물 직접 수확</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg flex-shrink-0">텃밭 포함</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500">평일 · 4인</p>
                    <p className="text-sm font-black text-blue-700">{DECK_BASE.weekday.toLocaleString()}원</p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500">주말 · 4인</p>
                    <p className="text-sm font-black text-orange-700">{DECK_BASE.weekend.toLocaleString()}원</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2 font-bold">
                  4인 초과 시 <span className="text-orange-600">1명당 +20,000원</span>
                </p>
              </div>
            </div>
          </section>

          {/* 시설 구조 안내 — 메인 하우스(고추냉이) + 데크(시기별 텃밭) */}
          <section className="px-4 pt-4">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                  <i className="ri-plant-fill text-2xl text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-1.5">
                    <i className="ri-information-fill" />
                    시설 구조 안내
                  </div>
                  <h3 className="text-sm font-black text-emerald-900 leading-snug">
                    향재원 <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded">메인 하우스 + 데크 8개</span>
                  </h3>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 mb-3 border border-emerald-200 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-home-4-fill text-emerald-700 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-gray-900">메인 하우스 · 150평 고추냉이 스마트팜</p>
                    <p className="text-[10px] text-gray-600 leading-relaxed mt-0.5">
                      한국 국산 고추냉이를 IoT 기반으로 재배하는 전용 공간. <b className="text-emerald-700">가이드 투어만 가능 (수확 불가)</b>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-tent-fill text-teal-700 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-gray-900">데크 1~8번 · 각 데크 전용 텃밭</p>
                    <p className="text-[10px] text-gray-600 leading-relaxed mt-0.5">
                      시기별로 <b className="text-teal-700">상추·깻잎·로메인·양상추·딸기 등 다양한 작물</b>이 재배되며, 예약 시 직접 수확 체험 가능
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
                <p className="text-[11px] font-black text-red-700 flex items-center justify-center gap-1.5">
                  <i className="ri-hand-line text-sm" />
                  메인 하우스 내부의 IoT 센서·장비는 손대지 말아 주세요
                </p>
                <p className="text-[9px] text-red-600 font-bold mt-1">장비 파손 시 실손 배상 청구</p>
              </div>
            </div>
          </section>

          {/* 콜키지 프리 배너 (Sprint-03) */}
          <section className="px-4 pt-4">
            <ColkijeFreeBanner />
          </section>

          {/* 데크 예약 포함 내역 (Sprint-03) */}
          <section className="px-4 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <i className="ri-checkbox-circle-fill text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
              <h3 className="text-sm font-black text-gray-900">데크 예약에 포함된 것</h3>
            </div>
            <IncludedItemsList
              items={[
                {
                  icon: '🌱',
                  title: `내 데크 전용 텃밭 수확 ${harvestGrams}g`,
                  description: `${currentMonth}월 시기별 작물: ${[...currentHarvest.primary, ...currentHarvest.rotation].join(' · ') || '상추·깻잎'} (데크별 수확 가능)`,
                  highlight: true,
                },
                {
                  icon: '🌿',
                  title: '메인 하우스 고추냉이 스마트팜 투어 (약 20분)',
                  description: '150평 스마트팜 · 웰컴 와사비 시식 · 투어 전용 (수확 불가)',
                },
                {
                  icon: '🏕️',
                  title: '데크 3시간 · 집기 일체',
                  description: '4인 기준 · 최대 8인 · 안전 안내 포함',
                },
                {
                  icon: '🍖',
                  title: '콜키지 프리 (외부 음식·주류 자유 반입)',
                  description: '모든 식재료·음료 자유 반입 · 추가 요금 없음',
                },
                {
                  icon: '🥩',
                  title: '파트너 정육점·한식당 배달 가능',
                  description: '협의 중 · 예약 확정 시 파트너 상점 안내',
                },
                {
                  icon: '✨',
                  title: '체험 프로그램 이용 자격 (데크 예약자 전용)',
                  description: '영어 튜터 · 와사비 강판 · 심화 투어 (평일 오전 1타임 / 주말 2타임)',
                },
              ]}
            />
          </section>

          {/* 월별 수확 달력 (Sprint-03) */}
          <section className="px-4 pt-4">
            <HarvestCalendar currentMonth={currentMonth} />
          </section>

          {/* 데크 선택 */}
          <section className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-gray-900">데크 선택 <span className="text-xs text-gray-400 font-medium">· 총 {TOTAL_DECKS}개</span></h3>
              {selectedDeckId && (
                <button onClick={() => setSelectedDeckId(null)} className="text-xs text-gray-500 font-bold">선택 해제</button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {DECKS.map(deck => (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                    selectedDeckId === deck.id
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  {selectedDeckId === deck.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <i className="ri-check-line text-white text-xs" />
                    </div>
                  )}
                  <i className={`ri-tent-line text-2xl mb-1 ${selectedDeckId === deck.id ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-black ${selectedDeckId === deck.id ? 'text-orange-900' : 'text-gray-700'}`}>{deck.id}번</span>
                  <span className="text-[9px] text-gray-400">8인</span>
                </button>
              ))}
            </div>
          </section>

          {/* 예약 폼 */}
          {selectedDeckId && (
            <section className="px-4 pb-6 mt-2">
              <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-4">{selectedDeckId}번 데크 예약 정보</h3>

                <div className="mb-4">
                  <label className="block text-xs font-black text-gray-600 mb-2">날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {selectedDate && (
                    <p className={`text-xs mt-1 font-semibold ${weekend ? 'text-orange-600' : 'text-blue-600'}`}>
                      {weekend ? '주말/공휴일 요금 적용' : '평일 요금 적용'}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-gray-600">이용 시간대 <span className="text-gray-400 font-medium">(기본 3시간)</span></label>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${weekend ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {weekend ? `주말 ${WEEKEND_SLOTS.length}타임` : `평일 ${WEEKDAY_SLOTS.length}타임`}
                    </span>
                  </div>
                  <div className={`grid gap-2 ${availableSlots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 px-2 rounded-xl transition-all ${
                          selectedTime === slot.time
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-[1.02]'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className={`block text-[10px] font-bold ${selectedTime === slot.time ? 'opacity-90' : 'opacity-60'}`}>{slot.label}</span>
                        <span className="block text-sm font-black mt-0.5">{slot.time} ~ {slot.endTime}</span>
                      </button>
                    ))}
                  </div>
                  {!selectedDate && (
                    <p className="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                      <i className="ri-information-line" />날짜를 먼저 선택해 주세요 (평일·주말 타임 차이)
                    </p>
                  )}
                </div>

                {/* 연장 시간 */}
                {selectedTime && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-gray-600">이용 시간 연장 <span className="text-gray-400 font-medium">(시간당 {EXTEND_PRICE_PER_HOUR.toLocaleString()}원)</span></label>
                      {extendHours > 0 && (
                        <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          +{extendHours}시간 (+{extendTotal.toLocaleString()}원)
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-3 border border-orange-100">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExtendHours(h => Math.max(0, h - 1))}
                          className="w-9 h-9 flex items-center justify-center bg-white rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-40"
                          disabled={extendHours === 0}
                        >
                          <i className="ri-subtract-line text-gray-700" />
                        </button>
                        <div className="flex-1 text-center">
                          {extendHours === 0 ? (
                            <p className="text-xs font-black text-gray-500">연장 없음 (기본 3시간 이용)</p>
                          ) : (
                            <>
                              <p className="text-sm font-black text-orange-700">{extendHours}시간 연장</p>
                              <p className="text-[10px] text-gray-500">총 이용: {3 + extendHours}시간</p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setExtendHours(h => Math.min(6, h + 1))}
                          className="w-9 h-9 flex items-center justify-center bg-white rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-40"
                          disabled={extendHours >= 6}
                        >
                          <i className="ri-add-line text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-gray-600">인원 <span className="text-gray-400 font-medium">(4인 기준 · 최대 8인)</span></label>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {guestCount}명 / 8명
                    </span>
                  </div>

                  {/* -/+ 버튼 + 직접 입력 */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setGuestCount(prev => {
                          const n = parseInt(prev) || 1;
                          return String(Math.max(1, n - 1));
                        });
                      }}
                      disabled={(parseInt(guestCount) || 1) <= 1}
                      className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="인원 감소"
                    >
                      <i className="ri-subtract-line text-xl text-gray-700" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={DECK_BASE.capacity}
                      value={guestCount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v)) { setGuestCount(''); return; }
                        const clamped = Math.min(DECK_BASE.capacity, Math.max(1, v));
                        setGuestCount(String(clamped));
                      }}
                      onBlur={() => {
                        if (!guestCount) setGuestCount('1');
                      }}
                      className="flex-1 text-center text-xl font-black text-gray-900 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl h-11 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setGuestCount(prev => {
                          const n = parseInt(prev) || 1;
                          return String(Math.min(DECK_BASE.capacity, n + 1));
                        });
                      }}
                      disabled={(parseInt(guestCount) || 1) >= DECK_BASE.capacity}
                      className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="인원 증가"
                    >
                      <i className="ri-add-line text-xl text-gray-700" />
                    </button>
                  </div>

                  {/* 빠른 선택 버튼 */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 4, 6, 8].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setGuestCount(String(n));
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          parseInt(guestCount) === n
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {n}명
                      </button>
                    ))}
                  </div>

                  {/* 4인 초과 추가 요금 안내 */}
                  <div className={`mt-3 rounded-xl p-3 border flex items-start gap-2 ${
                    extraGuests > 0
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <i className={`ri-information-line text-sm mt-0.5 ${extraGuests > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 font-bold leading-snug">
                        기본 요금은 <b className="text-gray-700">4인 기준</b>이며, 4인 초과 시 1명당 <b className="text-orange-600">+20,000원</b>이 추가됩니다.
                      </p>
                      {extraGuests > 0 && (
                        <p className="text-[11px] font-black text-orange-700 mt-1">
                          현재 {parsedGuests}명 → +{extraGuests}명 × 20,000원 = <b>+{extraGuestTotal.toLocaleString()}원</b>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 부가 옵션 */}
                <div className="mb-4">
                  <label className="block text-xs font-black text-gray-600 mb-2">부가 옵션 <span className="text-gray-400 font-medium">(선택)</span></label>
                  <div className="space-y-2">
                    {ADDONS.map(addon => {
                      const selected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${addon.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                            <i className={`${addon.icon} text-white text-lg`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-black text-gray-900">{addon.label}</p>
                            <p className="text-[11px] text-gray-500">{addon.desc}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-black text-orange-600">+{addon.price.toLocaleString()}원</p>
                            <div className={`w-4 h-4 mt-1 ml-auto rounded-md border-2 flex items-center justify-center ${selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                              {selected && <i className="ri-check-line text-white text-[10px]" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 체험 연계 할인 */}
                <button
                  onClick={() => setCombineDiscount(v => !v)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl mb-4 border-2 transition-all ${
                    combineDiscount ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    combineDiscount ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                  }`}>
                    {combineDiscount && <i className="ri-check-line text-white text-xs" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-gray-900">스마트팜 체험 연계</p>
                    <p className="text-[11px] text-gray-500">체험 프로그램 추가 시 공간대여 10% 할인</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">-10%</span>
                </button>

                {/* 가격 내역 (상세) — translate="no" + key 로 Papago 번역 캐시 우회 */}
                <div
                  translate="no"
                  className="notranslate bg-orange-50 rounded-2xl p-4 mb-3 space-y-1.5"
                  key={`summary-${basePrice}-${extraGuestTotal}-${extendTotal}-${addonsTotal}-${bookingAddonsTotal}-${combineDiscount ? 1 : 0}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{selectedDeckId}번 데크 ({weekend ? '주말' : '평일'} · 4인 · 3시간)</span>
                    <span className="text-xs font-bold text-gray-800">{basePrice.toLocaleString()}원</span>
                  </div>
                  {extraGuests > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">+ 인원 추가 ({extraGuests}명 × 20,000원)</span>
                      <span className="text-xs font-bold text-gray-800">{extraGuestTotal.toLocaleString()}원</span>
                    </div>
                  )}
                  {extendHours > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">+ 시간 연장 ({extendHours}시간)</span>
                      <span className="text-xs font-bold text-gray-800">{extendTotal.toLocaleString()}원</span>
                    </div>
                  )}
                  {selectedAddons.map(id => {
                    const a = ADDONS.find(ad => ad.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">+ {a.label}</span>
                        <span className="text-xs font-bold text-gray-800">{a.price.toLocaleString()}원</span>
                      </div>
                    );
                  })}
                  {selectedBookingAddons.map(id => {
                    const a = BOOKING_ADDONS.find(ad => ad.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">+ {a.name}</span>
                        <span className="text-xs font-bold text-gray-800">{a.price.toLocaleString()}원</span>
                      </div>
                    );
                  })}
                  {combineDiscount && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-600">체험 연계 할인 (-10%)</span>
                      <span className="text-xs font-bold text-emerald-600">-{(subtotal - discountedPrice).toLocaleString()}원</span>
                    </div>
                  )}
                </div>

                {/* Sprint-02: 예약금 / 현장 결제 분리 */}
                <DepositBreakdown
                  total={payment.total}
                  deposit={payment.deposit}
                  remainder={payment.remainder}
                  className="mb-4"
                />

                {formError && <p className="text-xs text-red-500 mb-3 font-bold">{formError}</p>}
                <button
                  type="button"
                  onClick={handleBookDeck}
                  disabled={isPaying}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" aria-hidden="true" />
                      네이버페이 결제 중…
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-emerald-600 text-[10px] font-black" translate="no">N</span>
                      <span translate="no">네이버페이로 예약금 {payment.deposit.toLocaleString()}원 결제</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                  예약금 30% 선결제 · 잔액 {payment.remainder.toLocaleString()}원은 현장에서 결제
                </p>
              </div>
            </section>
          )}

          {/* 파트너 상점 (Sprint-03) */}
          <section className="px-4 pb-4">
            <div className="mb-2 flex items-start gap-2">
              <i className="ri-restaurant-2-fill text-orange-500" aria-hidden="true" />
              <div className="flex-1">
                <h3 className="text-sm font-black text-gray-900">파트너 상점 — 고기·식재료 배달</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  향재원 매점은 일회용 소모품만 판매하며, 고기·식재료는 파트너 정육점·한식당 배달로 제공됩니다.
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-3">
              {PARTNER_STORES.map(store => (
                <PartnerStoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>

          {/* 매점 소개 */}
          <section className="px-4 pb-6">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-36">
                <img
                  src={storeInterior}
                  alt="향재원 매점"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full mb-1 border border-white/30">
                    <i className="ri-store-2-line text-[10px]" />
                    <span className="text-[10px] font-black">향재원 매점</span>
                  </div>
                  <p className="text-sm font-black">Farm-to-Table 매점</p>
                  <p className="text-[11px] text-white/80">고추냉이 상품 · 조리도구 대여</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-600 font-medium mb-3 leading-relaxed">
                  향재원 내부 매점에서 간단한 스낵과 일회용 식기, 조리 도구를 구입·대여하실 수 있습니다.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STORE_ITEMS.map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <i className={`${item.icon} text-emerald-600 text-lg`} />
                      <p className="text-[10px] font-black text-gray-800 mt-1">{item.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════ 체험 탭 ═══════ */}
      {activeTab === 'experience' && (
        <>
          {/* 체험 프로그램 정책 안내 */}
          <section className="px-4 pt-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <i className="ri-lock-2-fill text-white text-lg" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-blue-900 mb-1">체험은 데크 예약자 전용입니다</p>
                <ul className="text-[11px] text-blue-800 leading-relaxed space-y-0.5">
                  <li>• 같은 날짜에 <b>데크 예약</b>이 있는 경우에만 체험 예약 가능</li>
                  <li>• <b>평일</b>: 오전 11:00 1타임</li>
                  <li>• <b>주말</b>: 오전 11:00 · 오후 15:00 2타임</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-black text-gray-900 mb-3">체험 프로그램 선택</h3>
            <div className="space-y-3">
              {EXPERIENCE_PROGRAMS.map(prog => (
                <button
                  key={prog.id}
                  onClick={() => setSelectedExp(prog.id)}
                  className={`w-full bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all text-left ${
                    selectedExp === prog.id ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <div className="relative h-28">
                    <img src={prog.image} alt={prog.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className={`absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-gradient-to-br ${prog.color} rounded-xl shadow`}>
                      <i className={`${prog.icon} text-white text-base`} />
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <p className="text-white font-black text-sm">{prog.name}</p>
                      <p className="text-white/70 text-xs">{prog.duration} · {prog.unit}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">{prog.desc}</p>
                    <p className="text-base font-black text-emerald-600 flex-shrink-0 ml-3">{prog.price.toLocaleString()}원</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {selectedExp && (
            <section className="px-4 pb-6 mt-2">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">예약 정보</h3>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {selectedDate && !hasDeckBookingOnSelectedDate && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                      <i className="ri-error-warning-fill text-red-500 text-sm mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-red-700">해당 날짜에 데크 예약이 없습니다</p>
                        <p className="text-[10px] text-red-600 mt-0.5">
                          체험은 데크 예약자 전용입니다. 먼저 공간 대여 탭에서 데크를 예약해 주세요.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setActiveTab('deck'); setFormError(''); }}
                          className="mt-1.5 text-[11px] font-black text-red-700 underline"
                        >
                          → 공간 대여 탭으로 이동
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedDate && hasDeckBookingOnSelectedDate && (
                    <p className="text-[11px] mt-2 font-bold text-emerald-600 flex items-center gap-1">
                      <i className="ri-checkbox-circle-fill" />
                      해당 날짜에 데크 예약이 확인되었습니다
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">시간대</label>
                  <div className={`grid gap-2 ${availableSlots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-2 rounded-xl transition-all ${
                          selectedTime === slot.time ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="block text-[10px] opacity-70">{slot.label}</span>
                        <span className="block text-xs font-black">{slot.time}~{slot.endTime}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">인원</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setGuestCount(prev => String(Math.max(1, (parseInt(prev) || 1) - 1)));
                      }}
                      disabled={(parseInt(guestCount) || 1) <= 1}
                      className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30 flex-shrink-0"
                      aria-label="인원 감소"
                    >
                      <i className="ri-subtract-line text-xl text-gray-700" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={guestCount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (isNaN(v)) { setGuestCount(''); return; }
                        setGuestCount(String(Math.max(1, Math.min(50, v))));
                      }}
                      onBlur={() => { if (!guestCount) setGuestCount('1'); }}
                      className="flex-1 text-center text-xl font-black text-gray-900 bg-emerald-50 border-2 border-emerald-200 rounded-xl h-11 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setGuestCount(prev => String((parseInt(prev) || 1) + 1));
                      }}
                      className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex-shrink-0"
                      aria-label="인원 증가"
                    >
                      <i className="ri-add-line text-xl text-gray-700" />
                    </button>
                  </div>
                </div>

                <DepositBreakdown
                  total={expTotal}
                  deposit={splitBookingPayment(expTotal).deposit}
                  remainder={splitBookingPayment(expTotal).remainder}
                  className="mb-4"
                />

                {formError && <p className="text-xs text-red-500 mb-3">{formError}</p>}
                <button
                  type="button"
                  onClick={handleBookExp}
                  disabled={isPaying || expTotal === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" aria-hidden="true" />
                      네이버페이 결제 중…
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-emerald-600 text-[10px] font-black" translate="no">N</span>
                      <span translate="no">네이버페이로 예약금 {splitBookingPayment(expTotal).deposit.toLocaleString()}원 결제</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {/* 예약 내역 */}
      <section className="px-4 pb-6">
        <h3 className="text-sm font-black text-gray-900 mb-3">예약 내역</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">예약 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  booking.type === 'deck' ? 'bg-orange-100' : 'bg-emerald-100'
                }`}>
                  <i className={`${booking.type === 'deck' ? 'ri-tent-line text-orange-600' : 'ri-seedling-line text-emerald-600'} text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{booking.name}</p>
                  <p className="text-xs text-gray-500">{booking.date} · {booking.time} · {booking.guests}명</p>
                  {booking.addons && booking.addons.length > 0 && (
                    <p className="text-[11px] text-orange-600 font-bold mt-0.5">+ {booking.addons.join(', ')}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-gray-900">{booking.price.toLocaleString()}원</p>
                  <span className="text-xs text-green-600 font-semibold">확정</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 이용 안내 */}
      <section className="px-4 pb-6">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex gap-3">
            <i className="ri-information-line text-xl text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-black text-blue-900 mb-1.5">이용 안내</h4>
              <ul className="text-xs text-blue-700 space-y-1 leading-relaxed">
                <li>• <b>파머스 글램핑 데크 8개</b>: 각 데크 전용 텃밭에서 시기별 작물 직접 수확</li>
                <li>• <b>메인 하우스 150평</b>: 한국 국산 고추냉이 스마트팜 (가이드 투어 전용·수확 불가)</li>
                <li className="text-red-700 font-black">⚠ 메인 하우스 내부 IoT 장비는 <b>손대지 마세요</b></li>
                <li>• 모든 데크는 <b>4인 기준</b> · 최대 8인 수용</li>
                <li>• <b>4인 초과 시 1명당 +20,000원</b> 추가</li>
                <li>• <b>데크 타임 - 평일 2타임</b>: 11:00~14:00 / 18:00~21:00 (3시간)</li>
                <li>• <b>데크 타임 - 주말 3타임</b>: 11:00~14:00 / 15:00~18:00 / 18:00~21:00 (3시간)</li>
                <li>• <b>체험 프로그램</b>: 데크 예약자 전용 · 평일 오전 1타임 · 주말 오전·오후 2타임</li>
                <li>• 시간 연장 시 <b>1텐트당 시간당 40,000원</b></li>
                <li>• 외부 <b>음식·주류 반입 전면 허용</b> (콜키지 프리)</li>
                <li>• 고기 필요 시 <b>파트너 정육점 배달</b> 가능 (협의 중)</li>
                <li>• 매점에서 일회용 소모품·스낵·음료 구입 가능 (고기·식재료 판매 없음)</li>
                <li>• <b>불멍 세트 · 숯불 그릴</b> 추가 가능</li>
                <li>• 예약금 30% 네이버페이 선결제 · 잔액은 현장 결제</li>
                <li>• 취소는 2일 전까지 무료 · 1일 전 50% · 당일 환불 불가</li>
                {/* TODO: 🟡 EDIT:PHONE ─ 대표 전화번호 */}
                <li>• 문의: 010-4929-0070</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <BottomNav />
    </div>
  );
}
