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
import { useCustomImage } from '@/hooks/useCustomImage';
import type { ImageKey } from '@/lib/imageStore';
import { requestNaverPayMock, splitBookingPayment } from '@/lib/naverPayMock';
import { calcHarvestGrams, getHarvestForMonth, PARTNER_STORES, BOOKING_ADDONS } from '@/data/products';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

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
  /** 애견 동반 마릿수 (7번·8번 데크 한정) */
  petCount?: number;
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

/* 애견 동반 허용 데크 — 7번, 8번만 가능 */
const PET_FRIENDLY_DECKS = [7, 8];

/* 애견 동반 정책 */
const PET_POLICY = {
  feePerPet: 10000,      // 마리당 추가 요금 (원)
  maxPets: 2,            // 데크당 최대 동반 가능 마릿수
  weightLimit: 15,       // 소·중형견 체중 제한 (kg)
  allowedDecks: PET_FRIENDLY_DECKS,
};

/* 8개 데크 목록 (추후 관리자에서 상태 변경 가능) */
const DECKS = Array.from({ length: TOTAL_DECKS }, (_, i) => ({
  id: i + 1,
  label: `${i + 1}번 데크`,
  petFriendly: PET_FRIENDLY_DECKS.includes(i + 1),
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

/* 체험 프로그램은 데크 예약자 전용. */
const EXPERIENCE_PROGRAMS = [
  {
    id: 'tutor',
    name: '영어 튜터 프로그램',
    duration: '60분',
    price: 45000,
    unit: '1인',
    icon: 'ri-book-open-line',
    color: 'from-blue-500 to-indigo-600',
    image: BASE + '/facility-images/facility-16.jpg',
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
    image: BASE + '/facility-images/facility-00.jpg',
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


/** 체험 프로그램 선택 정보 */
type SelectedExperience = {
  id: string;
  time: string;  // 체험 진행 시각 (평일 11:00 / 주말 11:00 또는 15:00)
};

/* 데크 공간 소개 캐러셀 — 관리자 페이지에서 업로드한 이미지가 있으면 그것을 사용, 없으면 fallback */
const DECK_SLIDES: { key: ImageKey; fallback: string; caption: string; tag: '외부' | '내부' | '항공뷰' | '3D 렌더링' }[] = [
  {
    key: 'deck-slide-1',
    fallback: BASE + '/facility-images/KakaoTalk_20260410_165225697_03.png',
    caption: 'A-frame 데크 · 석양 조명',
    tag: '외부',
  },
  {
    key: 'deck-slide-2',
    fallback: BASE + '/facility-images/KakaoTalk_20260410_165225697_02.png',
    caption: '데크 내부 · 플랜트 라운지',
    tag: '내부',
  },
  {
    key: 'deck-slide-3',
    fallback: BASE + '/facility-images/A_street_view-style_3D_rendering_of_Hyangjaewons_-1760446648462.png',
    caption: '사이트 전경 · 낮 · 벚꽃길',
    tag: '3D 렌더링',
  },
  {
    key: 'deck-slide-4',
    fallback: BASE + '/facility-images/향재원 조감도 (7).png',
    caption: '8개 데크 · 낮 항공뷰',
    tag: '항공뷰',
  },
  {
    key: 'deck-slide-5',
    fallback: BASE + '/facility-images/A_detailed_3D_rendering_of_a_luxurious_glamping_si-1760445157424.png',
    caption: '스마트팜 공간대여 · 3D 렌더링',
    tag: '3D 렌더링',
  },
];

/** 데크 슬라이드 개별 이미지 (커스텀 업로드 자동 반영) */
function DeckSlideImage({ slide, active, eager }: { slide: { key: ImageKey; fallback: string; caption: string }; active: boolean; eager: boolean }) {
  const src = useCustomImage(slide.key, slide.fallback);
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!active}
    >
      <img
        src={src}
        alt={slide.caption}
        className={`w-full h-full object-cover ${active ? 'animate-ken-burns' : ''}`}
        loading={eager ? 'eager' : 'lazy'}
      />
    </div>
  );
}

export default function Booking() {
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
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
  /** 선택된 체험 프로그램 — 최대 1개씩 선택 (id → 진행 시각) */
  const [selectedExperiences, setSelectedExperiences] = useState<SelectedExperience[]>([]);
  /** 애견 동반 마릿수 (0~최대 2) */
  const [petCount, setPetCount] = useState(0);
  /** 애견 동반 주의사항 동의 여부 */
  const [petRulesAgreed, setPetRulesAgreed] = useState(false);
  /** 데크 공간 소개 캐러셀 인덱스 */
  const [deckSlideIndex, setDeckSlideIndex] = useState(0);

  // 데크 캐러셀 자동 전환 (6초 간격)
  useEffect(() => {
    const timer = setInterval(() => {
      setDeckSlideIndex(prev => (prev + 1) % DECK_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentMonth = new Date().getMonth() + 1;
  const currentHarvest = getHarvestForMonth(currentMonth);

  const weekend = isWeekend(selectedDate);
  const availableSlots = weekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  const experienceSlots = weekend ? EXPERIENCE_WEEKEND_SLOTS : EXPERIENCE_WEEKDAY_SLOTS;
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
  // 체험 프로그램 총액 — 인당 요금 × 참여 인원
  const experienceTotal = selectedExperiences.reduce((sum, exp) => {
    const prog = EXPERIENCE_PROGRAMS.find(p => p.id === exp.id);
    if (!prog) return sum;
    return sum + prog.price * parsedGuests;
  }, 0);
  // 애견 동반 추가 요금 — 7번·8번 데크만 가능
  const isPetFriendlyDeck = Boolean(selectedDeckId && PET_FRIENDLY_DECKS.includes(selectedDeckId));
  const petTotal = isPetFriendlyDeck ? petCount * PET_POLICY.feePerPet : 0;
  const subtotal = basePrice + extraGuestTotal + extendTotal + addonsTotal + bookingAddonsTotal + experienceTotal + petTotal;
  const discountedPrice = combineDiscount ? Math.round(subtotal * 0.9) : subtotal;
  const payment = splitBookingPayment(discountedPrice);
  const harvestGrams = calcHarvestGrams(parsedGuests);

  // 날짜가 바뀌면 현재 선택된 시간이 평일/주말 슬롯 목록에 없을 때 초기화
  useEffect(() => {
    if (selectedTime && !availableSlots.find(s => s.time === selectedTime)) {
      setSelectedTime('');
    }
    // 체험 시간도 날짜 변경 시 재검증 — 평일↔주말 전환 시 잘못된 시간 초기화
    setSelectedExperiences(prev =>
      prev
        .map(exp => {
          const stillValid = experienceSlots.find(s => s.time === exp.time);
          return stillValid ? exp : { ...exp, time: experienceSlots[0]?.time ?? '' };
        })
        .filter(exp => exp.time !== ''),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleExperience = (id: string) => {
    setSelectedExperiences(prev => {
      const exists = prev.find(e => e.id === id);
      if (exists) return prev.filter(e => e.id !== id);
      // 신규 선택 시 기본 시간 = 첫 번째 사용 가능 슬롯
      const defaultTime = experienceSlots[0]?.time ?? '';
      if (!defaultTime) return prev;
      return [...prev, { id, time: defaultTime }];
    });
  };

  const updateExperienceTime = (id: string, time: string) => {
    setSelectedExperiences(prev => prev.map(e => (e.id === id ? { ...e, time } : e)));
  };

  const handleBookDeck = async () => {
    if (!selectedDeckId || !selectedDate || !selectedTime) {
      setFormError('데크, 날짜, 시간을 모두 선택해주세요.');
      return;
    }
    if (isPetFriendlyDeck && petCount > 0 && !petRulesAgreed) {
      setFormError('애견 동반 시 주의사항에 동의해 주세요.');
      return;
    }
    setFormError('');

    const addonLabels = selectedAddons.map(id => ADDONS.find(a => a.id === id)?.label ?? '').filter(Boolean);
    if (extendHours > 0) addonLabels.push(`${extendHours}시간 연장`);
    selectedBookingAddons.forEach(id => {
      const a = BOOKING_ADDONS.find(b => b.id === id);
      if (a) addonLabels.push(a.name);
    });
    selectedExperiences.forEach(exp => {
      const prog = EXPERIENCE_PROGRAMS.find(p => p.id === exp.id);
      if (prog) addonLabels.push(`${prog.name} (${exp.time}, ${parsedGuests}인)`);
    });
    if (isPetFriendlyDeck && petCount > 0) {
      addonLabels.push(`애견 동반 ${petCount}마리`);
    }

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
        name: `${selectedDeckId}번 스마트팜 체험 데크 · ${parsedGuests}인 · ${3 + extendHours}시간`,
        deckId: selectedDeckId,
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guestCount) || 4,
        price: discountedPrice,
        depositAmount: payment.deposit,
        remainderAmount: payment.remainder,
        depositTransactionId: result.transactionId,
        addons: addonLabels,
        petCount: isPetFriendlyDeck && petCount > 0 ? petCount : undefined,
        createdAt: new Date().toISOString(),
      };
      setBookings(prev => [newBooking, ...prev]);
      setSelectedDeckId(null);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedAddons([]);
      setSelectedBookingAddons([]);
      setSelectedExperiences([]);
      setPetCount(0);
      setPetRulesAgreed(false);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="체험·공간대여" subtitle="Farm-to-Table 향재원" />

      {/* Hero Banner — 스마트팜 공간대여 캐러셀 (Ken Burns + 자동 전환) */}
      <section className="relative h-64 overflow-hidden">
        {DECK_SLIDES.map((slide, i) => (
          <DeckSlideImage
            key={slide.key}
            slide={slide}
            active={i === deckSlideIndex}
            eager={i === 0}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70 pointer-events-none" />

        {/* 반짝이는 라이트 스윕 효과 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-y-4 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div key={`hero-caption-${deckSlideIndex}`} className="animate-slide-in-left">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xl px-2.5 py-1 rounded-full mb-2 border border-white/25">
              <i className="ri-plant-fill text-xs text-emerald-300" aria-hidden="true" />
              <span className="text-[10px] font-black">스마트팜 공간대여 · 체험 데크 8개소</span>
            </div>
            <h2 className="text-xl font-black mb-0.5 tracking-tight">향재원 스마트팜 공간대여</h2>
            <p className="text-[11px] text-emerald-200 font-bold">{DECK_SLIDES[deckSlideIndex].caption}</p>
          </div>
        </div>
      </section>

      {/* ═══════ 공간 대여 (체험 프로그램 통합) ═══════ */}

          {/* 🚨 중요 고지 — 스마트팜 공간대여 서비스 (글램핑 아님) */}
          <section className="px-4 pt-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <i className="ri-alert-fill text-white text-lg" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-emerald-900 mb-1">
                    본 시설은 <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded">스마트팜 공간대여 서비스</span>입니다
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    일반 글램핑 시설이 아닙니다. <b>한국 국산 고추냉이 스마트팜(150평)</b>과 데크별 전용 텃밭이
                    실제로 운영되는 <b>농업 체험 공간대여</b>이며, IoT 센서·관수 장비 등 재배 설비에는 손대지 말아 주세요.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 가격 정보 카드 — 심플 */}
          <section className="px-4 pt-5">
            <div className="rounded-3xl bg-white shadow-sm border border-gray-100">
              {/* 히어로 캐러셀 인디케이터 */}
              <div className="flex items-center justify-between px-5 pt-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500">Smart Farm Space · 서울 양재동</p>
                  <h3 className="text-base font-black tracking-tight text-gray-900 mt-0.5">데크별 전용 텃밭</h3>
                </div>
                <div className="flex gap-1.5 items-center">
                  {DECK_SLIDES.map((_, i) => (
                    <button
                      key={`dot-${i}`}
                      type="button"
                      onClick={() => setDeckSlideIndex(i)}
                      aria-label={`${i + 1}번째 슬라이드`}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === deckSlideIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  메인 하우스에서는 <b className="text-gray-800">한국 국산 고추냉이</b>를 재배하며,
                  각 데크는 <b className="text-gray-800">시기별 쌈채소·딸기</b>를 직접 수확할 수 있는 전용 텃밭과 함께 운영됩니다.
                </p>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 rounded-2xl bg-gray-50 px-3 py-2.5">
                    <p className="text-[10px] text-gray-500">평일 · 4인</p>
                    <p className="text-sm font-black text-gray-900" translate="no">{DECK_BASE.weekday.toLocaleString()}원</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-gray-50 px-3 py-2.5">
                    <p className="text-[10px] text-gray-500">주말 · 4인</p>
                    <p className="text-sm font-black text-gray-900" translate="no">{DECK_BASE.weekend.toLocaleString()}원</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-emerald-50 px-3 py-2.5">
                    <p className="text-[10px] text-emerald-700">+1명당</p>
                    <p className="text-sm font-black text-emerald-700" translate="no">20,000원</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 콜키지 프리 — 한 줄 배너만 */}
          <section className="px-4 pt-4">
            <ColkijeFreeBanner />
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
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    if (!PET_FRIENDLY_DECKS.includes(deck.id)) {
                      // 애견 불가 데크 선택 시 애견 관련 상태 초기화
                      setPetCount(0);
                      setPetRulesAgreed(false);
                    }
                  }}
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
                  {deck.petFriendly && selectedDeckId !== deck.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm" title="애견 동반 가능">
                      <span className="text-[10px]" aria-hidden="true">🐕</span>
                    </div>
                  )}
                  <i className={`ri-tent-line text-2xl mb-1 ${selectedDeckId === deck.id ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-black ${selectedDeckId === deck.id ? 'text-orange-900' : 'text-gray-700'}`}>{deck.id}번</span>
                  <span className="text-[9px] text-gray-400">8인</span>
                  {deck.petFriendly && (
                    <span className="text-[8px] font-black text-amber-600 mt-0.5">애견 OK</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3 font-bold">
              🐕 애견 동반은 <b className="text-amber-600">7번·8번 데크</b>만 가능합니다
            </p>
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

                {/* 체험 프로그램 (데크 예약자 전용 · 인당 요금) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-gray-600">
                      체험 프로그램 <span className="text-gray-400 font-medium">(선택 · 인당)</span>
                    </label>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {weekend ? '주말 2타임' : '평일 1타임'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                    데크 예약자에게만 제공 · 평일 오전 11시 1회 / 주말 오전 11시·오후 3시 2회 운영
                  </p>
                  <div className="space-y-2">
                    {EXPERIENCE_PROGRAMS.map(prog => {
                      const selected = selectedExperiences.find(e => e.id === prog.id);
                      const isSelected = Boolean(selected);
                      return (
                        <div
                          key={prog.id}
                          className={`rounded-xl border-2 transition-all ${
                            isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleExperience(prog.id)}
                            className="w-full flex items-center gap-3 p-3 text-left"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prog.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                              <i className={`${prog.icon} text-white text-lg`} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-900 truncate">{prog.name}</p>
                              <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">{prog.desc}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[11px] font-black text-emerald-600" translate="no">
                                {prog.price.toLocaleString()}원/{prog.unit}
                              </p>
                              <div className={`w-4 h-4 mt-1 ml-auto rounded-md border-2 flex items-center justify-center ${
                                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <i className="ri-check-line text-white text-[10px]" aria-hidden="true" />}
                              </div>
                            </div>
                          </button>
                          {isSelected && (
                            <div className="px-3 pb-3 pt-1 border-t border-emerald-200">
                              <p className="text-[10px] text-gray-600 font-bold mb-1.5">체험 시간 선택</p>
                              <div className={`grid gap-1.5 ${experienceSlots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {experienceSlots.map(slot => (
                                  <button
                                    key={slot.time}
                                    type="button"
                                    onClick={() => updateExperienceTime(prog.id, slot.time)}
                                    className={`py-2 rounded-lg text-xs font-black transition-all ${
                                      selected?.time === slot.time
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
                                    }`}
                                  >
                                    {slot.label} {slot.time}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-emerald-700 font-bold mt-2" translate="no">
                                {parsedGuests}인 × {prog.price.toLocaleString()}원 = {(parsedGuests * prog.price).toLocaleString()}원
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 애견 동반 (7번·8번 데크만) */}
                {isPetFriendlyDeck && (
                  <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl" aria-hidden="true">🐕</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-amber-900">애견 동반 가능 데크</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                          {selectedDeckId}번 데크는 반려견 동반 전용입니다 · 마리당 <b>{PET_POLICY.feePerPet.toLocaleString()}원</b> · 최대 {PET_POLICY.maxPets}마리
                        </p>
                      </div>
                    </div>

                    {/* 마릿수 선택 */}
                    <div className="bg-white rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-gray-600">반려견 동반 마릿수</span>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full" translate="no">
                          {petCount}마리 / {PET_POLICY.maxPets}마리
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPetCount(prev => {
                              const next = Math.max(0, prev - 1);
                              if (next === 0) setPetRulesAgreed(false);
                              return next;
                            });
                          }}
                          disabled={petCount === 0}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
                          aria-label="반려견 감소"
                        >
                          <i className="ri-subtract-line text-gray-700" />
                        </button>
                        <div className="flex-1 text-center">
                          <p className="text-2xl font-black text-amber-700" translate="no">{petCount}</p>
                          <p className="text-[10px] text-gray-500">마리</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPetCount(prev => Math.min(PET_POLICY.maxPets, prev + 1))}
                          disabled={petCount >= PET_POLICY.maxPets}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
                          aria-label="반려견 증가"
                        >
                          <i className="ri-add-line text-gray-700" />
                        </button>
                      </div>
                      {petCount > 0 && (
                        <p className="text-[11px] font-black text-amber-700 text-center mt-2" translate="no">
                          {petCount}마리 × {PET_POLICY.feePerPet.toLocaleString()}원 = {(petCount * PET_POLICY.feePerPet).toLocaleString()}원
                        </p>
                      )}
                    </div>

                    {/* 주의사항 */}
                    {petCount > 0 && (
                      <>
                        <div className="bg-white rounded-xl p-3 mb-3 border border-amber-200">
                          <p className="text-[11px] font-black text-amber-900 mb-2 flex items-center gap-1">
                            <i className="ri-alert-fill text-amber-600" aria-hidden="true" />
                            애견 동반 주의사항 (필독)
                          </p>
                          <ul className="text-[10px] text-gray-700 leading-relaxed space-y-1">
                            <li>• <b>동반 가능</b>: 소·중형견 ({PET_POLICY.weightLimit}kg 이하) · 대형견 사전 협의 필수</li>
                            <li>• <b>예방접종</b>: 광견병 등 필수 예방접종 완료견만 · 1년 이내 증빙 지참 권장</li>
                            <li>• <b>리드줄</b>: 공용 구역(데크 외) 상시 <b>1.5m 이하 리드줄</b> + 주인 동행 필수</li>
                            <li>• <b>출입 금지 구역</b>: 메인 하우스(고추냉이 스마트팜) · 전용 텃밭 · 공용 식당 내부</li>
                            <li>• <b>배변 처리</b>: 배변 봉투 필수 지참 · 주인이 <b>즉시 수거</b></li>
                            <li>• <b>소음 관리</b>: 타 고객 배려 · 짖음 지속 시 퇴장 조치 가능</li>
                            <li>• <b>심야 관리</b>: 22시 이후 데크 밖 출입 자제</li>
                            <li>• <b>책임·배상</b>: 기물 파손·타 고객 피해 발생 시 <b>동반자 전액 배상</b></li>
                            <li>• <b>특수 청소비</b>: 심한 오염 발생 시 최대 <b>50,000원</b> 별도 청구</li>
                            <li>• <b>금지 견종</b>: 전염성 질환 · 공격성 있는 견종 동반 불가</li>
                            <li>• <b>면책</b>: 반려견 분실·부상에 대해 향재원은 책임지지 않습니다</li>
                          </ul>
                        </div>

                        {/* 동의 체크박스 */}
                        <button
                          type="button"
                          onClick={() => setPetRulesAgreed(v => !v)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            petRulesAgreed ? 'border-emerald-500 bg-emerald-50' : 'border-amber-300 bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            petRulesAgreed ? 'border-emerald-500 bg-emerald-500' : 'border-amber-400'
                          }`}>
                            {petRulesAgreed && <i className="ri-check-line text-white text-xs" aria-hidden="true" />}
                          </div>
                          <span className="text-xs font-black text-gray-800 text-left">
                            위 주의사항을 모두 읽고 동의합니다
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}

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
                  {selectedExperiences.map(exp => {
                    const prog = EXPERIENCE_PROGRAMS.find(p => p.id === exp.id);
                    if (!prog) return null;
                    const lineTotal = prog.price * parsedGuests;
                    return (
                      <div key={exp.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          + {prog.name} ({exp.time} · {parsedGuests}인)
                        </span>
                        <span className="text-xs font-bold text-gray-800">{lineTotal.toLocaleString()}원</span>
                      </div>
                    );
                  })}
                  {isPetFriendlyDeck && petCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700">+ 애견 동반 ({petCount}마리 × {PET_POLICY.feePerPet.toLocaleString()}원) 🐕</span>
                      <span className="text-xs font-bold text-amber-700">{petTotal.toLocaleString()}원</span>
                    </div>
                  )}
                  {combineDiscount && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-600">할인 (-10%)</span>
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

          {/* 데크 예약 포함 내역 — 데크 선택 및 예약 폼 이후로 이동 */}
          <section className="px-4 pt-6">
            <div className="mb-3">
              <h3 className="text-sm font-black text-gray-900">데크 예약에 포함된 것</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">전부 기본 요금에 포함됩니다</p>
            </div>
            <IncludedItemsList
              items={[
                {
                  icon: '🌱',
                  title: `내 데크 전용 텃밭 수확 ${harvestGrams}g`,
                  description: `${currentMonth}월 시기별 작물: ${[...currentHarvest.primary, ...currentHarvest.rotation].join(' · ') || '상추·깻잎'}`,
                  highlight: true,
                },
                {
                  icon: '🌿',
                  title: '메인 하우스 스마트팜 투어 20분',
                  description: '고추냉이 IoT 재배 견학 · 웰컴 와사비 시식',
                },
                {
                  icon: '🏕️',
                  title: '데크 3시간 · 집기 일체',
                  description: '4인 기준 · 최대 8인 수용',
                },
                {
                  icon: '🍖',
                  title: '콜키지 프리',
                  description: '외부 음식·주류 자유 반입 · 추가 요금 없음',
                },
              ]}
            />
          </section>

          {/* 월별 수확 달력 — 데크 선택 및 예약 폼 이후로 이동 */}
          <section className="px-4 pt-4 pb-8">
            <div className="mb-3">
              <h3 className="text-sm font-black text-gray-900">시기별 수확 작물</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">월별로 수확 가능한 작물이 달라집니다</p>
            </div>
            <HarvestCalendar currentMonth={currentMonth} />
          </section>

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

      {/* 이용 안내 — 접이식 */}
      <section className="px-4 pb-8">
        <details className="group rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
            <span className="text-sm font-black text-gray-900">이용 안내</span>
            <i className="ri-arrow-down-s-line text-xl text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true" />
          </summary>
          <div className="px-5 pb-5">
            <ul className="text-[12px] text-gray-600 space-y-1.5 leading-relaxed">
              <li>• 4인 기준 · 최대 8인 · 1명당 +20,000원</li>
              <li>• 평일 2타임 / 주말 3타임 · 기본 3시간</li>
              <li>• 시간 연장: 시간당 +40,000원</li>
              <li>• 체험 프로그램: 데크 예약자 전용</li>
              <li>• 콜키지 프리 · 파트너 정육점 배달 가능</li>
              <li>• 예약금 30% 네이버페이 선결제, 잔액 현장</li>
              <li>• 취소: 2일 전 무료 · 1일 전 50% · 당일 불가</li>
              <li className="text-red-600 font-bold">⚠ 메인 하우스 IoT 장비는 손대지 마세요</li>
              <li className="pt-1 border-t border-gray-200 mt-2" translate="no">문의 · 010-4929-0070</li>
            </ul>
          </div>
        </details>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <BottomNav />
    </div>
  );
}
