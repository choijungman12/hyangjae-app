/**
 * 향재원 제품 데이터
 *
 * 2026년 9월 정식 오픈 예정. 현재 표기된 가격은 예상 판매가이며,
 * 실제 출시 전에 관리자 페이지에서 수정 가능합니다.
 *
 * ═══════════════════════════════════════════════════════════
 * ! 🔴 수정 포인트:
 *   * 🟢 EDIT:PRODUCT_PRICE  → 각 제품 price / originalPrice
 *   * 🟢 EDIT:PRODUCT_STOCK  → 각 제품 stock (재고 수량)
 *   ? 🔵 EDIT:PRODUCT_EMOJI  → emoji (썸네일 이모지)
 *   🟣 EDIT:EXT_SHOP         → externalLinks (네이버/쿠팡/11번가 URL)
 *   TODO: 🟡 EDIT:PRODUCT_DESC → description / features / howToUse
 * ═══════════════════════════════════════════════════════════
 */

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  emoji: string;
  gradient: string;
  price: number;         // 판매가 (원)
  originalPrice?: number; // 할인 전 가격
  unit: string;          // 단위 (예: '200g', '500ml')
  shortDesc: string;     // 카드용 짧은 설명
  description: string;   // 상세 설명
  ingredients: string[]; // 주요 원료
  features: string[];    // 특징 (4~6개 불릿)
  howToUse: string[];    // 사용법/레시피
  storage: string;       // 보관 방법
  shelfLife: string;     // 유통기한
  stock: number;         // 재고
  tag?: 'new' | 'best' | 'limited';
  externalLinks: {
    naver?: string;      // 네이버 스마트스토어
    coupang?: string;    // 쿠팡
    eleven?: string;     // 11번가
  };
}

export type ProductCategory =
  | 'paste'      // 쌈장·페이스트
  | 'condiment'  // 조미료 (소금·가루)
  | 'beverage'   // 음료·원액차
  | 'processed'  // 가공식품 (어묵·절임)
  | 'raw';       // 생고추냉이 근경

export const CATEGORY_LABELS: Record<ProductCategory, { label: string; icon: string; gradient: string }> = {
  paste:     { label: '쌈장·페이스트', icon: 'ri-seasoning-line',   gradient: 'from-emerald-400 to-green-600' },
  condiment: { label: '조미료',        icon: 'ri-scales-3-line',   gradient: 'from-amber-400 to-orange-500' },
  beverage:  { label: '음료·차',      icon: 'ri-cup-line',          gradient: 'from-teal-400 to-cyan-600' },
  processed: { label: '가공식품',      icon: 'ri-restaurant-line',  gradient: 'from-orange-400 to-red-500' },
  raw:       { label: '생고추냉이',    icon: 'ri-plant-line',       gradient: 'from-lime-400 to-emerald-600' },
};

