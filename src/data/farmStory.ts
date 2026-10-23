import type { ImageKey } from '@/lib/imageStore';

/**
 * 향재원(HYANGJAEWON) — 농장 스토리 단일 원천(Single Source of Truth)
 *
 * ❗ 서비스 정체성 (2026-10 개편)
 *   향재원은 **서울 양재동 최초의 유기농 고추냉이 수경재배 스마트팜**이자 **농산물 생산 시설**입니다.
 *   - ❌ 공간대여 서비스 아님 · 야영장 아님 · 글램핑 아님 · 숙박 아님
 *   - ❌ 취식(숯불·바비큐·도시락) 불가 — 농산물 생산구역
 *   - ✅ 고추냉이 수경 온실 + 유러피안 채소 재배동 8동 + 노지 과수·조경수·화훼
 *   - ✅ 치유농업 — 치유농업시설 등록 및 우수 치유농업시설 인증 추진 중
 *
 * 이 파일의 상수와 어긋나는 화면 문구는 모두 버그로 간주합니다.
 */

/* ═══════════════════════════════════════════════════════════
 * 1. 농장 프로필
 * ═══════════════════════════════════════════════════════════ */

export const FARM_PROFILE = {
  nameKo: '향재원',
  nameEn: 'HYANGJAEWON',
  tagline: '서울 양재동 최초의 유기농 고추냉이 수경재배 스마트팜',
  taglineEn: "Seoul's First Organic Wasabi Hydroponic Farm",
  /** 한 문장 요약 — 메타 설명·공유 카드에 사용 */
  summary:
    '10년 넘게 방치된 불법 폐기물 매립장을, 폐기물을 전량 반출하고 흙 없이 농약 없이 기르는 고추냉이 스마트팜으로 되살렸습니다.',
  address: '서울특별시 서초구 양재동 178-4',
  landAreaM2: 1772,
  landAreaPyeong: 536,
  zoning: '자연녹지지역',
  operator: '농업회사법인 향재원 주식회사',
  ceo: '이민경',
  landowner: '최정만',
  phone: '010-4929-0070',
  /** 생산 품목 */
  mainCrop: '고추냉이(와사비)',
  mainCropScientific: 'Eutrema japonicum',
  /** 원산지 표기 — "일본산" 금지 */
  origin: '국산 (서울 양재동 재배)',
} as const;

/** 핵심 숫자 — 홈 히어로 카운터 */
export const FARM_STATS = [
  { label: '고추냉이 1차 정식', value: 10000, unit: '주', icon: 'ri-plant-line' },
  { label: '다단 베드 총 연장', value: 634.5, unit: 'm', icon: 'ri-stack-line' },
  { label: '유러피안 재배동',   value: 8,     unit: '동', icon: 'ri-home-4-line' },
  { label: '화학 농약 사용',     value: 0,     unit: '%', icon: 'ri-leaf-line' },
] as const;

/* ═══════════════════════════════════════════════════════════
 * 2. 농장의 시작 — 폐기물 매립장에서 스마트팜으로
 * ═══════════════════════════════════════════════════════════ */

export interface StoryChapter {
  id: string;
  period: string;
  title: string;
  body: string;
  icon: string;
  tone: 'past' | 'work' | 'now' | 'next';
}

export const FARM_STORY: StoryChapter[] = [
  {
    id: 'before',
    period: '2010 ~ 2025',
    title: '10년 넘게 방치된 땅',
    body:
      '양재동 178-4 는 오랜 기간 야적장과 불법 폐기물 매립장으로 쓰였습니다. 위성사진과 감정평가서 현황사진에 그 시간이 그대로 남아 있습니다.',
    icon: 'ri-delete-bin-line',
    tone: 'past',
  },
  {
    id: 'clean',
    period: '2025. 7 ~ 8',
    title: '폐기물 전량 반출',
    body:
      '폐기물 처리업체와 계약해 투기·매립 폐기물을 톤백으로 전량 반출했습니다. 흙을 깎거나 돋우지 않고 지반고를 그대로 유지한 채, 농지 본래의 모습으로 되돌렸습니다.',
    icon: 'ri-truck-line',
    tone: 'work',
  },
  {
    id: 'build',
    period: '2025. 11 ~ 2026',
    title: '수경 온실과 재배동 조성',
    body:
      '3단 다단 베드(총 연장 634.5m)와 양액 순환 설비, 워터칠러, 차광·보광 설비를 갖춘 수경 온실을 세웠습니다. 농업용 창고, 식생블록 옹벽, 농업용 지하수(28㎥/일)도 함께 조성했습니다. 콘크리트 타설은 하지 않았습니다.',
    icon: 'ri-building-2-line',
    tone: 'work',
  },
  {
    id: 'now',
    period: '2026. 11',
    title: '고추냉이 10,000주 1차 정식',
    body:
      '월동 전에 고추냉이 10,000주를 정식합니다. 유러피안 채소 8품목과 노지 과수·조경수도 함께 식재합니다. 서울 한복판에서 자라는 국산 고추냉이의 첫 사이클이 시작됩니다.',
    icon: 'ri-seedling-line',
    tone: 'now',
  },
  {
    id: 'cert',
    period: '2027',
    title: '친환경(무농약) 인증 신청',
    body:
      '흙 없이 순환 양액으로 기르고 화학 농약을 쓰지 않는 재배 방식을 근거로 친환경(무농약) 인증을 신청합니다.',
    icon: 'ri-award-line',
    tone: 'next',
  },
  {
    id: 'next',
    period: '2028 ~ 2029',
    title: '근경 수확 · 20,000주 확장',
    body:
      '2028년 상반기부터 정식 18개월을 넘긴 근경을 수확하고, 2029년 하반기에는 20,000주 규모로 확장합니다. 재배 데이터와 매뉴얼은 청년농 교육 자료로 공개합니다.',
    icon: 'ri-line-chart-line',
    tone: 'next',
  },
];

/* ═══════════════════════════════════════════════════════════
 * 3. 고추냉이 — 유기농 수경재배
 * ═══════════════════════════════════════════════════════════ */

