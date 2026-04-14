/**
 * KAMIS (한국농수산식품유통공사) API 클라이언트
 *
 * 실제 가락시장 경락가 및 전국 도매·소매 가격 조회
 * 공식 문서: https://www.kamis.or.kr/customer/reference/openapi_list.do
 *
 * ⚠️ 운영 배포 시 필요 사항:
 *   1. KAMIS OpenAPI 키 발급 (무료, kamis.or.kr 가입 후 신청)
 *   2. CORS 우회를 위한 백엔드 프록시
 *      - 추천: Vercel/Netlify Serverless Function
 *      - 또는 Node.js Express 프록시
 *   3. .env 파일에 다음 값 설정:
 *      VITE_KAMIS_PROXY_URL=https://your-proxy.com/api/kamis
 *      VITE_KAMIS_CERT_KEY=발급받은_인증키
 *      VITE_KAMIS_CERT_ID=인증ID
 *
 * 현재 상태: 프록시 미설정 시 → 현실적인 시세 기반 목업 데이터로 자동 fallback
 *
 * ※ 가락시장 직접 OpenAPI(서울특별시농수산식품공사)는 `./garakApi.ts` 로 분리.
 *    `getCropPrice` 는 garak → kamis → mock 순으로 자동 시도한다.
 */

import { fetchGarakPriceHistory, GARAK_CONFIGURED } from './garakApi';

export interface PriceData {
  date: string;        // YYYY-MM-DD
  wholesale: number;   // 도매가 (원/kg)
  retail: number;      // 소매가 (원/kg)
  auction?: number;    // 경매가 (원/kg, 가락시장 기준)
}

export interface CropPriceInfo {
  cropId: string;
  cropName: string;
  kamisItemCode: string;  // KAMIS 품목 코드
  latestPrice: PriceData;
  history: PriceData[];   // 최근 30일
  source: 'kamis' | 'garak' | 'mock';
  updatedAt: string;
}

// ! 🔴 EDIT:API_KAMIS ─ 가락시장 실시간 시세 API
// .env 파일에 3가지 값 모두 설정 필요:
//   - VITE_KAMIS_PROXY_URL (백엔드 프록시, CORS 우회용)
//   - VITE_KAMIS_CERT_ID   (KAMIS 인증 ID)
//   - VITE_KAMIS_CERT_KEY  (KAMIS 인증 Key)
// 발급: https://www.kamis.or.kr → 마이페이지 → OpenAPI
const PROXY_URL = import.meta.env.VITE_KAMIS_PROXY_URL as string | undefined;
const CERT_KEY  = import.meta.env.VITE_KAMIS_CERT_KEY  as string | undefined;
const CERT_ID   = import.meta.env.VITE_KAMIS_CERT_ID   as string | undefined;

export const KAMIS_CONFIGURED = !!(PROXY_URL && CERT_KEY && CERT_ID);
export { GARAK_CONFIGURED };

const CACHE_KEY = 'hyangjae_kamis_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

interface CacheEntry {
  timestamp: number;
  data: CropPriceInfo;
}

type Cache = Record<string, CacheEntry>;

function loadCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 로컬 스토리지 용량 초과 시 무시
  }
}

/* ───────── 실제 KAMIS API 호출 (프록시 경유) ───────── */
async function fetchFromKamis(cropId: string, itemCode: string, cropName: string): Promise<CropPriceInfo> {
  if (!KAMIS_CONFIGURED) throw new Error('KAMIS_NOT_CONFIGURED');

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 프록시로 요청 → 프록시가 KAMIS 실제 API를 중계
  const url = new URL(PROXY_URL!);
  url.searchParams.set('action', 'periodProductList');
  url.searchParams.set('p_productclscode', '02');  // 02: 도매, 01: 소매
  url.searchParams.set('p_startday', thirtyDaysAgo);
  url.searchParams.set('p_endday', today);
  url.searchParams.set('p_itemcategorycode', itemCode.substring(0, 3));
  url.searchParams.set('p_itemcode', itemCode);
  url.searchParams.set('p_cert_key', CERT_KEY!);
  url.searchParams.set('p_cert_id', CERT_ID!);
  url.searchParams.set('p_returntype', 'json');

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`KAMIS API ${res.status}`);

  const json = await res.json() as {
    data?: {
      item?: Array<{ yyyy: string; regday: string; price: string }>;
    };
  };

  const items = json.data?.item ?? [];
  const history: PriceData[] = items.map(it => ({
    date: `${it.yyyy}-${it.regday.replace('/', '-')}`,
    wholesale: parseInt(it.price.replace(/,/g, '')) || 0,
    retail: Math.round((parseInt(it.price.replace(/,/g, '')) || 0) * 1.4),
  })).filter(d => d.wholesale > 0);

  if (history.length === 0) throw new Error('NO_DATA');

  const latest = history[history.length - 1];
  return {
    cropId,
    cropName,
    kamisItemCode: itemCode,
    latestPrice: latest,
    history,
    source: 'kamis',
    updatedAt: new Date().toISOString(),
  };
}

/* ───────── 목업 데이터 생성 ─────────
 * 2025년 기준 현실적 도매 평균가 (가락시장 + KAMIS 평균)
 * 출처: KAMIS 2025-2026 연간 평균 시세
 */
