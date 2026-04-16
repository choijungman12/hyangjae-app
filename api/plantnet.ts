/**
 * PlantNet API 프록시 (Vercel Serverless Function)
 *
 * 브라우저에서 직접 PlantNet API 호출 시 CORS 차단 → 같은 도메인 /api/plantnet 으로 중계
 *
 * 호출: POST /api/plantnet   body: FormData { images: File }
 */

export const config = { runtime: 'edge' };

const PLANTNET_API = 'https://my-api.plantnet.org/v2/identify/all';
const API_KEY = '2b10bCzINx9zSmdtXNE9XxUUVO';

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const newForm = new FormData();

    // 이미지 파일 전달
    const images = formData.getAll('images');
    for (const img of images) {
      newForm.append('images', img);
    }

    const url = `${PLANTNET_API}?include-related-images=true&no-reject=true&lang=en&api-key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      body: newForm,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
