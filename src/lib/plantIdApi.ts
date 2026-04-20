/**
 * PlantNet API 연동 — 식물 AI 식별 (46만종)
 *
 * 잎 형태·줄기·꽃·열매·수피 패턴 분석으로 식물 종 판별
 * 무료: 500건/일 · https://my.plantnet.org/
 *
 * API Key: 2b10bCzINx9zSmdtXNE9XxUUVO
 */

const DIRECT_API_KEY = '2b10bCzINx9zSmdtXNE9XxUUVO';
const DIRECT_API_URL = 'https://my-api.plantnet.org/v2/identify/all';
// Vercel 프록시 URL (절대 경로 — 어디서든 작동)
const VERCEL_PROXY = 'https://hyangjae-docs-743jifoex-choijungman12s-projects.vercel.app/api/plantnet';
// 로컬 프록시 (Vite dev server)
const LOCAL_PROXY = '/api/plantnet';

export const PLANT_ID_CONFIGURED = true;

export interface PlantIdResult {
  success: boolean;
  name: string;
  koreanName: string;
  scientificName: string;
  family: string;
  familyKorean: string;
  probability: number;
  description: string;
  imageUrl: string;
  commonNames: string[];
  allResults: {
    name: string;
    koreanName: string;
    score: number;
    family: string;
    familyKorean: string;
    commonNames: string[];
  }[];
  source: 'plantnet' | 'color-fallback';
}

export interface PlantDisease {
  name: string;
  probability: number;
  description: string;
}

/**
 * 학명(species) → 한국어명 매핑
 */
const SCIENTIFIC_TO_KOREAN: Record<string, string> = {
  // 향재원 주력·데크 작물
  'Eutrema japonicum': '고추냉이',
  'Wasabia japonica': '고추냉이',
  'Lactuca sativa': '상추',
  'Perilla frutescens': '깻잎',
  'Fragaria × ananassa': '딸기',
  'Fragaria ananassa': '딸기',
  'Fragaria vesca': '산딸기',
  'Solanum lycopersicum': '토마토',
  'Solanum melongena': '가지',
  'Solanum tuberosum': '감자',
  'Capsicum annuum': '고추',
  'Ocimum basilicum': '바질',
  'Mentha piperita': '페퍼민트',
  'Mentha spicata': '스피어민트',
  'Rosmarinus officinalis': '로즈마리',
  'Salvia rosmarinus': '로즈마리',
  'Lavandula angustifolia': '라벤더',
  'Thymus vulgaris': '타임',
  'Origanum vulgare': '오레가노',
  'Coriandrum sativum': '고수',
  'Anethum graveolens': '딜',
  // 엽채·근채류
  'Spinacia oleracea': '시금치',
  'Brassica oleracea': '양배추·케일',
  'Brassica rapa': '배추·무 계열',
  'Brassica napus': '유채',
  'Raphanus sativus': '무',
  'Daucus carota': '당근',
  'Allium cepa': '양파',
  'Allium sativum': '마늘',
  'Allium fistulosum': '대파',
  'Allium tuberosum': '부추',
  'Cucumis sativus': '오이',
  'Cucumis melo': '참외·멜론',
  'Cucurbita pepo': '애호박',
  'Cucurbita moschata': '호박',
  'Citrullus lanatus': '수박',
  'Zea mays': '옥수수',
  'Oryza sativa': '벼',
  'Glycine max': '콩',
  'Ipomoea batatas': '고구마',
  // 과수
  'Malus domestica': '사과',
  'Pyrus pyrifolia': '배',
  'Prunus persica': '복숭아',
  'Prunus mume': '매실',
  'Citrus reticulata': '귤',
  'Diospyros kaki': '감',
  'Vitis vinifera': '포도',
  // 관엽·원예식물
  'Anthurium andraeanum': '안스리움',
  'Anthurium crystallinum': '안스리움 크리스탈리눔',
  'Anthurium clarinervium': '안스리움 클라리너비움',
  'Philodendron hederaceum': '필로덴드론 헤데라케움',
  'Philodendron bipinnatifidum': '셀로움 필로덴드론',
  'Spathiphyllum wallisii': '스파티필럼',
  'Alocasia amazonica': '알로카시아',
  'Alocasia odora': '아프리카 토란',
  'Monstera deliciosa': '몬스테라',
  'Epipremnum aureum': '포토스',
  'Ficus elastica': '인도고무나무',
  'Ficus benjamina': '벤자민고무나무',
  'Ficus lyrata': '피들리프 피그',
  'Sansevieria trifasciata': '산세베리아',
  'Dracaena fragrans': '행운목',
  'Chlorophytum comosum': '접란',
  'Aglaonema commutatum': '아글라오네마',
  'Dieffenbachia seguine': '디펜바키아',
  'Zamioculcas zamiifolia': '금전수(ZZ 플랜트)',
  // 꽃
  'Chrysanthemum morifolium': '국화',
  'Helianthus annuus': '해바라기',
  'Calendula officinalis': '금잔화',
  'Rosa rugosa': '해당화',
  'Rosa hybrida': '장미',
  'Hydrangea macrophylla': '수국',
  'Tulipa gesneriana': '튤립',
  'Lilium lancifolium': '참나리',
  'Paeonia lactiflora': '작약',
  'Hibiscus syriacus': '무궁화',
  'Prunus yedoensis': '왕벚나무',
};

