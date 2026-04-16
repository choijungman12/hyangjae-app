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
  scientificName: string;
  family: string;
  probability: number;
  description: string;
  imageUrl: string;
  commonNames: string[];
  allResults: { name: string; score: number; family: string; commonNames: string[] }[];
  source: 'plantnet' | 'color-fallback';
}

export interface PlantDisease {
  name: string;
  probability: number;
  description: string;
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
        scientificName: '잎·꽃·줄기가 선명하게 보이도록 더 가까이 촬영해 주세요',
        family: '—',
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
    const familyName = species.family?.scientificNameWithoutAuthor || '—';
    const imageUrl = best.images?.[0]?.url?.s || '';

    // 상위 5개 후보
    const allResults = results.slice(0, 5).map((r: any) => ({
      name: r.species?.scientificNameWithoutAuthor || '—',
      score: r.score || 0,
      family: r.species?.family?.scientificNameWithoutAuthor || '—',
      commonNames: r.species?.commonNames || [],
    }));

    return {
      success: true,
      name: commonNames[0] || species.scientificNameWithoutAuthor || '미확인 식물',
      scientificName: species.scientificNameWithoutAuthor || '—',
      family: familyName,
      probability: best.score || 0,
      description: `${species.scientificNameWithoutAuthor} (${familyName}과) · 신뢰도 ${(best.score * 100).toFixed(1)}%`,
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
    scientificName: reason,
    family: '—',
    probability: 0,
    description: '네트워크를 확인해 주세요. 색상 기반 분석으로 대체합니다.',
    imageUrl: '',
    commonNames: [],
    allResults: [],
    source: 'color-fallback',
  };
}