const CROP_BASE_PRICES: Record<string, { name: string; code: string; base: number; vol: number }> = {
  // id: { 품목명, KAMIS 코드, 기준가(원/kg), 변동성(%)}
  'lettuce':       { name: '상추',       code: '214001', base: 9500,  vol: 0.35 },
  'kale':          { name: '케일',       code: '214009', base: 12000, vol: 0.20 },
  'spinach':       { name: '시금치',     code: '214006', base: 6500,  vol: 0.40 },
  'perilla':       { name: '깻잎',       code: '214015', base: 13000, vol: 0.25 },
  'tomato':        { name: '토마토',     code: '225101', base: 4800,  vol: 0.25 },
  'strawberry':    { name: '딸기',       code: '226101', base: 18500, vol: 0.30 },
  'pepper':        { name: '파프리카',   code: '225203', base: 7800,  vol: 0.20 },
  'cucumber':      { name: '오이',       code: '225201', base: 3900,  vol: 0.30 },
  'cherry-tomato': { name: '방울토마토', code: '225102', base: 9200,  vol: 0.22 },
  'radish':        { name: '무',         code: '211301', base: 2800,  vol: 0.30 },
  'carrot':        { name: '당근',       code: '211401', base: 4200,  vol: 0.25 },
  'wasabi':        { name: '고추냉이',   code: '999901', base: 85000, vol: 0.10 }, // 국내 유통량 적어 KAMIS 미등재 → 전문 시세
  'basil':         { name: '바질',       code: '999902', base: 38000, vol: 0.15 },
  'mint':          { name: '민트',       code: '999903', base: 32000, vol: 0.15 },
};

/**
 * 시드 기반 난수로 일관된 30일 시세 생성
 * 같은 날짜에 같은 작물은 항상 동일한 값이 나오도록 (캐시 안정성)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateMockHistory(cropId: string): CropPriceInfo {
  const info = CROP_BASE_PRICES[cropId];
  if (!info) throw new Error(`Unknown crop: ${cropId}`);

  const seedBase = cropId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const history: PriceData[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 월별 계절 변동 추가 (사인파)
    const month = date.getMonth();
    const seasonal = Math.sin((month / 12) * Math.PI * 2) * 0.1;

    // 일별 랜덤 변동
    const daySeed = seedBase + date.getTime() / (1000 * 60 * 60 * 24);
    const noise = (seededRandom(daySeed) - 0.5) * info.vol;

    const wholesale = Math.round(info.base * (1 + seasonal + noise));
    const retail    = Math.round(wholesale * 1.45);
    const auction   = Math.round(wholesale * 0.95);

    history.push({ date: dateStr, wholesale, retail, auction });
  }

  return {
    cropId,
    cropName: info.name,
    kamisItemCode: info.code,
    latestPrice: history[history.length - 1],
    history,
    source: 'mock',
    updatedAt: new Date().toISOString(),
  };
}

/* ───────── Public API ───────── */

/**
 * 작물의 최신 가격 + 30일 이력 조회
 * 실제 KAMIS → 실패 시 목업 데이터
 * 24시간 캐시 자동 적용
 */
export async function getCropPrice(cropId: string): Promise<CropPriceInfo> {
  const cache = loadCache();
  const cached = cache[cropId];
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const info = CROP_BASE_PRICES[cropId];
  if (!info) throw new Error(`Unknown crop: ${cropId}`);

  let data: CropPriceInfo;
  try {
    if (GARAK_CONFIGURED) {
      // 1순위: 가락시장 직접 OpenAPI (서울특별시농수산식품공사)
      const history = await fetchGarakPriceHistory(cropId);
      if (history.length === 0) throw new Error('GARAK_EMPTY');
      data = {
        cropId,
        cropName: info.name,
        kamisItemCode: info.code,
        latestPrice: history[history.length - 1],
        history,
        source: 'garak',
        updatedAt: new Date().toISOString(),
      };
    } else if (KAMIS_CONFIGURED) {
      // 2순위: KAMIS (한국농수산식품유통공사) 프록시
      data = await fetchFromKamis(cropId, info.code, info.name);
    } else {
      throw new Error('NO_API_CONFIGURED');
    }
  } catch (err) {
    // 실제 API 실패 → 목업 fallback (개발 중에도 화면이 끊기지 않도록)
    if (import.meta.env.DEV) {
      console.warn(`[price] ${cropId} 실연동 실패 → mock fallback`, err);
    }
    data = generateMockHistory(cropId);
  }

  cache[cropId] = { timestamp: now, data };
  saveCache(cache);
  return data;
}

/** 여러 작물 동시 조회 */
export async function getMultipleCropPrices(cropIds: string[]): Promise<CropPriceInfo[]> {
  return Promise.all(cropIds.map(id => getCropPrice(id)));
}

/** 캐시 수동 초기화 (관리자 페이지 등에서 "새로고침" 용) */
export function clearPriceCache() {
  localStorage.removeItem(CACHE_KEY);
}

/** 지원하는 모든 작물 ID 목록 */
export function getSupportedCropIds(): string[] {
  return Object.keys(CROP_BASE_PRICES);
}

/** 작물 기본 정보 */
export function getCropBaseInfo(cropId: string) {
  return CROP_BASE_PRICES[cropId];
}