/**
 * 속(genus) 단위 fallback — 종 매칭 실패 시 사용
 * UX상 "속" 접미사 없이 한국 외래어 표기로 자연스럽게
 */
const GENUS_TO_KOREAN: Record<string, string> = {
  Eutrema: '고추냉이류',
  Wasabia: '고추냉이류',
  Lactuca: '상추류',
  Perilla: '들깨류',
  Fragaria: '딸기류',
  Solanum: '가지과',
  Capsicum: '고추류',
  Ocimum: '바질류',
  Mentha: '박하류',
  Rosmarinus: '로즈마리',
  Salvia: '샐비어류',
  Lavandula: '라벤더',
  Thymus: '타임류',
  Origanum: '오레가노류',
  Spinacia: '시금치',
  Brassica: '배추속 작물',
  Raphanus: '무류',
  Daucus: '당근류',
  Allium: '파·마늘류',
  Cucumis: '오이·참외류',
  Cucurbita: '호박류',
  Citrullus: '수박류',
  Zea: '옥수수',
  Oryza: '벼',
  Glycine: '콩',
  Ipomoea: '나팔꽃·고구마류',
  Malus: '사과나무',
  Pyrus: '배나무',
  Prunus: '벚·매실류',
  Citrus: '감귤류',
  Diospyros: '감나무',
  Vitis: '포도나무',
  Anthurium: '안스리움',
  Philodendron: '필로덴드론',
  Spathiphyllum: '스파티필럼',
  Alocasia: '알로카시아',
  Monstera: '몬스테라',
  Epipremnum: '포토스',
  Ficus: '고무나무·무화과류',
  Sansevieria: '산세베리아',
  Dracaena: '드라세나',
  Chlorophytum: '접란',
  Aglaonema: '아글라오네마',
  Dieffenbachia: '디펜바키아',
  Zamioculcas: '금전수',
  Chrysanthemum: '국화',
  Helianthus: '해바라기',
  Calendula: '금잔화',
  Rosa: '장미',
  Hydrangea: '수국',
  Tulipa: '튤립',
  Lilium: '백합',
  Paeonia: '작약·모란',
  Hibiscus: '무궁화·히비스커스',
};

/**
 * 영문 common name → 한국어 fallback
 * (학명·속 모두 미매칭 시 최후 수단)
 */