// * 🟢 EDIT:PRODUCTS ─ 아래 배열에서 각 제품 정보 수정
// 🟣 각 제품의 externalLinks 는 입점 후 실제 URL로 교체 필요
export const PRODUCTS: Product[] = [
  {
    id: 'wasabi-root-fresh',
    name: '생 고추냉이 근경',
    category: 'raw',
    emoji: '🌿',
    gradient: 'from-lime-400 to-emerald-600',
    price: 48000,
    originalPrice: 55000,
    unit: '100g',
    shortDesc: '향재원 스마트팜 당일 수확',
    description: '서초구 양재동 향재원 스마트팜에서 15~18°C로 재배한 국산 고추냉이 근경입니다. 당일 수확·당일 배송으로 최상의 향과 매운맛을 그대로 전달합니다.',
    ingredients: ['국산 고추냉이 근경 100%'],
    features: [
      '당일 수확 · 당일 배송',
      '화학 비료 · 농약 무사용',
      '스마트팜 15~18°C 최적 재배',
      '직경 3~4cm · 무게 80~120g',
      '수입 대비 월등히 강한 향',
    ],
    howToUse: [
      '상어 가죽 강판에 원을 그리듯 갈아 사용',
      '갈은 직후 5분 내 섭취 시 최상의 향',
      '초밥·사시미·스테이크 고명으로 완벽',
    ],
    storage: '냉장 보관 (2~5°C)',
    shelfLife: '수확 후 2주',
    stock: 30,
    tag: 'best',
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4%20%EA%B7%BC%EA%B2%BD',
    },
  },
  {
    id: 'wasabi-ssamjang',
    name: '고추냉이 쌈장',
    category: 'paste',
    emoji: '🥬',
    gradient: 'from-emerald-400 to-green-600',
    price: 12900,
    unit: '200g',
    shortDesc: '전통 쌈장에 향재원 고추냉이를 더한 프리미엄 쌈장',
    description: '국산 된장·고추장에 향재원 고추냉이 15%를 블렌딩한 프리미엄 쌈장입니다. 고기 쌈·회 쌈에 완벽하게 어울리는 톡 쏘는 맛이 특징입니다.',
    ingredients: ['국산 된장 45%', '고추장 25%', '향재원 고추냉이 15%', '마늘', '참기름'],
    features: [
      '국산 원료 100%',
      '향재원 고추냉이 15% 함유',
      '인공 조미료 · 보존료 무첨가',
      '고기 쌈 · 회 쌈에 최적',
      '비빔밥 · 국수 소스로도 활용',
    ],
    howToUse: [
      '상추쌈·깻잎쌈에 얹어 바로 섭취',
      '회 쌈 · 전복 쌈에 디핑 소스',
      '비빔밥에 한 큰술 넣어 매콤하게',
    ],
    storage: '개봉 전 실온, 개봉 후 냉장',
    shelfLife: '제조일로부터 12개월',
    stock: 150,
    tag: 'best',
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4%20%EC%8C%88%EC%9E%A5',
      coupang: 'https://www.coupang.com/np/search?q=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4+%EC%8C%88%EC%9E%A5',
    },
  },
  {
    id: 'wasabi-salt',
    name: '고추냉이 소금',
    category: 'condiment',
    emoji: '🧂',
    gradient: 'from-amber-400 to-orange-500',
    price: 9900,
    unit: '80g',
    shortDesc: '천일염에 고추냉이 향을 입힌 시즈닝 소금',
    description: '신안 천일염에 향재원 고추냉이 분말을 블렌딩한 프리미엄 시즈닝 소금입니다. 스테이크·구이·샐러드에 뿌려 풍미를 한층 올려줍니다.',
    ingredients: ['신안 천일염 85%', '향재원 고추냉이 분말 15%'],
    features: [
      '신안 천일염 사용',
      '향재원 고추냉이 15% 함유',
      '스테이크 · 구이 · 튀김에 최적',
      '샐러드 드레싱 마무리 소금',
      '깔끔한 미네랄 감',
    ],
    howToUse: [
      '구이·튀김 마무리에 살짝 뿌리기',
      '스테이크 시즈닝 (조리 후)',
      '삶은 달걀·아보카도에 찍어 먹기',
    ],
    storage: '직사광선을 피해 실온 보관',
    shelfLife: '제조일로부터 24개월',
    stock: 200,
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4%20%EC%86%8C%EA%B8%88',
    },
  },
  {
    id: 'wasabi-powder',
    name: '고추냉이 가루',
    category: 'condiment',
    emoji: '🌱',
    gradient: 'from-amber-400 to-orange-500',
    price: 14900,
    unit: '100g',
    shortDesc: '고추냉이 근경을 동결건조한 100% 순수 가루',
    description: '향재원 고추냉이 근경을 동결건조한 100% 순수 가루입니다. 물에 개어 쓰면 생고추냉이와 거의 동일한 향을 즐길 수 있습니다.',
    ingredients: ['향재원 고추냉이 100% (동결건조)'],
    features: [
      '100% 국산 고추냉이',
      '동결건조로 향 보존',
      '물에 개어 즉석 사용',
      '요리 · 베이킹 · 소스에 활용',
      '장기 보관 가능',
    ],
    howToUse: [
      '물 1: 가루 2 비율로 개어 5분 대기',
      '간장·마요네즈에 섞어 소스 제조',
      '샐러드 드레싱·마리네이드에 활용',
    ],
    storage: '밀봉 후 직사광선을 피해 실온',
    shelfLife: '제조일로부터 18개월',
    stock: 120,
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4%20%EA%B0%80%EB%A3%A8',
    },
  },
  {
    id: 'wasabi-pickle',
    name: '고추냉이 절임',
    category: 'processed',
    emoji: '🥒',
    gradient: 'from-orange-400 to-red-500',
    price: 15900,
    unit: '300g',
    shortDesc: '간장에 절인 고추냉이 잎·줄기 반찬',
    description: '향재원 스마트팜에서 수확한 고추냉이 잎과 줄기를 간장 베이스로 절인 프리미엄 반찬입니다. 밥·라면·우동에 곁들이면 매콤한 감칠맛이 살아납니다.',
    ingredients: ['향재원 고추냉이 잎·줄기 60%', '국산 양조간장', '식초', '설탕'],
    features: [
      '향재원 직접 재배 원료',
      '국산 양조간장 사용',
      '방부제 · 인공색소 무첨가',
      '냉장 30일 보관',
      '밥반찬 · 술안주로 인기',
    ],
    howToUse: [
      '밥에 얹어 그대로 섭취',
      '우동·라면 고명',
      '회 쌈 속재료',
    ],
    storage: '냉장 보관 (0~10°C)',
    shelfLife: '제조일로부터 30일',
    stock: 80,
    tag: 'new',
    externalLinks: {},
  },
  {
    id: 'wasabi-fishcake',
    name: '고추냉이 어묵',
    category: 'processed',
    emoji: '🍢',
    gradient: 'from-orange-400 to-red-500',
    price: 11900,
    unit: '200g',
    shortDesc: '매콤한 뒷맛이 매력적인 고추냉이 어묵',
    description: '국산 명태살에 향재원 고추냉이를 더한 매콤한 어묵입니다. 끓는 물에 데쳐 그대로 먹거나 국물 요리에 활용하세요.',
    ingredients: ['국산 명태살 70%', '향재원 고추냉이', '전분', '소금'],
    features: [
      '국산 명태살 사용',
      '향재원 고추냉이 함유',
      '개별 포장 간편 조리',
      '끓는 물 3분이면 완성',
      '어린이도 즐기는 매운맛',
    ],
    howToUse: [
      '끓는 물에 3~5분 데쳐 섭취',
      '오뎅 국물 요리',
      '떡볶이·라면 토핑',
    ],
    storage: '냉동 보관 (-18°C)',
    shelfLife: '제조일로부터 12개월',
    stock: 100,
    externalLinks: {
      coupang: 'https://www.coupang.com/np/search?q=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4+%EC%96%B4%EB%AC%B5',
    },
  },
  {
    id: 'wasabi-tea',
    name: '고추냉이 원액차',
    category: 'beverage',
    emoji: '🍵',
    gradient: 'from-teal-400 to-cyan-600',
    price: 18900,
    unit: '500ml',
    shortDesc: '고추냉이 잎·줄기 추출 원액, 물에 타 마시는 건강차',
    description: '향재원 고추냉이 잎과 줄기를 저온에서 추출한 원액차입니다. 냉수·온수에 희석해 마시면 은은한 향과 상쾌한 매운맛을 즐길 수 있습니다.',
    ingredients: ['향재원 고추냉이 추출물 70%', '정제수', '유기농 설탕'],
    features: [
      '저온 추출로 향 보존',
      '국산 고추냉이 100%',
      '물 1 : 원액 10 희석',
      '탄산수와 믹스 가능',
      '칵테일 베이스로도 활용',
    ],
    howToUse: [
      '차가운 물에 1:10 희석',
      '온수에 타면 허브차 느낌',
      '탄산수 + 라임과 믹스',
    ],
    storage: '개봉 전 실온, 개봉 후 냉장 (1개월)',
    shelfLife: '제조일로부터 12개월',
    stock: 90,
    tag: 'new',
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%B6%94%EB%83%89%EC%9D%B4%20%EC%9B%90%EC%95%A1%EC%B0%A8',
    },
  },
  {
    id: 'wasabi-gift-set',
    name: '향재원 프리미엄 선물세트',
    category: 'paste',
    emoji: '🎁',
    gradient: 'from-emerald-500 to-teal-600',
    price: 89000,
    originalPrice: 105000,
    unit: '6종 1세트',
    shortDesc: '쌈장·소금·가루·절임·어묵·원액차 베스트 6종',
    description: '향재원의 베스트셀러 6종을 한 번에 만날 수 있는 프리미엄 선물세트입니다. 명절·감사 선물에 적합하며 고급 크라프트 박스에 포장됩니다.',
    ingredients: ['고추냉이 쌈장 200g', '고추냉이 소금 80g', '고추냉이 가루 50g', '고추냉이 절임 200g', '고추냉이 어묵 200g', '원액차 250ml'],
    features: [
      '베스트 6종 구성',
      '크라프트 박스 고급 포장',
      '15% 할인 적용',
      '명절·기업 선물용',
      '맞춤 메시지 카드 동봉',
    ],
    howToUse: [
      '각 제품별 사용법은 상세 페이지 참조',
      '선물 수령 후 냉장·냉동 품목 즉시 분리 보관',
    ],
    storage: '품목별 상이 (상세 안내 동봉)',
    shelfLife: '제품별 상이',
    stock: 40,
    tag: 'limited',
    externalLinks: {
      naver: 'https://search.shopping.naver.com/search/all?query=%ED%96%A5%EC%9E%AC%EC%9B%90%20%EC%84%A0%EB%AC%BC%EC%84%B8%ED%8A%B8',
    },
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: ProductCategory | 'all'): Product[] {
  if (category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

// ═══════════════════════════════════════════════════════════
// Sprint-03: 현장 판매 소모품 · 시즌 수확 · 파트너 상점
// ═══════════════════════════════════════════════════════════

export type OnSiteItemCategory = 'fuel' | 'utensil' | 'meal' | 'snack' | 'drink' | 'ice';

export interface OnSiteItem {
  id: string;
  category: OnSiteItemCategory;
  name: string;
  price: number;
  unit: string;
  note?: string;
}

export const ON_SITE_ITEM_CATEGORY_LABELS: Record<OnSiteItemCategory, { label: string; icon: string }> = {
  fuel:    { label: '숯·연료',  icon: 'ri-fire-line' },
  utensil: { label: '집기',    icon: 'ri-knife-line' },
  meal:    { label: '간편식',  icon: 'ri-restaurant-line' },
  snack:   { label: '스낵',    icon: 'ri-cake-line' },
  drink:   { label: '음료',    icon: 'ri-cup-line' },
  ice:     { label: '얼음',    icon: 'ri-snowy-line' },
};

// 🟢 EDIT:ON_SITE_ITEMS ─ 현장 판매 일회용 소모품 (고기·식재료 제외)
export const ON_SITE_ITEMS: OnSiteItem[] = [
  { id: 'charcoal-3kg',   category: 'fuel',    name: '참숯',                price: 8000, unit: '3kg' },
  { id: 'firestarter',    category: 'fuel',    name: '착화제',              price: 3000, unit: '1개' },
  { id: 'disposable-set', category: 'utensil', name: '일회용 접시·수저 세트', price: 2000, unit: '5인 세트' },
  { id: 'foil-roll',      category: 'utensil', name: '호일',                price: 2000, unit: '1롤' },
  { id: 'cup-ramen',      category: 'meal',    name: '컵라면',              price: 2500, unit: '1개' },
  { id: 'cup-rice',       category: 'meal',    name: '컵밥',                price: 4500, unit: '1개' },
  { id: 'instant-soup',   category: 'meal',    name: '즉석국',              price: 3500, unit: '1팩' },
  { id: 'snack-pack',     category: 'snack',   name: '과자',                price: 2000, unit: '1봉' },
  { id: 'marshmallow',    category: 'snack',   name: '마시멜로',            price: 4000, unit: '1봉', note: '캠프파이어용' },
  { id: 'skewer-set',     category: 'snack',   name: '꼬치 세트',            price: 4000, unit: '5개', note: '어묵·소세지 혼합' },
  { id: 'water-500',      category: 'drink',   name: '생수',                price: 1500, unit: '500ml' },
  { id: 'canned-coffee',  category: 'drink',   name: '캔 커피',              price: 2500, unit: '1캔' },
  { id: 'canned-juice',   category: 'drink',   name: '캔 주스',              price: 2500, unit: '1캔' },
  { id: 'soda',           category: 'drink',   name: '탄산음료',             price: 2500, unit: '1캔' },
  { id: 'ice-1kg',        category: 'ice',     name: '얼음',                price: 3000, unit: '1kg' },
];

// ───────────────────────────────────────────────────────────
// 월별 수확 달력 (데크별 전용 텃밭)
// ───────────────────────────────────────────────────────────

export interface HarvestMonth {
  primary: string[];   // 시즌성 주력 작물 (딸기 등)
  rotation: string[];  // 연중 쌈채소 로테이션
}

// 🟢 EDIT:SEASONAL_HARVEST ─ 월별 수확 가능 작물
export const SEASONAL_HARVEST: Record<number, HarvestMonth> = {
  1:  { primary: ['딸기'], rotation: ['상추', '로메인'] },
  2:  { primary: ['딸기'], rotation: ['상추', '로메인'] },
  3:  { primary: ['딸기'], rotation: ['상추', '깻잎'] },
  4:  { primary: ['딸기'], rotation: ['상추', '로메인', '깻잎'] },
  5:  { primary: ['딸기'], rotation: ['상추', '깻잎', '양상추'] },
  6:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  7:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  8:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  9:  { primary: [],       rotation: ['상추', '깻잎', '로메인', '양상추'] },
  10: { primary: [],       rotation: ['상추', '깻잎', '로메인'] },
  11: { primary: [],       rotation: ['상추', '깻잎', '로메인'] },
  12: { primary: ['딸기'], rotation: ['상추', '로메인'] },
};

/** 4인 기준 300g, 1인 추가마다 +75g (최대 8인 = 600g) */
export function calcHarvestGrams(guests: number): number {
  const safe = Math.max(4, Math.min(8, guests));
  return 300 + (safe - 4) * 75;
}

/** 현재 월(1-12)의 수확 정보 반환 */
export function getHarvestForMonth(month: number): HarvestMonth {
  const normalized = ((month - 1) % 12 + 12) % 12 + 1;
  return SEASONAL_HARVEST[normalized];
}

// ───────────────────────────────────────────────────────────
// 파트너 상점 (고기·식재료 배달 제휴)
// ───────────────────────────────────────────────────────────

export type PartnerCategory = 'butcher' | 'restaurant' | 'grocery';

export interface PartnerStore {
  id: string;
  name: string;
  category: PartnerCategory;
  phone: string | null;
  deliveryTimeMin: number;
  distance: string;
  notes: string;
  confirmed: boolean;
}

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, { label: string; icon: string }> = {
  butcher:    { label: '정육점',  icon: 'ri-restaurant-2-line' },
  restaurant: { label: '한식당',  icon: 'ri-bowl-line' },
  grocery:    { label: '마트',   icon: 'ri-store-2-line' },
};

// 🟢 EDIT:PARTNER_STORES ─ 파트너 상점 (실 제휴 체결 시 confirmed: true + 실명·전화 교체)
export const PARTNER_STORES: PartnerStore[] = [
  {
    id: 'partner-butcher-1',
    name: '(제휴 협의 중 · 정육점)',
    category: 'butcher',
    phone: null,
    deliveryTimeMin: 15,
    distance: '—',
    notes: '양재동 반경 1km 내 정육점 제휴 협의 예정',
    confirmed: false,
  },
  {
    id: 'partner-restaurant-1',
    name: '(제휴 협의 중 · 한식당)',
    category: 'restaurant',
    phone: null,
    deliveryTimeMin: 20,
    distance: '—',
    notes: '반찬·국·구이류 배달 협의 예정',
    confirmed: false,
  },
];

// ───────────────────────────────────────────────────────────
// 예약 추가 옵션 (Add-on)
// ───────────────────────────────────────────────────────────

export interface BookingAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  availability?: string;
}

// 🟢 EDIT:BOOKING_ADDONS ─ 예약 시 선택 가능한 추가 옵션
export const BOOKING_ADDONS: BookingAddOn[] = [
  {
    id: 'harvest-upgrade',
    name: '수확량 업그레이드 +200g',
    price: 5000,
    description: '기본 제공량에서 200g 추가 수확 (쌈 좋아하는 팀 추천)',
  },
  {
    id: 'strawberry-full-course',
    name: '딸기 풀코스 체험 +500g',
    price: 15000,
    description: '딸기 시즌 한정 대량 수확 체험',
    availability: '12월 ~ 5월',
  },
];