export const WASABI = {
  name: '고추냉이',
  alias: '와사비',
  scientific: 'Eutrema japonicum',
  family: '십자화과(Brassicaceae)',

  /** 왜 이 작물인가 */
  whyHard:
    '고추냉이는 국내에서 가장 재배가 어렵다고 알려진 고부가 작물입니다. 수온 13℃ 안팎, pH 6~7, 높은 용존산소, 직사광선 차단이 모두 맞아야 자랍니다. 환경을 제어하는 스마트팜이 아니면 서울에서는 재배 자체가 불가능합니다.',
  whySmartFarm:
    '향재원은 이 까다로움을 설비로 풉니다. 워터칠러가 수온을 잡고, 양액이 순환하며 용존산소를 유지하고, 2중 산광스크린과 75% 알루미늄 차광스크린이 직사광을 걷어냅니다. 흙을 쓰지 않으니 토양 병해충이 원천 차단되어 농약 없이 기를 수 있습니다.',

  /** 시장에서의 위치 */
  market: [
    {
      icon: 'ri-search-eye-line',
      title: '국내 유통 와사비 대부분은 진짜가 아닙니다',
      desc: '시중 와사비는 홀스래디시(서양고추냉이) 가공품이거나 수입산입니다. 신선한 생고추냉이는 강원 철원 등 극소수 산지에서만 나옵니다.',
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: '근경은 kg당 최대 20만원대',
      desc: '뿌리줄기(근경) 시세는 kg당 최대 약 20만원대이고, 잎·줄기도 고급 일식당과 백화점 식품관에서 꾸준히 찾는 식재료입니다.',
    },
    {
      icon: 'ri-map-pin-2-line',
      title: '서울 안에서 길러 서울로 보냅니다',
      desc: '서초·강남권 일식당과 백화점 식품관에 수확 당일 납품합니다. 수입 냉동 와사비와 출발점이 다릅니다.',
    },
  ],

  /** 건강 기능성 — 연구 근거가 있는 내용만 */
  health: [
    {
      icon: 'ri-shield-check-line',
      title: '알릴이소티오시아네이트',
      desc: '고추냉이 특유의 매운 향 성분으로, 식중독균 살균 효과가 입증되어 있습니다.',
    },
    {
      icon: 'ri-brain-line',
      title: '기억력 개선 연구',
      desc: '2023년 국제학술지 Nutrients 에 실린 60~80세 노인 대상 12주 연구에서 기억력 개선 효과가 보고되었습니다.',
      note: '시니어 치유 프로그램을 설계할 때 근거로 삼은 연구입니다.',
    },
  ],

  /** 재배 환경 — 스마트팜 제어 기준값 */
  environment: [
    { key: 'water-temp', label: '수온',     value: '13', unit: '℃ 안팎', icon: 'ri-temp-cold-line' },
    { key: 'ph',         label: '양액 pH',  value: '6 ~ 7', unit: '',    icon: 'ri-test-tube-line' },
    { key: 'do',         label: '용존산소', value: '높게 유지', unit: '', icon: 'ri-bubble-chart-line' },
    { key: 'shade',      label: '차광률',   value: '75', unit: '%',      icon: 'ri-contrast-2-line' },
    { key: 'ec',         label: '양액 EC',  value: '실시간 제어', unit: '', icon: 'ri-flask-line' },
    { key: 'light',      label: '보광',     value: 'LED', unit: '',      icon: 'ri-lightbulb-flash-line' },
  ],

  /** 재배 설비 — 흙 없이, 농약 없이 */
  system: [
    {
      key: 'bed',
      icon: 'ri-stack-line',
      label: '재배 시스템',
      value: '3단 다단 베드 · 총 연장 634.5m',
      detail: '양액 순환 · 워터칠러로 수온 제어',
    },
    {
      key: 'light',
      icon: 'ri-sun-cloudy-line',
      label: '광 관리',
      value: '2중 산광스크린 + 알루미늄 차광스크린(75%)',
      detail: '부족한 광량은 보광 LED 로 보완',
    },
    {
      key: 'iot',
      icon: 'ri-cpu-line',
      label: '환경 제어',
      value: 'IoT 센서 실시간 기록 · 원격 제어',
      detail: '수온 · EC · pH · 용존산소 · 광량',
    },
    {
      key: 'pest',
      icon: 'ri-bug-line',
      label: '병해충',
      value: '무농약 운영',
      detail: '흙이 없어 토양 병해충 원천 차단 · 방충망과 물리적 차단으로 관리',
    },
    {
      key: 'nutrient',
      icon: 'ri-recycle-line',
      label: '양액',
      value: '순환식 · 외부 배출 없음',
      detail: '비료와 물 사용을 최소화합니다',
    },
    {
      key: 'seedling',
      icon: 'ri-seedling-line',
      label: '육묘',
      value: '모주에서 런너 채취 → 삽목 6~8주 → 정식',
      detail: '묘를 직접 길러 정식까지 이어갑니다',
    },
  ],

  /** 생육 단계 */
  stages: [
    { month: '0',       label: '정식',      desc: '삽목 6~8주를 거친 묘를 다단 베드에 정식합니다.' },
    { month: '4',       label: '잎·줄기 수확', desc: '정식 후 약 4개월부터 잎과 줄기를 수확해 당일 공급합니다.' },
    { month: '12',      label: '근경 비대',  desc: '뿌리줄기(근경)가 굵어지기 시작합니다.' },
    { month: '18',      label: '근경 수확',  desc: '정식 후 약 18개월부터 상품성 있는 근경을 수확합니다.' },
  ],

  /** 부위별 활용 */
  parts: [
    { part: '근경', use: '생와사비 강판용 · 가공 원물 (kg당 최대 20만원대)', icon: 'ri-restaurant-2-line' },
    { part: '잎',   use: '샐러드 · 절임 · 쌈 · 잎 차', icon: 'ri-leaf-line' },
    { part: '줄기', use: '장아찌 · 초절임', icon: 'ri-scissors-cut-line' },
    { part: '꽃',   use: '봄 한정 에디블 플라워', icon: 'ri-flower-line' },
  ],

  /** 생산 계획 */
  plan: [
    { when: '2026. 11', what: '1차 정식 10,000주', status: 'doing' },
    { when: '2027. 3~',  what: '잎·줄기 수확 시작 (정식 후 약 4개월)', status: 'todo' },
    { when: '2028 상반기', what: '근경 수확 시작 (정식 후 약 18개월)', status: 'todo' },
    { when: '2029 하반기', what: '20,000주 규모로 확장', status: 'todo' },
  ],

  /** 판로 · 가공 */
  channels: [
    { icon: 'ri-restaurant-line', title: '서초·강남권 일식당', desc: '잎·줄기를 수확 당일 공급합니다.' },
    { icon: 'ri-store-3-line',    title: '백화점 식품관',     desc: '신선 생고추냉이와 잎을 공급합니다.' },
    { icon: 'ri-archive-2-line',  title: '농산물 가공품',      desc: '와사비 소금 · 줄기 장아찌 · 펌프형 농축액을 개발해 온라인 직판으로 판매합니다.' },
    { icon: 'ri-book-open-line',  title: '청년농 교육 자료',   desc: '재배 데이터와 매뉴얼을 공개합니다. 국내에 고추냉이 재배 매뉴얼은 사실상 없습니다.' },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════
 * 4. 유러피안 채소 재배동 8동
 *    ❗ 공간대여 아님 — 동별로 작물이 다른 '재배동'입니다.
 * ═══════════════════════════════════════════════════════════ */

export interface CropHouse {
  /** 재배동 번호 1~8 */
  no: number;
  name: string;
  nameEn: string;
  /** 대표 색 — 3D 카드 그라디언트 */
  gradient: string;
  emoji: string;
  /** 재배 특성 */
  trait: string;
  /** 파종 → 첫 수확 */
  toHarvest: string;
  /** 수확 방식 */
  harvestWay: string;
  /** 치유 · 교육 활용 */
  careUse: string;
}

export const CROP_HOUSES: CropHouse[] = [
  {
    no: 1,
    name: '루꼴라',
    nameEn: 'Rucola · Rocket',
    gradient: 'from-wasabi-400 to-emeraldgreen-600',
    emoji: '🌿',
    trait: '저온에 강하고 생육이 빨라 연중 재배가 가능합니다.',
    toHarvest: '약 30 ~ 40일',
    harvestWay: '잎 수확 · 연 6~8회전',
    careUse: '어린이가 파종부터 수확까지 한 달 안에 경험할 수 있는 작물입니다.',
  },
  {
    no: 2,
    name: '바질 (제노베제)',
    nameEn: 'Basil Genovese',
    gradient: 'from-lime-400 to-wasabi-700',
    emoji: '🌱',
    trait: '향이 강한 허브로, 가온하면 연중 재배할 수 있습니다.',
    toHarvest: '약 45 ~ 60일',
    harvestWay: '순 따기 반복 수확',
    careUse: '직장인 대상 향기·오감 치유 활동에 씁니다.',
  },
  {
    no: 3,
    name: '버터헤드 · 로메인 양상추',
    nameEn: 'Butterhead · Romaine',
    gradient: 'from-lime-300 to-emeraldgreen-600',
    emoji: '🥬',
    trait: '샐러드의 기본 품목으로 수요가 안정적입니다.',
    toHarvest: '약 45 ~ 60일',
    harvestWay: '포기 수확 · 연 5~6회전',
    careUse: '주말 가족 수확 체험의 주력 작물입니다.',
  },
  {
    no: 4,
    name: '라디키오 (트레비소)',
    nameEn: 'Radicchio Treviso',
    gradient: 'from-rose-500 to-purple-700',
    emoji: '🍷',
    trait: '가을·겨울에 붉게 드는 적색 치커리입니다.',
    toHarvest: '약 70 ~ 90일',
    harvestWay: '포기 수확',
    careUse: '색과 쓴맛을 비교하는 식생활 교육에 활용합니다.',
  },
  {
    no: 5,
    name: '카볼로 네로',
    nameEn: 'Cavolo Nero · Tuscan Kale',
    gradient: 'from-emeraldgreen-700 to-slate-800',
    emoji: '🥬',
    trait: '다년 생육이 가능하고 내한성이 강한 토스카나 케일입니다.',
    toHarvest: '약 60일부터',
    harvestWay: '아래 잎부터 따기 · 장기 수확',
    careUse: '시니어 잎 따기 활동과 손 운동에 적합합니다.',
  },
  {
    no: 6,
    name: '스위스 차드 (근대)',
    nameEn: 'Swiss Chard',
    gradient: 'from-orange-400 to-rose-600',
    emoji: '🌈',
    trait: '줄기 색이 다양하고 생육이 왕성합니다.',
    toHarvest: '약 50 ~ 60일',
    harvestWay: '잎 따기 반복 수확',
    careUse: '시니어·아동 색채 관찰 활동에 씁니다.',
  },
  {
    no: 7,
    name: '펜넬',
    nameEn: 'Fennel',
    gradient: 'from-amber-300 to-lime-600',
    emoji: '🌾',
    trait: '서늘한 기후에서 구근이 비대해집니다.',
    toHarvest: '약 80 ~ 100일',
    harvestWay: '구근 수확',
    careUse: '성장 과정을 기록하는 관찰 일기 활동에 적합합니다.',
  },
  {
    no: 8,
    name: '비트',
    nameEn: 'Beetroot',
    gradient: 'from-fuchsia-600 to-red-800',
    emoji: '🫐',
    trait: '잎과 뿌리를 모두 먹을 수 있습니다.',
    toHarvest: '약 60 ~ 70일',
    harvestWay: '잎 수시 수확 · 뿌리 1회 수확',
    careUse: '천연 색소와 요리 체험으로 이어집니다.',
  },
];

/** 재배동 운영 원칙 — 공간대여가 아님을 명시 */
export const CROP_HOUSE_POLICY = {
  headline: '8개 동은 전부 작물 재배동입니다',
  body:
    '텐트형 재배동 8동은 동마다 유러피안 채소 한 품목씩을 배정해 무농약·유기질 배지로 재배합니다. 수확 주기가 짧은 작물부터 긴 작물까지 섞어, 연중 체험과 출하가 끊기지 않게 짰습니다.',
  bullets: [
    '8동은 농작물 재배 전용 — 숙박·취사·공간대여 용도로 쓰지 않습니다',
    '흙 대신 코코피트·펄라이트 유기질 배지와 순환 양액 사용',
    '화학 농약 미사용 — 2027년 친환경(무농약) 인증 신청 예정',
    '수확물은 「마루의 신선 꾸러미」 정기 배송으로 서초구민에게 먼저 공급',
  ],
} as const;

/* ═══════════════════════════════════════════════════════════
 * 5. 노지 — 과수 · 조경수 · 화훼
 * ═══════════════════════════════════════════════════════════ */

export interface FieldCrop {
  id: string;
  name: string;
  nameEn: string;
  species: string;
  category: '과수' | '조경수' | '화훼';
  /** 식재 구역 */
  zone: string;
  gradient: string;
  icon: string;
  desc: string;
  spec: string;
  season: string;
}

export const FIELD_CROPS: FieldCrop[] = [
  {
    id: 'blueberry',
    name: '블루베리',
    nameEn: 'Blueberry',
    species: 'Vaccinium spp.',
    category: '과수',
    zone: '재배동 앞 노지 (쇄석 제거 구역)',
    gradient: 'from-indigo-500 to-blue-800',
    icon: 'ri-seedling-line',
    desc: '쇄석을 걷어낸 자리에 심어 농지 형상을 유지하면서, 여름에는 수확 체험으로 이어집니다.',
    spec: '수고 0.6 ~ 1.2m · 포트',
    season: '수확 6 ~ 8월',
  },
  {
    id: 'emerald-gold',
    name: '에메랄드골드',
    nameEn: 'Emerald Gold',
    species: 'Thuja occidentalis (서양측백)',
    category: '조경수',
    zone: '재배동 앞 노지 (쇄석 제거 구역)',
    gradient: 'from-amber-400 to-emeraldgreen-700',
    icon: 'ri-plant-line',
    desc: '황금빛이 도는 상록 측백으로, 블루베리와 함께 심어 농지 형상을 유지하고 화훼 판매로 잇습니다.',
    spec: '수고 0.8 ~ 1.5m · 포트',
    season: '연중 (출하 성수기 3~5월 · 9~11월)',
  },
  {
    id: 'blue-angel',
    name: '블루엔젤',
    nameEn: 'Blue Angel',
    species: 'Juniperus 향나무류',
    category: '조경수',
    zone: '잔여 노지',
    gradient: 'from-blueangel-300 to-blueangel-700',
    icon: 'ri-leaf-line',
    desc: '은청색 침엽이 곧게 올라가는 수형. 도심 정원·아파트 조경의 포인트 수종으로 수요가 꾸준합니다.',
    spec: '수고 1.2 ~ 2.0m · 포트 / 근분',
    season: '연중 (출하 성수기 3~5월 · 9~11월)',
  },
  {
    id: 'emerald-green',
    name: '에메랄드그린',
    nameEn: 'Emerald Green',
    species: 'Thuja occidentalis (서양측백)',
    category: '조경수',
    zone: '잔여 노지',
    gradient: 'from-emeraldgreen-300 to-emeraldgreen-700',
    icon: 'ri-plant-line',
    desc: '사계절 선명한 녹색을 유지하는 원추형 상록수. 생울타리·경계식재에 가장 많이 쓰이는 수종입니다.',
    spec: '수고 1.0 ~ 1.8m · 포트 / 근분',
    season: '연중 (출하 성수기 3~5월 · 9~11월)',
  },
  {
    id: 'cut-flowers',
    name: '절화 화훼 · 판매용 묘목',
    nameEn: 'Cut Flowers · Nursery Stock',
    species: '계절 화훼류 · 조경수묘',
    category: '화훼',
    zone: '잔여 노지',
    gradient: 'from-pink-400 to-rose-600',
    icon: 'ri-flower-line',
    desc: '노지에 식재된 나무와 꽃은 출하를 전제로 기르는 판매용 묘목·화훼입니다. 관상용 조경시설물이 아닙니다.',
    spec: '단 단위 · 포트묘',
    season: '봄 · 가을 중심',
  },
];

/** 왜 양재동인가 — 물류 이점 */
export const FLOWER_DISTRICT = {
  headline: '화훼 시장과 같은 동(洞)에서 기릅니다',
  body:
    '서울 최대 화훼 유통 거점인 양재 화훼공판장이 같은 양재동 생활권에 있습니다. 밭에서 잘라 바로 실어내는 거리 — 운송 시간이 짧을수록 절화의 수명과 조경수의 활착률이 올라갑니다.',
  advantages: [
    { icon: 'ri-truck-line',       title: '초단거리 출하',   desc: '같은 양재동 생활권 · 차량 이동 5분대' },
    { icon: 'ri-timer-flash-line', title: '수확 당일 납품',  desc: '절화는 수분 손실 전에 도착하는 것이 품질' },
    { icon: 'ri-leaf-line',        title: '탄소 배출 절감',  desc: '장거리 콜드체인 없이 짧은 경로로 운송' },
    { icon: 'ri-plant-line',       title: '활착률 상승',     desc: '뿌리 건조 시간이 짧아 식재 후 생존율이 높음' },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════
 * 6. 치유농업
 *
 *    향재원의 재배 현장은 그대로 치유농업 공간이 됩니다.
 *    효과는 농촌진흥청이 이미 수치로 검증해 두었습니다.
 * ═══════════════════════════════════════════════════════════ */

/** 농촌진흥청 실증 결과 — 숫자는 모두 출처가 있는 값입니다 */
export interface CareEvidence {
  id: string;
  target: string;
  /** 표본 설명 */
  sample: string;
  /** 핵심 수치 (칩으로 표시) */
  metrics: { label: string; value: string; dir: 'up' | 'down' }[];
  source: string;
  icon: string;
  gradient: string;
}

export const CARE_EVIDENCE: CareEvidence[] = [
  {
    id: 'senior',
    target: '은퇴 노인',
    sample: '61 ~ 74세 · 25명',
    metrics: [
      { label: '우울감', value: '22.6% 감소', dir: 'down' },
      { label: '주관적 행복감', value: '27% 향상', dir: 'up' },
      { label: '삶의 만족도', value: '16% 향상', dir: 'up' },
      { label: '코르티솔', value: '30.4% 감소', dir: 'down' },
    ],
    source: '농촌진흥청 밀 새싹 치유농업 실증',
    icon: 'ri-heart-3-line',
    gradient: 'from-rose-400 to-pink-700',
  },
  {
    id: 'mci',
    target: '경도인지장애 노인',
    sample: '치유정원 산책 · 식물 돌봄 프로그램',
    metrics: [
      { label: '인지력', value: '향상', dir: 'up' },
      { label: '우울 · 스트레스', value: '감소', dir: 'down' },
    ],
    source: '치유농업 프로그램이 경도인지장애에 미치는 영향',
    icon: 'ri-brain-line',
    gradient: 'from-violet-400 to-indigo-700',
  },
  {
    id: 'family',
    target: '부모와 4~7세 자녀',
    sample: '24가정 · 텃밭 활동',
    metrics: [
      { label: '부모 코르티솔', value: '56.5% 감소', dir: 'down' },
      { label: '양육 스트레스', value: '9.9%p 감소', dir: 'down' },
    ],
    source: '농촌진흥청 가족농장 치유농업',
    icon: 'ri-parent-line',
    gradient: 'from-amber-300 to-orange-600',
  },
  {
    id: 'teen',
    target: '청소년 (학교 텃밭)',
    sample: '학교 텃밭 프로그램',
    metrics: [
      { label: '폭력성', value: '4.3% 감소', dir: 'down' },
      { label: '우울감', value: '5.3% 감소', dir: 'down' },
      { label: '스트레스 대처 능력', value: '8.5% 향상', dir: 'up' },
    ],
    source: '농촌진흥청 치유농업시설 안내',
    icon: 'ri-group-line',
    gradient: 'from-blueangel-300 to-blueangel-700',
  },
  {
    id: 'chronic',
    target: '만성질환자 (고혈압 · 당뇨)',
    sample: '치유농업 프로그램 참여군',
    metrics: [
      { label: '인슐린 분비능 지표', value: '47% 향상', dir: 'up' },
      { label: '스트레스 호르몬', value: '28% 감소', dir: 'down' },
      { label: '허리둘레', value: '2cm 감소', dir: 'down' },
    ],
    source: '농촌진흥청 치유농업시설 안내',
    icon: 'ri-heart-pulse-line',
    gradient: 'from-emeraldgreen-400 to-teal-700',
  },
  {
    id: 'worker',
    target: '직장인',
    sample: '치유농업 활동 참여군',
    metrics: [
      { label: '긴장감 · 피로감', value: '감소', dir: 'down' },
      { label: '활력지수', value: '상승', dir: 'up' },
    ],
    source: '농촌진흥청 치유농업 카드뉴스',
    icon: 'ri-mental-health-line',
    gradient: 'from-wasabi-400 to-emeraldgreen-700',
  },
];

/** 향재원 치유 프로그램 — 대상별 설계 */
export interface CareProgram {
  id: string;
  name: string;
  /** 대상 한 줄 */
  target: string;
  /** 대상 상세 */
  targetDetail: string;
  /** 운영 형태 */
  format: string;
  /** 한 줄 요약 */
  summary: string;
  /** 왜 이 대상에게 필요한가 */
  why: string;
  /** 회차별 / 단계별 커리큘럼 */
  curriculum: { step: string; title: string; detail: string }[];
  /** 사용하는 치유 자원 (공간 · 작물) */
  resources: string[];
  /** 결합되는 첨단 농업기술 */
  tech: string[];
  /** 기대 효과 — CARE_EVIDENCE 의 id 를 참조 */
  evidenceIds: string[];
  gradient: string;
  icon: string;
  /** 일러스트 종류 — CareProgramArt 컴포넌트가 해석 */
  art: 'worker' | 'senior' | 'kids' | 'family' | 'public';
  /** 관리자 업로드 이미지 슬롯 (실사진으로 교체 가능) */
  imageKey: ImageKey;
}

export const CARE_PROGRAMS: CareProgram[] = [
  {
    id: 'weekend-soil',
    name: '흙 만지는 주말',
    target: '직장인',
    targetDetail: '서초·강남권 직장인 · 4회기 주말 과정',
    format: '4회기 · 주말 · 회차당 약 2시간',
    summary: '파종 → 관리 → 수확 → 출하까지, 한 작물의 생애를 4주에 걸쳐 따라갑니다.',
    why:
      '직장인에게 필요한 것은 한 번의 이벤트가 아니라 돌아올 자리입니다. 매주 같은 작물을 보러 오면서 변화를 확인하는 구조로 설계했습니다. 농촌진흥청 실증에서 치유농업 활동 후 긴장감·피로감이 줄고 활력지수가 올라가는 것이 확인되었습니다.',
    curriculum: [
      { step: '1회기', title: '파종 · 내 작물 정하기', detail: '바질 또는 양상추를 직접 파종하고 이름표를 답니다. 양액 EC·pH 측정을 처음 경험합니다.' },
      { step: '2회기', title: '관리 · 솎아주기', detail: '2주 차 생육을 관찰하고 솎음과 순 따기를 합니다. 향이 올라온 바질 잎을 비벼 향기 세션을 진행합니다.' },
      { step: '3회기', title: '수확 · 선별', detail: '직접 기른 작물을 수확하고 출하 규격에 맞춰 선별·포장합니다. 고추냉이 수경 온실의 환경제어 설비를 함께 둘러봅니다.' },
      { step: '4회기', title: '기록 정리', detail: '4주간의 생육·환경 데이터를 리포트로 정리해 받고, 포장한 수확물은 가져갑니다.' },
    ],
    resources: ['2번 바질 재배동', '3번 양상추 재배동', '고추냉이 수경 온실', '양재천 경관'],
    tech: ['양액 EC·pH 계측 실습', '실시간 환경 대시보드', '디지털 생육 기록 리포트'],
    evidenceIds: ['worker', 'chronic'],
    gradient: 'from-wasabi-500 to-emeraldgreen-700',
    icon: 'ri-mental-health-line',
    art: 'worker',
    imageKey: 'care-worker',
  },
  {
    id: 'fingertip-garden',
    name: '손끝 텃밭',
    target: '시니어',
    targetDetail: '경로당 · 복지관 단체 · 65세 이상',
    format: '단체 회차 운영 · 저강도 · 앉아서 가능',
    summary: '잎 따기와 옮겨심기로 소근육과 기억을 함께 자극합니다.',
    why:
      '손을 쓰는 반복 작업은 소근육을 쓰면서 동시에 기억을 끌어냅니다. 농촌진흥청 실증에서 은퇴 노인의 우울감이 22.6% 줄고 농작업 후 코르티솔이 30.4% 감소했으며, 경도인지장애 노인에게서 인지력 향상이 확인되었습니다. 고추냉이는 향이 뚜렷해 오감 자극 소재로 적합하고, 60~80세 대상 기억력 개선 연구가 있어 프로그램 설계의 근거가 됩니다.',
    curriculum: [
      { step: '1단계', title: '잎 따기', detail: '5번 카볼로 네로와 6번 차드의 아래 잎을 따 모읍니다. 서서 할 수도, 앉아서 할 수도 있습니다.' },
      { step: '2단계', title: '포트 옮겨심기', detail: '허브 모종을 포트에 옮겨 심습니다. 완성한 포트는 가져가 집에서 키웁니다.' },
      { step: '3단계', title: '고추냉이 잎 덖기', detail: '고추냉이 잎을 덖어 차 재료로 만들어 포장합니다. 향을 맡으며 옛 기억을 나누는 회상 대화를 곁들입니다. 완성한 잎차는 가져갑니다.' },
      { step: '4단계', title: '나눔', detail: '수확한 잎을 봉지에 나눠 담아 서로에게 건넵니다.' },
    ],
    resources: ['5번 카볼로 네로 재배동', '6번 스위스 차드 재배동', '허브 구역', '고추냉이 잎'],
    tech: ['높낮이 조절 재배 베드', '큰 글씨 쉬운 모드 UI', '보호자 알림'],
    evidenceIds: ['senior', 'mci'],
    gradient: 'from-rose-400 to-soil-700',
    icon: 'ri-heart-3-line',
    art: 'senior',
    imageKey: 'care-senior',
  },
  {
    id: 'soilless-classroom',
    name: '흙 없는 농장 교실',
    target: '초등 · 중학생',
    targetDetail: '학교 단체 · 늘봄학교 연계',
    format: '30일 재배 일기 + 현장 수업',
    summary: '양액을 재고 뿌리를 관찰하며, 30일 만에 한 작물을 끝까지 길러 봅니다.',
    why:
      '흙이 없는 재배는 아이들에게 가장 강한 질문을 던집니다 — "그럼 뭘 먹고 자라요?" 그 질문에서 친환경 농업 기술 수업이 시작됩니다. 농촌진흥청 학교 텃밭 실증에서 청소년의 폭력성이 4.3%, 우울감이 5.3% 줄고 스트레스 대처 능력이 8.5% 올라갔습니다.',
    curriculum: [
      { step: '1차시', title: '파종 · 내 루꼴라', detail: '1번 재배동에서 루꼴라를 파종하고 자기 이름표를 붙입니다.' },
      { step: '2차시', title: '양액 측정', detail: 'EC·pH 측정기를 직접 들고 숫자를 읽습니다. 왜 이 숫자여야 하는지 토론합니다.' },
      { step: '3차시', title: '뿌리 관찰', detail: '흙 없이 자란 뿌리를 눈으로 봅니다. 토양 재배와 비교해 기록합니다.' },
      { step: '4차시', title: '수확 · 발표', detail: '30일 재배 일기를 완성하고 수확한 루꼴라를 나눕니다. 스마트팜 관제 화면에서 한 달간의 환경 그래프를 함께 봅니다.' },
    ],
    resources: ['1번 루꼴라 재배동', '스마트팜 관제실', '고추냉이 수경 온실'],
    tech: ['AI 작물 인식으로 잎 상태 판별', 'EC·pH 계측 실습', '30일 환경 데이터 그래프', '디지털 재배 일기'],
    evidenceIds: ['teen'],
    gradient: 'from-blueangel-300 to-blueangel-700',
    icon: 'ri-flask-line',
    art: 'kids',
    imageKey: 'care-kids',
  },
  {
    id: 'maru-day',
    name: '마루의 하루',
    target: '가족',
    targetDetail: '부모와 어린 자녀 동반',
    format: '반일 과정 · 주말 운영',
    summary: '유기농 채소를 가족이 함께 수확하고, 고추냉이가 자라는 과정을 관찰합니다.',
    why:
      '작물이 자라는 자리를 직접 보는 경험은 시장에서 살 수 없는 것입니다. "농산물은 산지에서 온다"는 거리감을 "우리 동네에서 자란다"로 바꿉니다. 농촌진흥청 실증에서 자녀와 함께 텃밭 활동을 한 부모의 코르티솔이 56.5%, 양육 스트레스가 9.9%p 줄었습니다.',
    curriculum: [
      { step: '1부', title: '마루와 농장 한 바퀴', detail: '마스코트 마루와 함께 8개 재배동을 돌며 오늘 수확할 작물을 고릅니다.' },
      { step: '2부', title: '가족 수확', detail: '양상추·차드·비트를 가족이 함께 수확합니다. 비트 즙으로 천연 색소 놀이를 합니다.' },
      { step: '3부', title: '고추냉이 관찰', detail: '수경 온실에서 근경이 자라는 모습과 잎의 향을 관찰합니다. 왜 수온 13℃를 지켜야 하는지 설비를 보며 설명합니다.' },
      { step: '4부', title: '포장 · 가져가기', detail: '수확물을 규격에 맞춰 담아 가고, 「마루의 신선 꾸러미」 정기 배송을 안내받습니다.' },
    ],
    resources: ['전 재배동', '고추냉이 수경 온실', '선별·포장 작업대'],
    tech: ['AI 작물 인식 체험', '수확 기록 디지털 앨범'],
    evidenceIds: ['family'],
    gradient: 'from-amber-400 to-orange-600',
    icon: 'ri-bear-smile-line',
    art: 'family',
    imageKey: 'care-family',
  },
  {
    id: 'public-care',
    name: '공익형 치유 프로그램',
    target: '복지기관 · 장애인기관',
    targetDetail: '서초구 복지기관 · 장애인기관 단체',
    format: '비영리 운영 · 치유농업사 진행',
    summary: '서초구 복지기관과 장애인기관을 대상으로 비영리로 운영합니다.',
    why:
      '치유농업의 효과가 가장 필요한 곳에 먼저 닿아야 합니다. 향재원은 이 프로그램을 수익 사업으로 보지 않고, 농장이 지역에 돌려주는 몫으로 운영합니다. 진행은 치유농업사 자격을 갖춘 인력이 맡습니다.',
    curriculum: [
      { step: '사전', title: '기관 사전 협의', detail: '참여자의 신체 조건과 인지 수준을 미리 공유받아 활동 강도를 맞춥니다.' },
      { step: '본 활동', title: '맞춤 원예 활동', detail: '휠체어 동선과 높낮이 조절 베드를 활용해 앉은 자세로도 가능한 활동을 구성합니다.' },
      { step: '마무리', title: '수확물 나눔', detail: '수확물을 참여자와 기관이 나눠 갑니다.' },
      { step: '사후', title: '기록 공유', detail: '활동 기록을 기관에 전달해 다음 회차 설계에 씁니다.' },
    ],
    resources: ['전 구역', '무장애 동선', '높낮이 조절 재배 베드'],
    tech: ['무장애 설계', '활동 기록 리포트', '쉬운 모드 UI'],
    evidenceIds: ['senior', 'mci', 'chronic'],
    gradient: 'from-emeraldgreen-500 to-blueangel-700',
    icon: 'ri-hand-heart-line',
    art: 'public',
    imageKey: 'care-public',
  },
];

export function getCareProgram(id: string): CareProgram | undefined {
  return CARE_PROGRAMS.find(p => p.id === id);
}

export function getCareEvidence(id: string): CareEvidence | undefined {
  return CARE_EVIDENCE.find(e => e.id === id);
}

/** 치유농업 × 첨단농업 — 융합 축 */
export const CARE_TECH_FUSION = [
  {
    id: 'env',
    title: '환경제어가 곧 치유 환경',
    desc: '고추냉이에 맞춘 서늘한 온실은 사람에게도 편안한 체류 환경입니다. 작물을 위한 제어가 참여자의 쾌적함으로 이어집니다.',
    icon: 'ri-temp-cold-line',
    link: '/smart-farm-data',
    linkLabel: '실시간 환경 데이터',
  },
  {
    id: 'ai',
    title: 'AI 작물 인식으로 즉시 피드백',
    desc: '사진 한 장으로 작물과 잎 상태를 확인합니다. "내가 돌본 것이 잘 자라고 있다"는 즉각적 확인이 활동의 동기가 됩니다.',
    icon: 'ri-camera-lens-line',
    link: '/crop-recognition',
    linkLabel: 'AI 작물 인식',
  },
  {
    id: 'record',
    title: '디지털 영농일지로 남는 기록',
    desc: '참여 회차마다 활동과 작물 변화가 기록됩니다. 프로그램이 끝난 뒤에도 자신의 변화를 되짚을 수 있습니다.',
    icon: 'ri-booklet-line',
    link: '/farm-calendar-memo',
    linkLabel: '영농 일지',
  },
  {
    id: 'barrier',
    title: '세대별 무장애 설계',
    desc: '휠체어 동선, 높낮이 조절 베드, 큰 글씨 모드까지 — 연령과 신체 조건에 따라 참여 방식을 다르게 설계합니다.',
    icon: 'ri-wheelchair-line',
    link: '/care-farming',
    linkLabel: '프로그램 보기',
  },
] as const;

/** 치유농업 제도 · 인증 추진 단계 */
export const CARE_CERT_ROADMAP = [
  { step: 1, label: '시설 기반 조성',            status: 'done',  desc: '수경 온실 · 재배동 8동 · 노지 재배 기반 완비' },
  { step: 2, label: '프로그램 설계',             status: 'doing', desc: '대상별 5개 프로그램 커리큘럼 설계 중' },
  { step: 3, label: '치유농업사 양성과정 이수',   status: 'doing', desc: '운영자가 치유농업사 양성과정을 이수합니다' },
  { step: 4, label: '치유농업시설 등록',          status: 'todo',  desc: '「치유농업 연구개발 및 육성에 관한 법률」(2021 시행)에 따른 시설 등록' },
  { step: 5, label: '우수 치유농업시설 인증 신청', status: 'todo',  desc: '농촌진흥청 「우수 치유농업시설 인증」(2026년 첫 시행) 단계적 추진' },
  { step: 6, label: '프로그램 정식 운영',         status: 'todo',  desc: '등록·인증 절차를 거친 뒤 개시' },
] as const;

/** 치유농업 제도 근거 */
export const CARE_LEGAL = {
  law: '치유농업 연구개발 및 육성에 관한 법률',
  lawYear: '2021년 시행',
  cert: '우수 치유농업시설 인증',
  certAuthority: '농촌진흥청',
  certYear: '2026년 첫 시행',
  staff: '치유농업사 양성과정 이수',
  notice:
    '아래 프로그램은 설계·준비 단계입니다. 치유농업시설 등록과 인증 절차를 마친 뒤 정식 운영할 예정이며, 현재 판매·모집 중인 상품이 아닙니다.',
} as const;

/* ═══════════════════════════════════════════════════════════
 * 7. 이용 수칙 — 취식 불가 안내 (사이트 전역 노출)
 * ═══════════════════════════════════════════════════════════ */

/** 홈·방문안내 상단에 상시 노출되는 핵심 금지 공지 */
export const NO_FOOD_NOTICE = {
  headline: '향재원에서는 음식을 드실 수 없습니다',
  sub: '농산물을 생산하는 재배 구역입니다',
  body:
    '향재원은 고추냉이와 유러피안 채소를 무농약으로 기르는 생산 농장입니다. 숯불·바비큐·도시락을 포함한 모든 취식과 화기 사용이 전면 불가하며, 야영·숙박·공간대여도 운영하지 않습니다.',
  forbidden: [
    { icon: 'ri-fire-line',      label: '숯불 · 바비큐 · 화로',  desc: '모든 화기 사용 금지' },
    { icon: 'ri-restaurant-line', label: '도시락 · 외부 음식',   desc: '반입 및 취식 불가' },
    { icon: 'ri-goblet-line',    label: '주류 반입 · 음주',      desc: '전면 금지' },
    { icon: 'ri-home-4-line',    label: '야영 · 숙박 · 글램핑',  desc: '운영하지 않음' },
    { icon: 'ri-key-2-line',     label: '공간 대여',             desc: '대여 상품 없음' },
    { icon: 'ri-footprint-line', label: '반려동물 동반',         desc: '농산물 위생상 불가' },
  ],
  reason:
    '무농약 재배라 병해충이 한 번 들어오면 되돌릴 방법이 없습니다. 농산물 안전과 병해충 유입 방지를 위한 조치이니 양해 부탁드립니다.',
  /** 치유농업 프로그램도 예외가 없습니다 — 수확물은 포장해서 가져가는 방식입니다 */
  programNote:
    '치유농업 프로그램 참가자도 농장 안에서는 취식할 수 없습니다. 수확물은 규격에 맞춰 포장해 가져가는 방식으로만 운영합니다.',
} as const;

/** 방문 시 지켜주실 일반 수칙 */
export const VISIT_RULES = [
  { icon: 'ri-calendar-check-line', title: '사전 협의 후 방문',  desc: '재배 일정에 따라 출입이 제한될 수 있어 방문 전 연락이 필요합니다.' },
  { icon: 'ri-shirt-line',          title: '위생 복장 착용',     desc: '온실 입장 시 제공되는 덧신과 위생 장비를 착용해 주세요.' },
  { icon: 'ri-hand-sanitizer-line', title: '손 소독 후 입장',    desc: '무농약 재배라 병해 유입을 막는 기본 절차가 특히 중요합니다.' },
  { icon: 'ri-forbid-2-line',       title: '작물 무단 접촉 금지', desc: '재배 중인 작물은 안내에 따라서만 만져 주세요.' },
  { icon: 'ri-recycle-line',        title: '쓰레기 되가져가기',   desc: '농장 내 일반 쓰레기 배출 시설이 없습니다.' },
  { icon: 'ri-car-line',            title: '진입로 통행 배려',   desc: '진입로가 좁습니다. 지정된 구역에만 주차해 주세요.' },
];

/* ═══════════════════════════════════════════════════════════
 * 8. 마스코트 — 마루
 * ═══════════════════════════════════════════════════════════ */

export const MASCOT = {
  name: '마루',
  nameEn: 'MARU',
  role: '향재원의 작은 초록 수호자',
  story:
    '마루는 향재원에서 태어난 작은 초록 수호자입니다. 흙의 숨결과 햇살의 온기를 품고 자라며, 농장과 사람을 다정하게 이어 줍니다. 작물의 성장을 살피고, 배움의 즐거움을 전하며, 향재원의 하루를 밝게 지키는 친구입니다.',
  motif: '고추냉이 잎과 뿌리줄기에서 따온 형태',
  /** 마루 이름을 쓰는 서비스 */
  services: [
    { name: '마루의 신선 꾸러미', desc: '재배동에서 수확한 유기농 채소를 서초구민에게 먼저 보내는 정기 배송' },
    { name: '마루의 하루',       desc: '가족 단위 수확 · 관찰 치유 프로그램' },
  ],
  poses: [
    { id: 'hello',   label: '인사하는 마루', desc: '방문객을 맞이합니다' },
    { id: 'water',   label: '물 주는 마루',  desc: '수경 베드를 살핍니다' },
    { id: 'harvest', label: '수확하는 마루', desc: '유러피안 채소를 거둡니다' },
    { id: 'rest',    label: '쉬는 마루',     desc: '하루를 마무리합니다' },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════
 * 9. 사이트 내비게이션 — 스토리 흐름
 * ═══════════════════════════════════════════════════════════ */

export interface StoryRoute {
  to: string;
  label: string;
  sub: string;
  icon: string;
  gradient: string;
}

export const STORY_ROUTES: StoryRoute[] = [
  {
    to: '/wasabi',
    label: '고추냉이',
    sub: '유기농 수경재배 · 무농약',
    icon: 'ri-plant-line',
    gradient: 'from-wasabi-400 to-emeraldgreen-700',
  },
  {
    to: '/houses',
    label: '재배동 8동',
    sub: '유러피안 채소 8품목',
    icon: 'ri-home-4-line',
    gradient: 'from-lime-400 to-wasabi-700',
  },
  {
    to: '/field',
    label: '노지 과수 · 화훼',
    sub: '블루베리 · 에메랄드골드 · 조경수',
    icon: 'ri-flower-line',
    gradient: 'from-blueangel-300 to-blueangel-700',
  },
  {
    to: '/care-farming',
    label: '치유농업',
    sub: '대상별 5개 프로그램',
    icon: 'ri-heart-pulse-line',
    gradient: 'from-rose-400 to-pink-700',
  },
];
