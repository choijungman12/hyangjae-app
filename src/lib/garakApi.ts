/**
 * 가락시장 경락 가격 정보 API 클라이언트
 *
 * 서울특별시농수산식품공사가 제공하는 가락도매시장 일자별·품목별 경락가
 * 데이터를 조회한다. 인증키는 UUID 형태(예: 9ff78c4b-...)로 발급된다.
 *
 * 발급처 후보 (둘 다 동일한 UUID 키 형태를 사용)
 *  (a) 공공데이터포털 data.go.kr
 *      - "서울특별시농수산식품공사_주요 품목 가격" (id 15004517)
 *      - "서울특별시농수산식품공사_경매결과"        (id 15076020)
 *      - 표준 base: http://apis.data.go.kr/B552895/...
 *      - 인증 파라미터: serviceKey
 *  (b) garak.co.kr 자체 OpenAPI (이메일 발급)
 *      - 인증 파라미터: id 또는 apiKey
 *
 * 발급 페이지에 표시되는 "샘플 호출 URL"을 그대로 .env 의 VITE_GARAK_API_URL 에
 * 붙여넣으면, 이 모듈은 그 base 위에 표준 파라미터(saleDate / pumName / 인증키)를
 * 덧붙여 호출한다.
 *
 * 환경 변수 (.env)
 *   VITE_GARAK_API_URL    = 발급처 샘플 호출 URL의 "?" 앞부분 (필수)
 *                           예) http://apis.data.go.kr/B552895/garakAptApi/getGarakAptList
 *   VITE_GARAK_API_KEY    = 발급된 UUID 인증키 (필수)
 *   VITE_GARAK_KEY_PARAM  = 인증키 파라미터 이름 (선택, 기본값 "serviceKey",
 *                           garak.co.kr 자체 키면 "id")
 *   VITE_GARAK_PROXY_URL  = CORS 우회용 프록시 prefix (선택)
 *
 * CORS
 *   data.go.kr 와 garak.co.kr 모두 브라우저 직접 호출 시 CORS 가 막힐 가능성이
 *   높다. 운영 환경에서는 Vercel/Netlify Serverless Function 에서 동일 URL 을
 *   re-fetch 하고, 그 프록시 주소를 VITE_GARAK_PROXY_URL 에 넣는다.
 *
 * 호출이 실패하면 호출자(`kamisApi.getCropPrice`)가 자동으로 mock 데이터로
 * fallback 한다.
 */

import type { PriceData } from './kamisApi';

const API_URL    = import.meta.env.VITE_GARAK_API_URL    as string | undefined;
const API_KEY    = import.meta.env.VITE_GARAK_API_KEY    as string | undefined;
const KEY_PARAM  = (import.meta.env.VITE_GARAK_KEY_PARAM as string | undefined) || 'serviceKey';
const PROXY_URL  = import.meta.env.VITE_GARAK_PROXY_URL  as string | undefined;

export const GARAK_CONFIGURED = !!(API_URL && API_KEY);

/* 가락시장에서 사용하는 표준 한글 품목명 매핑.
 * cropId(영문 키) → 가락시장 도매 품목명. 발급처가 다르면 코드 기반(pumCode)으로
 * 바꿀 수 있도록 PUM_CODE 도 함께 둔다. */
export const GARAK_PUM_NAME: Record<string, string> = {
  lettuce:        '상추',
  kale:           '케일',
  spinach:        '시금치',
  perilla:        '깻잎',
  tomato:         '토마토',
  strawberry:     '딸기',
  pepper:         '파프리카',
  cucumber:       '오이',
  'cherry-tomato':'방울토마토',
  radish:         '무',
  carrot:         '당근',
  wasabi:         '고추냉이',
  basil:          '바질',
  mint:           '민트',
};

function toYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function toIsoDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

