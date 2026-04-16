/**
 * Perenual Plant Identification API 연동
 *
 * 식물 이미지 → 식물명·학명·관리법·성장단계·사진 반환
 * API Key: SK-P4DJ69E08CB328db716470
 * 문서: https://perenual.com/docs/identify/api
 */

const API_KEY = 'SK-P4DJ69E08CB328db716470';
const API_URL = 'https://perenual.com/api/v2/species-identify';

export const PLANT_ID_CONFIGURED = true;

export interface PlantIdResult {
  success: boolean;
  name: string;
  scientificName: string;
  family: string;
  probability: number;
  description: string;
  imageUrl: string;
  careGuideUrl: string;
  detailsUrl: string;
  diseases: PlantDisease[];
  source: 'perenual' | 'color-fallback';
}

export interface PlantDisease {
  name: string;
  probability: number;
  description: string;
}

/**
 * 이미지를 Perenual API로 전송하여 식물 식별
 */
export async function identifyPlant(imageBase64: string): Promise<PlantIdResult> {
  try {
    // base64 → Blob → FormData
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const byteChars = atob(base64Data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('images', blob, 'plant.jpg');

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Perenual API error:', response.status);
      return colorFallback();
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result || result.score < 0.1) {
      return {
        success: false,
        name: '식물을 식별할 수 없습니다',
        scientificName: '더 가까이서 잎·꽃·줄기가 보이도록 촬영해 주세요',
        family: '—',
        probability: 0,
        description: '이미지가 불명확하거나 식물이 아닌 것으로 보입니다.',
        imageUrl: '',
        careGuideUrl: '',
        detailsUrl: '',
        diseases: [],
        source: 'perenual',
      };
    }

    return {
      success: true,
      name: result.name || '미확인 식물',
      scientificName: result.scientific_name || result.name || '—',
      family: '—',
      probability: result.score || 0,
      description: `${result.name} 식물이 감지되었습니다. 신뢰도 ${(result.score * 100).toFixed(1)}%`,
      imageUrl: result.default_image?.thumbnail || result.default_image?.small_url || '',
      careGuideUrl: result.care_guides || result['care-guides'] || '',
      detailsUrl: result.details || '',
      diseases: [],
      source: 'perenual',
    };
  } catch (err) {
    console.error('Perenual API call failed:', err);
    return colorFallback();
  }
}

function colorFallback(): PlantIdResult {
  return {
    success: false,
    name: 'API 연결 실패',
    scientificName: '네트워크 오류 — 색상 기반 분석으로 대체합니다',
    family: '—',
    probability: 0,
    description: '인터넷 연결을 확인해 주세요.',
    imageUrl: '',
    careGuideUrl: '',
    detailsUrl: '',
    diseases: [],
    source: 'color-fallback',
  };
}
