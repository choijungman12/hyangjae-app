/**
 * KAMIS OpenAPI 프록시 (Vercel Serverless Function)
 *
 * 브라우저에서 직접 KAMIS API 를 호출하면 CORS 차단으로 실패하므로,
 * 같은 도메인 `/api/kamis` 로 요청을 받아 KAMIS 로 중계한다.
 *
 * 호출 예:
 *   /api/kamis?action=periodProductList
 *     &p_productclscode=02
 *     &p_startday=2026-03-15&p_endday=2026-04-14
 *     &p_itemcategorycode=214&p_itemcode=214001
 *     &p_returntype=json
 *
 * 인증값(p_cert_id, p_cert_key)은 클라이언트가 보낸 값을 그대로 통과시킨다.
 * 향후 보안 강화 시 환경변수(KAMIS_CERT_ID/KEY)로 서버에서 주입하도록 변경 가능.
 */

export const config = { runtime: 'edge' };

const KAMIS_BASE = 'https://www.kamis.or.kr/service/price/xml.do';

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const incoming = new URL(req.url);
    const target = new URL(KAMIS_BASE);
    incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));

    if (!target.searchParams.has('p_returntype')) {
      target.searchParams.set('p_returntype', 'json');
    }

    const upstream = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'PROXY_FAILED', message: String(err) }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