/** API 응답에서 가격/날짜를 뽑는다. 발급처별 필드명이 다를 수 있어 방어적으로 처리. */
function pickPrice(it: Record<string, unknown>): number {
  const candidates = ['avgPrice', 'avg_price', 'price', 'rprc', 'aucngPrice', 'aucPrice', 'midPrice'];
  for (const k of candidates) {
    const v = it[k];
    if (v == null) continue;
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/,/g, ''), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function pickDate(it: Record<string, unknown>): string {
  const candidates = ['saleDate', 'sale_date', 'baseDate', 'stdDate', 'aucDate', 'delngDe'];
  for (const k of candidates) {
    const v = it[k];
    if (v == null) continue;
    const s = String(v).replace(/[-/]/g, '');
    if (/^\d{8}$/.test(s)) return toIsoDate(s);
  }
  return '';
}

/** 응답 JSON에서 item 배열을 꺼낸다. 가능한 경로를 모두 시도. */
function extractItems(json: unknown): Array<Record<string, unknown>> {
  if (!json || typeof json !== 'object') return [];
  const j = json as Record<string, unknown>;

  // data.go.kr 표준: { response: { body: { items: { item: [...] } } } }
  const resp = (j.response as Record<string, unknown> | undefined);
  const body = resp?.body as Record<string, unknown> | undefined;
  const items = body?.items;
  if (Array.isArray(items)) return items as Array<Record<string, unknown>>;
  if (items && typeof items === 'object') {
    const inner = (items as Record<string, unknown>).item;
    if (Array.isArray(inner)) return inner as Array<Record<string, unknown>>;
    if (inner && typeof inner === 'object') return [inner as Record<string, unknown>];
  }

  // garak.co.kr 자체: { data: [...] } 또는 { items: [...] } 또는 { list: [...] }
  for (const key of ['data', 'items', 'list', 'item', 'result']) {
    const v = j[key];
    if (Array.isArray(v)) return v as Array<Record<string, unknown>>;
  }

  return [];
}

/**
 * 단일 작물에 대해 최근 30일 가격 이력을 가져온다.
 * 성공 시 PriceData[] 반환, 실패 시 throw → 호출자가 mock fallback.
 */
export async function fetchGarakPriceHistory(cropId: string): Promise<PriceData[]> {
  if (!GARAK_CONFIGURED) throw new Error('GARAK_NOT_CONFIGURED');

  const pumName = GARAK_PUM_NAME[cropId];
  if (!pumName) throw new Error(`UNKNOWN_CROP:${cropId}`);

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 발급처가 기간 조회를 지원하면 한 번에 가져온다.
  const base = PROXY_URL
    ? `${PROXY_URL.replace(/\/$/, '')}/${API_URL!.replace(/^https?:\/\//, '')}`
    : API_URL!;

  const url = new URL(base);
  url.searchParams.set(KEY_PARAM, API_KEY!);
  url.searchParams.set('pumName', pumName);
  url.searchParams.set('startSaleDate', toYyyyMmDd(thirtyDaysAgo));
  url.searchParams.set('endSaleDate',   toYyyyMmDd(today));
  // 단일 일자 필드만 받는 발급처용
  url.searchParams.set('saleDate',      toYyyyMmDd(today));
  url.searchParams.set('numOfRows',     '100');
  url.searchParams.set('pageNo',        '1');
  url.searchParams.set('_type',         'json');
  url.searchParams.set('returnType',    'json');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`GARAK_HTTP_${res.status}`);

  const json = (await res.json()) as unknown;
  const items = extractItems(json);
  if (items.length === 0) throw new Error('GARAK_NO_DATA');

  // 일자별 평균 가격으로 집계
  const byDate = new Map<string, number[]>();
  for (const it of items) {
    const date = pickDate(it);
    const price = pickPrice(it);
    if (!date || price <= 0) continue;
    const arr = byDate.get(date) ?? [];
    arr.push(price);
    byDate.set(date, arr);
  }
  if (byDate.size === 0) throw new Error('GARAK_PARSE_FAIL');

  const history: PriceData[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => {
      const wholesale = Math.round(prices.reduce((s, n) => s + n, 0) / prices.length);
      return {
        date,
        wholesale,
        retail:   Math.round(wholesale * 1.45),
        auction:  wholesale,
      };
    });

  return history;
}