const COMMON_NAME_TO_KOREAN: Record<string, string> = {
  anthurium: '안스리움',
  'flamingo flower': '안스리움',
  "painter's palette": '안스리움',
  philodendron: '필로덴드론',
  monstera: '몬스테라',
  'swiss cheese plant': '몬스테라',
  pothos: '포토스',
  'devil\'s ivy': '포토스',
  'golden pothos': '포토스',
  'peace lily': '스파티필럼',
  alocasia: '알로카시아',
  'rubber plant': '인도고무나무',
  'rubber tree': '인도고무나무',
  'weeping fig': '벤자민고무나무',
  'fiddle-leaf fig': '피들리프 피그',
  'snake plant': '산세베리아',
  "mother-in-law's tongue": '산세베리아',
  'spider plant': '접란',
  'zz plant': '금전수',
  wasabi: '고추냉이',
  'japanese horseradish': '고추냉이',
  lettuce: '상추',
  perilla: '깻잎',
  strawberry: '딸기',
  tomato: '토마토',
  pepper: '고추',
  'chili pepper': '고추',
  'bell pepper': '파프리카',
  basil: '바질',
  'sweet basil': '바질',
  mint: '민트',
  peppermint: '페퍼민트',
  spearmint: '스피어민트',
  rosemary: '로즈마리',
  lavender: '라벤더',
  thyme: '타임',
  oregano: '오레가노',
  cilantro: '고수',
  coriander: '고수',
  dill: '딜',
  spinach: '시금치',
  cabbage: '양배추',
  kale: '케일',
  radish: '무',
  carrot: '당근',
  onion: '양파',
  garlic: '마늘',
  scallion: '대파',
  'green onion': '대파',
  chive: '부추',
  cucumber: '오이',
  melon: '멜론',
  zucchini: '애호박',
  pumpkin: '호박',
  watermelon: '수박',
  corn: '옥수수',
  rice: '벼',
  soybean: '콩',
  'sweet potato': '고구마',
  apple: '사과',
  pear: '배',
  peach: '복숭아',
  persimmon: '감',
  grape: '포도',
  rose: '장미',
  tulip: '튤립',
  lily: '백합',
  peony: '작약',
  sunflower: '해바라기',
  marigold: '금잔화',
  hydrangea: '수국',
  chrysanthemum: '국화',
  cherry: '벚나무',
  'cherry blossom': '벚꽃',
  hibiscus: '히비스커스',
};

const FAMILY_TO_KOREAN: Record<string, string> = {
  Brassicaceae: '십자화과',
  Asteraceae: '국화과',
  Compositae: '국화과',
  Lamiaceae: '꿀풀과',
  Labiatae: '꿀풀과',
  Rosaceae: '장미과',
  Solanaceae: '가지과',
  Cucurbitaceae: '박과',
  Amaranthaceae: '비름과',
  Chenopodiaceae: '명아주과',
  Apiaceae: '미나리과',
  Umbelliferae: '미나리과',
  Amaryllidaceae: '수선화과',
  Alliaceae: '부추과',
  Poaceae: '벼과',
  Gramineae: '벼과',
  Araceae: '천남성과',
  Moraceae: '뽕나무과',
  Hydrangeaceae: '수국과',
};

/**
 * 학명 + 영문 common names → 한국어명 변환
 * 매칭 우선순위:
 *   1) commonNames에 이미 한글이 포함되어 있으면 그대로 사용
 *   2) 학명 전체 매칭 (예: "Anthurium andraeanum")
 *   3) 학명 앞 2단어(binomial) 매칭
 *   4) 속(genus) 매칭 (예: "Anthurium" → "안스리움")
 *   5) 영문 common name 매칭 (예: "Flamingo Flower" → "안스리움")
 *   6) 개별 common name 단어 매칭 (예: "anthurium" 한 단어)
 */
function getKoreanName(
  scientificName: string,
  commonNames: string[] = [],
): string {
  // 1) 이미 한글이 포함된 common name 우선
  const hangulRegex = /[\uac00-\ud7a3]/;
  const hangulCommon = commonNames.find((n) => hangulRegex.test(n));
  if (hangulCommon) return hangulCommon;

  // 2) 학명 전체 매칭
  if (SCIENTIFIC_TO_KOREAN[scientificName]) {
    return SCIENTIFIC_TO_KOREAN[scientificName];
  }

  // 3) "Genus species" 앞 두 단어로 재시도
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const binomial = `${parts[0]} ${parts[1]}`;
    if (SCIENTIFIC_TO_KOREAN[binomial]) {
      return SCIENTIFIC_TO_KOREAN[binomial];
    }
  }

  // 4) 속(genus) 단위 매칭
  const genus = parts[0];
  if (genus && GENUS_TO_KOREAN[genus]) {
    return GENUS_TO_KOREAN[genus];
  }

  // 5) 영문 common name 전체 매칭 (예: "Flamingo Flower")
  for (const cn of commonNames) {
    const key = cn.trim().toLowerCase();
    if (COMMON_NAME_TO_KOREAN[key]) {
      return COMMON_NAME_TO_KOREAN[key];
    }
  }

  // 6) common name 단어 단위 매칭 (예: "anthurium andraeanum" 중 "anthurium")
  for (const cn of commonNames) {
    const words = cn.toLowerCase().split(/[\s,/()]+/).filter(Boolean);
    for (const w of words) {
      if (COMMON_NAME_TO_KOREAN[w]) {
        return COMMON_NAME_TO_KOREAN[w];
      }
    }
  }

  // 7) 학명 마지막 종소명 자체가 common key와 일치하는 경우 (예: "Anthurium sp.")
  if (parts[0]) {
    const lowered = parts[0].toLowerCase();
    if (COMMON_NAME_TO_KOREAN[lowered]) {
      return COMMON_NAME_TO_KOREAN[lowered];
    }
  }

  return '';
}

