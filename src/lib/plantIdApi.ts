/**
 * Plant.id API 연동 — 식물 AI 식별
 *
 * 전 세계 46만종 식물 인식 · 잎 형태·줄기·꽃·열매·수피 분석
 * 무료: 200건/일 · https://plant.id/
 *
 * 환경 변수:
 *   VITE_PLANT_ID_API_KEY = Plant.id에서 발급받은 API Key
 *
 * 발급 방법:
 *   1. https://web.plant.id/ 접속 → Sign Up (무료)
 *   2. Dashboard → API Key 복사
 *   3. .env 파일에 VITE_PLANT_ID_API_KEY=발급받은키 추가
 */

const API_KEY = import.meta.env.VITE_PLANT_ID_API_KEY as string | undefined;
const API_URL = 'https://plant.id/api/v3/identification';

export const PLANT_ID_CONFIGURED = !!API_KEY;

export interface PlantIdResult {
  success: boolean;
  name: string;             // 한국어 또는 영어 일반명
  scientificName: string;   // 학명
  family: string;           // 과명
  probability: number;      // 신뢰도 (0~1)
  description: string;      // 설명
  similarImages: string[];  // 유사 이미지 URL
  isHealthy: boolean | null;
  diseases: PlantDisease[];
  source: 'plant-id' | 'color-fallback';
}

export interface PlantDisease {
  name: string;
  probability: number;
  description: string;
}

/**
 * 이미지를 Plant.id API로 전송하여 식물 식별
 * @param imageBase64 - base64 인코딩된 이미지 (data:image/... 포함)
 */
export async function identifyPlant(imageBase64: string): Promise<PlantIdResult> {
  if (!API_KEY) {
    return colorFallback();
  }

  try {
    // base64 에서 data:image/...;base64, 프리픽스 제거
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [base64Data],
        latitude: 37.4725,  // 양재동 좌표
        longitude: 127.0390,
        similar_images: true,
        health: 'all',
      }),
    });

    if (!response.ok) {
      console.error('Plant.id API error:', response.status);
      return colorFallback();
    }

    const data = await response.json();

    // 식물 분류 결과
    const suggestion = data.result?.classification?.suggestions?.[0];
    if (!suggestion) {
      return {
        success: false,
        name: '식물을 식별할 수 없습니다',
        scientificName: '더 가까이서 잎·꽃·줄기가 보이도록 촬영해 주세요',
        family: '—',
        probability: 0,
        description: '이미지가 불명확하거나 식물이 아닌 것으로 보입니다.',
        similarImages: [],
        isHealthy: null,
        diseases: [],
        source: 'plant-id',
      };
    }

    // 건강 상태 분석
    const healthResult = data.result?.disease?.suggestions || [];
    const diseases: PlantDisease[] = healthResult
      .filter((d: any) => d.probability > 0.1)
      .map((d: any) => ({
        name: d.name || '미확인 질병',
        probability: d.probability || 0,
        description: d.similar_images?.[0]?.citation || '상세 정보 없음',
      }));

    const isHealthy = data.result?.is_healthy?.binary ?? null;

    return {
      success: true,
      name: suggestion.name || '미확인 식물',
      scientificName: suggestion.name || '—',
      family: suggestion.details?.taxonomy?.family || '—',
      probability: suggestion.probability || 0,
      description: suggestion.details?.description?.value || `${suggestion.name} 식물이 감지되었습니다.`,
      similarImages: (suggestion.similar_images || []).map((img: any) => img.url).slice(0, 3),
      isHealthy,
      diseases,
      source: 'plant-id',
    };
  } catch (err) {
    console.error('Plant.id API call failed:', err);
    return colorFallback();
  }
}

function colorFallback(): PlantIdResult {
  return {
    success: false,
    name: 'API 키 미설정',
    scientificName: 'Plant.id API 키를 .env에 설정하면 46만종 식물 AI 식별이 가능합니다',
    family: '—',
    probability: 0,
    description: '현재는 색상 기반 분석만 제공됩니다. https://web.plant.id 에서 무료 API 키를 발급받으세요.',
    similarImages: [],
    isHealthy: null,
    diseases: [],
    source: 'color-fallback',
  };
}
