/**
 * 작물별 시세 상세 정보
 *
 * 가격 동향 페이지에서 표시할 작물별 심층 메타데이터입니다.
 * - KAMIS 시세 데이터 기반
 * - 2025~2026년 유통 특성 반영
 */

export interface CropMarketDetail {
  id: string;
  koreanName: string;
  scientificName: string;
  family: string;                  // 과
  category: '엽채류' | '과채류' | '근채류' | '허브류';
  origin: string;                  // 주요 산지
  peakSeason: string;              // 출하 성수기
  lowSeason: string;               // 출하 비수기
  unit: string;                    // 표준 거래 단위
  shelfLife: string;               // 저장성
  volatility: 'low' | 'medium' | 'high'; // 가격 변동성
  nutritionHighlight: string;      // 영양 특징
  marketNotes: string;             // 유통 특이사항
  priceInsight: string;            // 가격 동향 해설
  tradingTip: string;              // 거래 팁
}

export const CROP_MARKET_DETAILS: Record<string, CropMarketDetail> = {
  /* ═══════ 엽채류 ═══════ */
  lettuce: {
    id: 'lettuce',
    koreanName: '상추',
    scientificName: 'Lactuca sativa',
    family: '국화과 (Asteraceae)',
    category: '엽채류',
    origin: '경기(광주·연천) · 전남(나주) · 충남(논산)',
    peakSeason: '4~6월, 9~11월',
    lowSeason: '7~8월 (고온기), 12~1월',
    unit: '박스 (4kg)',
    shelfLife: '냉장 5~7일',
    volatility: 'high',
    nutritionHighlight: '비타민K · 엽산 · 식이섬유 풍부',
    marketNotes: '쌈채소 시장 주력 품목. 여름철 고온 스트레스로 작황 불안정, 가격 급등 빈번.',
    priceInsight: '봄·가을 안정세이며 7~8월 고온기에 30~50% 상승. 스마트팜 생산은 연중 일정 공급이 가능해 프리미엄가 형성.',
    tradingTip: '가락시장 새벽 4~6시 경락. 잎 두께와 색택으로 A/B등급 구분. 박스당 색택 균일도가 중요.',
  },
  kale: {
    id: 'kale',
    koreanName: '케일',
    scientificName: 'Brassica oleracea var. acephala',
    family: '십자화과 (Brassicaceae)',
    category: '엽채류',
    origin: '제주 · 강원(평창) · 경기(양평)',
    peakSeason: '3~5월, 9~11월',
    lowSeason: '7~8월',
    unit: '박스 (3kg)',
    shelfLife: '냉장 7~10일',
    volatility: 'low',
    nutritionHighlight: '베타카로틴 · 루테인 · 칼슘 · 항산화 성분 최고 수준',
    marketNotes: '주스용 / 샐러드용 수요 꾸준 증가. 국내 재배 면적은 여전히 적어 가격 안정적.',
    priceInsight: '건강식 트렌드로 연간 10~15% 가격 상승 지속. 유기농 케일은 일반 대비 1.5~2배.',
    tradingTip: '쓴맛이 적은 딤프·딤보 품종이 프리미엄가. 잎이 두껍고 주름 선명한 것 선호.',
  },
  spinach: {
    id: 'spinach',
    koreanName: '시금치',
    scientificName: 'Spinacia oleracea',
    family: '비름과 (Amaranthaceae)',
    category: '엽채류',
    origin: '경남(남해) · 전남(신안) · 포항(포항초)',
    peakSeason: '11~3월 (겨울 제철)',
    lowSeason: '6~8월',
    unit: '박스 (4kg)',
    shelfLife: '냉장 3~5일',
    volatility: 'high',
    nutritionHighlight: '철분·엽산·비타민A 고함량. 겨울 시금치의 단맛이 특징',
    marketNotes: '남해·포항 재래종 시금치는 단맛이 강해 일반 시금치 대비 1.5배 가격. 여름 시금치는 질이 떨어짐.',
    priceInsight: '12~2월이 최저가. 5~9월은 고온으로 30~80% 상승.',
    tradingTip: '뿌리가 분홍빛이고 잎이 두꺼운 것이 상품. 잎줄기 상처 여부 확인 필수.',
  },
  perilla: {
    id: 'perilla',
    koreanName: '깻잎',
    scientificName: 'Perilla frutescens',
    family: '꿀풀과 (Lamiaceae)',
    category: '엽채류',
    origin: '경남(밀양·금산) · 충남(금산)',
    peakSeason: '5~10월',
    lowSeason: '11~3월 (시설재배 의존)',
    unit: '박스 (2kg / 200장 × 10묶음)',
    shelfLife: '냉장 5~7일',
    volatility: 'medium',
    nutritionHighlight: '오메가3·로즈마린산·항염 효능',
    marketNotes: '한국 고유 작물로 수출도 증가 추세. 겨울철 시설재배 비중 90% 이상.',
    priceInsight: '겨울(12~2월) 시설 난방비로 40~60% 상승. 여름은 노지 대량 출하로 하락.',
    tradingTip: '잎 크기 균일 + 향 강한 것. 시든 잎·변색 잎 섞이지 않은 고품질 묶음 선호.',
  },

  /* ═══════ 과채류 ═══════ */
  tomato: {
    id: 'tomato',
    koreanName: '토마토',
    scientificName: 'Solanum lycopersicum',
    family: '가지과 (Solanaceae)',
    category: '과채류',
    origin: '충남(부여) · 전북(장수) · 강원(화천)',
    peakSeason: '5~7월',
    lowSeason: '11~1월',
    unit: '박스 (5kg)',
    shelfLife: '상온 5일 / 냉장 10일',
    volatility: 'medium',
    nutritionHighlight: '리코펜·비타민C·칼륨. 익힐수록 영양가 증가',
    marketNotes: '스마트팜 도입 선두 작물. 완숙/청숙 구분 유통.',
    priceInsight: '2025년 기상이변으로 여름 가격 급등 반복. 시설 토마토는 겨울 난방비 영향.',
    tradingTip: '꼭지가 싱싱하고 전체가 고르게 붉은 것. 단단하되 너무 딱딱하지 않은 것.',
  },
  strawberry: {
    id: 'strawberry',
    koreanName: '딸기',
    scientificName: 'Fragaria × ananassa',
    family: '장미과 (Rosaceae)',
    category: '과채류',
    origin: '충남(논산) · 경남(밀양·진주) · 전북(남원)',
    peakSeason: '12~4월',
    lowSeason: '7~9월',
    unit: '박스 (2kg)',
    shelfLife: '냉장 3~5일',
    volatility: 'high',
    nutritionHighlight: '비타민C 과일 중 최고. 엽산·안토시아닌 풍부',
    marketNotes: '설향·매향·금실 품종이 주력. 수출 증가로 고품질 선별 강화.',
    priceInsight: '12월 초 최고가(3만원/kg) → 2~3월 정점 수확기 하락. 여름은 수입 의존.',
    tradingTip: '크기 균일·꼭지 초록·광택 선명. 물러진 과실 없는지 박스 내부 체크.',
  },
  pepper: {
    id: 'pepper',
    koreanName: '파프리카',
    scientificName: 'Capsicum annuum',
    family: '가지과 (Solanaceae)',
    category: '과채류',
    origin: '강원(철원·춘천) · 충남(부여) · 전북(남원)',
    peakSeason: '4~10월',
    lowSeason: '11~3월',
    unit: '박스 (5kg)',
    shelfLife: '냉장 10~14일',
    volatility: 'low',
    nutritionHighlight: '비타민C 토마토의 4배. 베타카로틴 · 루테인',
    marketNotes: '일본 수출 주력 품목. 국내 소비는 샐러드·볶음용.',
    priceInsight: '수출 가격이 국내가보다 1.5배. 시설재배 안정 공급으로 변동성 낮음.',
    tradingTip: '색택 선명(빨강·노랑·주황) + 꼭지 싱싱 + 과실 크기 250g 이상.',
  },
  cucumber: {
    id: 'cucumber',
    koreanName: '오이',
    scientificName: 'Cucumis sativus',
    family: '박과 (Cucurbitaceae)',
    category: '과채류',
    origin: '충남(천안·당진) · 전남(순천)',
    peakSeason: '5~7월',
    lowSeason: '11~2월',
    unit: '박스 (10kg / 100~120개)',
    shelfLife: '냉장 7~10일',
    volatility: 'high',
    nutritionHighlight: '95% 수분. 칼륨 · 비타민K',
    marketNotes: '백다다기(한국형) · 취청 · 가시오이 품종. 여름철 출하량 폭증.',
    priceInsight: '6~7월 집중 출하로 40~50% 하락. 11~2월 시설재배 가격 2배 상승.',
    tradingTip: '표면 가시 선명 + 곧은 형태 + 꼭지 싱싱. 휘어진 오이는 B등급.',
  },
  'cherry-tomato': {
    id: 'cherry-tomato',
    koreanName: '방울토마토',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    family: '가지과 (Solanaceae)',
    category: '과채류',
    origin: '충남(부여) · 전북(장수) · 강원',
    peakSeason: '4~7월',
    lowSeason: '12~2월',
    unit: '박스 (3kg)',
    shelfLife: '냉장 10~14일',
    volatility: 'medium',
    nutritionHighlight: '일반 토마토 대비 당도 1.5배. 리코펜 고함량',
    marketNotes: '대저·스테비아 방울토마토 등 고당도 품종 인기. 수출도 증가.',
    priceInsight: '고당도 브랜드 방울토마토는 일반 대비 2~3배 가격. 스마트팜 고부가 작물.',
    tradingTip: '당도 8~10Brix 이상, 꼭지 초록, 크기 균일(25~30g).',
  },

  /* ═══════ 근채류 ═══════ */
  radish: {
    id: 'radish',
    koreanName: '무',
    scientificName: 'Raphanus sativus',
    family: '십자화과 (Brassicaceae)',
    category: '근채류',
    origin: '제주(월동무) · 강원(고랭지) · 충남(가을무)',
    peakSeason: '11~2월 (김장철)',
    lowSeason: '6~8월',
    unit: '박스 (10kg / 10~15개)',
    shelfLife: '냉장 2~3주',
    volatility: 'high',
    nutritionHighlight: '소화효소 디아스타제 · 비타민C · 칼륨',
    marketNotes: '김장철 수요 집중으로 가격 변동 극심. 제주 월동무가 겨울 주력.',
    priceInsight: '10~12월 김장철 가격 정점. 2025년 가을무 작황 부진으로 200% 상승한 사례.',
    tradingTip: '뿌리 곧고 매끄럽고 무거운 것 + 잎 부분 싱싱 + 바람 들지 않은 것 체크.',
  },
  carrot: {
    id: 'carrot',
    koreanName: '당근',
    scientificName: 'Daucus carota',
    family: '미나리과 (Apiaceae)',
    category: '근채류',
    origin: '제주(구좌·월동) · 부산(김해) · 강원(평창)',
    peakSeason: '11~3월',
    lowSeason: '7~9월',
    unit: '박스 (20kg)',
    shelfLife: '냉장 2~4주',
    volatility: 'medium',
    nutritionHighlight: '베타카로틴 최고 함량 · 비타민A 공급원',
    marketNotes: '제주 월동당근이 겨울 주력. 여름은 강원 고랭지 / 중국 수입 혼재.',
    priceInsight: '중국산 수입으로 가격 상단 제한. 국산 프리미엄은 유기농/친환경 위주.',
    tradingTip: '표면 매끄럽고 색택 선명 + 잎자리 초록 + 갈라짐 없는 것.',
  },

  /* ═══════ 허브류 ═══════ */
  wasabi: {
    id: 'wasabi',
    koreanName: '고추냉이',
    scientificName: 'Eutrema japonicum (Wasabia japonica)',
    family: '십자화과 (Brassicaceae)',
    category: '허브류',
    origin: '강원(철원) · 경남(밀양) · 수경재배 시설',
    peakSeason: '연중 (스마트팜)',
    lowSeason: '여름 고온기 (노지)',
    unit: 'kg 단위 (근경)',
    shelfLife: '냉장 2주',
    volatility: 'low',
    nutritionHighlight: '시니그린 · 알릴이소티오시아네이트 · 항균 효능',
    marketNotes: '국내 유통 99% 수입산(냉동 페이스트). 생근경 국산은 향재원 등 소수 스마트팜 직거래.',
    priceInsight: '생근경 국산은 8~10만원/kg 프리미엄. 수요는 고급 일식당·호텔 중심.',
    tradingTip: '직경 3cm 이상, 무게 80g 이상, 표면 곰팡이 없고 초록빛 선명한 것.',
  },
  basil: {
    id: 'basil',
    koreanName: '바질',
    scientificName: 'Ocimum basilicum',
    family: '꿀풀과 (Lamiaceae)',
    category: '허브류',
    origin: '경기(수도권 근교) · 시설 수경재배',
    peakSeason: '5~9월 (노지)',
    lowSeason: '12~2월',
    unit: '100g 단위',
    shelfLife: '냉장 5~7일',
    volatility: 'medium',
    nutritionHighlight: '리날로올 · 유게놀 · 이탈리안 요리 필수',
    marketNotes: '이탈리안 레스토랑 · 홈쿠킹 수요 증가. 국내 시설재배 확대 중.',
    priceInsight: '국산 생바질은 100g 4~5천원. 수입 건조 바질 대비 10배 프리미엄.',
    tradingTip: '잎 색 선명·향 강함·잎끝 변색 없음. 수확 후 48시간 이내 소비 권장.',
  },
  mint: {
    id: 'mint',
    koreanName: '민트',
    scientificName: 'Mentha spp.',
    family: '꿀풀과 (Lamiaceae)',
    category: '허브류',
    origin: '경기(양평) · 수경재배 시설',
    peakSeason: '5~10월',
    lowSeason: '12~2월',
    unit: '100g 단위',
    shelfLife: '냉장 5~7일',
    volatility: 'medium',
    nutritionHighlight: '멘톨 · 소화 촉진 · 진정 효능',
    marketNotes: '칵테일·디저트·차 수요로 카페·바 주요 납품처. 스피어민트/페퍼민트 구분.',
    priceInsight: '국산 생민트 100g 3~4천원. 수입 건조 대비 프리미엄.',
    tradingTip: '잎 크고 향 강한 것. 줄기 곧고 잎자리 촘촘한 것이 상품.',
  },
};

export function getCropDetail(cropId: string): CropMarketDetail | undefined {
  return CROP_MARKET_DETAILS[cropId];
}

export const VOLATILITY_META = {
  low:    { label: '낮음', color: 'emerald', desc: '안정적' },
  medium: { label: '보통', color: 'amber',   desc: '계절 변동' },
  high:   { label: '높음', color: 'red',     desc: '기상·작황 민감' },
} as const;