function getKoreanFamily(family: string): string {
  return FAMILY_TO_KOREAN[family] || '';
}

/**
 * 이미지를 PlantNet API로 전송하여 식물 식별
 */
export async function identifyPlant(imageBase64: string): Promise<PlantIdResult> {
  try {
    // base64 → Blob
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const byteChars = atob(base64Data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('images', blob, 'plant.jpg');

    // Vercel 프록시를 항상 사용 (CORS 문제 완전 해결)
    // 로컬 개발 시에는 /api/plantnet (Vite proxy), 배포 시에는 Vercel 절대 URL
    const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const proxyUrl = isLocalDev ? LOCAL_PROXY : VERCEL_PROXY;

    let response: Response;
    try {
      response = await fetch(proxyUrl, { method: 'POST', body: formData });
    } catch {
      // Vercel 프록시 실패 시 직접 호출 시도
      const directUrl = `${DIRECT_API_URL}?include-related-images=true&no-reject=true&lang=en&api-key=${DIRECT_API_KEY}`;
      response = await fetch(directUrl, { method: 'POST', body: formData });
    }

    if (!response.ok) {
      console.error('PlantNet API error:', response.status);
      return colorFallback('API 응답 오류: ' + response.status);
    }

    const data = await response.json();
    const results = data.results || [];
    const best = results[0];

    if (!best || best.score < 0.005) {
      return {
        success: false,
        name: '식물을 식별할 수 없습니다',
        koreanName: '',
        scientificName: '잎·꽃·줄기가 선명하게 보이도록 더 가까이 촬영해 주세요',
        family: '—',
        familyKorean: '',
        probability: 0,
        description: '이미지가 불명확하거나 식물이 아닌 것으로 보입니다.',
        imageUrl: '',
        commonNames: [],
        allResults: [],
        source: 'plantnet',
      };
    }

    const species = best.species;
    const commonNames = species.commonNames || [];
    const scientificName = species.scientificNameWithoutAuthor || '—';
    const familyName = species.family?.scientificNameWithoutAuthor || '—';
    const imageUrl = best.images?.[0]?.url?.s || '';

    const englishCommon = commonNames[0] || scientificName;
    const koreanName = getKoreanName(scientificName, commonNames);
    const familyKorean = getKoreanFamily(familyName);

    // 상위 5개 후보
    const allResults = results.slice(0, 5).map((r: any) => {
      const sci = r.species?.scientificNameWithoutAuthor || '—';
      const fam = r.species?.family?.scientificNameWithoutAuthor || '—';
      const cns = r.species?.commonNames || [];
      return {
        name: cns[0] || sci,
        koreanName: getKoreanName(sci, cns),
        score: r.score || 0,
        family: fam,
        familyKorean: getKoreanFamily(fam),
        commonNames: cns,
      };
    });

    // 한글명이 있으면 "한글명 (English)" 병기, 없으면 영문만
    const displayName = koreanName
      ? `${koreanName} (${englishCommon})`
      : englishCommon;

    const familyDisplay = familyKorean
      ? `${familyKorean} (${familyName})`
      : `${familyName}과`;

    return {
      success: true,
      name: displayName,
      koreanName,
      scientificName,
      family: familyName,
      familyKorean,
      probability: best.score || 0,
      description: `${scientificName} · ${familyDisplay} · 신뢰도 ${(best.score * 100).toFixed(1)}%`,
      imageUrl,
      commonNames,
      allResults,
      source: 'plantnet',
    };
  } catch (err) {
    console.error('PlantNet API call failed:', err);
    return colorFallback(err instanceof Error ? err.message : '네트워크 오류');
  }
}

function colorFallback(reason: string): PlantIdResult {
  return {
    success: false,
    name: 'API 연결 실패',
    koreanName: '',
    scientificName: reason,
    family: '—',
    familyKorean: '',
    probability: 0,
    description: '네트워크를 확인해 주세요. 색상 기반 분석으로 대체합니다.',
    imageUrl: '',
    commonNames: [],
    allResults: [],
    source: 'color-fallback',
  };
}
