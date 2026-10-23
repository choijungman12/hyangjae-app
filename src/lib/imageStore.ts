/**
 * 앱 내 커스텀 이미지 저장소
 *
 * 관리자 페이지에서 업로드한 이미지를 localStorage에 base64로 저장하고,
 * 다른 페이지에서 키로 조회해서 사용합니다.
 *
 * ❗ 업로드 이미지 가이드
 *   향재원은 농산물 생산 시설입니다. 야영·숙박·취식을 연상시키는 사진
 *   (텐트 내부 침구, 화로대, 수영장, 차려진 상차림, 카페·휴게 공간 등)은 올리지 마세요.
 *   재배 베드 · 작물 · 온실 설비 · 노지 조경수 사진을 사용합니다.
 *
 * 저장 가능한 이미지 키 목록:
 *   ❗ 아래 키는 **모두 화면에 실제로 반영되는 슬롯**입니다.
 *     소비처 없는 키를 추가하면 올려도 아무 변화가 없어 혼란만 생깁니다.
 *     키를 늘릴 때는 반드시 렌더링하는 곳을 함께 만드세요.
 *
 *   ── 홈 ──
 *   - hero-slide-1 : 홈 히어로 배경 (미업로드 시 메시 그라디언트)
 *
 *   ── 재배 구역 대표 이미지 ──
 *   - facility-greenhouse-thumb : 고추냉이 수경 온실  → /wasabi 히어로
 *   - facility-house-thumb      : 유러피안 재배동     → /houses 히어로
 *   - facility-field-thumb      : 노지 과수·조경수     → /field 히어로
 *
 *   ── 치유농업 프로그램 (업로드 전에는 SVG 일러스트가 대신 표시됩니다) ──
 *   - care-worker : 흙 만지는 주말 (직장인)
 *   - care-senior : 손끝 텃밭 (시니어)
 *   - care-kids   : 흙 없는 농장 교실 (초·중학생)
 *   - care-family : 마루의 하루 (가족)
 *   - care-public : 공익형 치유 프로그램 (복지·장애인기관)
 *
 *   ── 브랜드 ──
 *   - mascot-maru    : 마스코트 마루 일러스트
 *   - store-products : 고추냉이 가공품 (제품 단독 촬영)  → 홈 제품 카드
 *
 * ❗ 치유농업 사진에는 참여자의 얼굴이 식별되지 않도록 하고,
 *    촬영·게시 동의를 받은 사진만 업로드하세요.
 */

const STORE_KEY = 'hyangjae_custom_images';
const MAX_WIDTH = 1280; // 원본이 너무 크면 리사이즈 (용량 절감)
const JPEG_QUALITY = 0.85;

export type ImageKey =
  // 홈 히어로 배경
  | 'hero-slide-1'
  // 재배 구역 대표 이미지 (각 구역 페이지 히어로)
  | 'facility-greenhouse-thumb'
  | 'facility-house-thumb'
  | 'facility-field-thumb'
  // 치유농업 프로그램 (미업로드 시 SVG 일러스트로 대체)
  | 'care-worker'
  | 'care-senior'
  | 'care-kids'
  | 'care-family'
  | 'care-public'
  // 브랜드 · 제품
  | 'mascot-maru'
  | 'store-products';

type ImageStore = Record<string, string>;

function load(): ImageStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(store: ImageStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('hyangjae-image-updated'));
  } catch (err) {
    console.error('이미지 저장 실패 (localStorage 용량 초과 가능)', err);
    throw new Error('저장 공간이 부족합니다. 더 작은 이미지를 올려주세요.');
  }
}

/** 파일을 리사이즈 + base64 변환 후 저장 */
export async function saveImage(key: ImageKey, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('10MB 이하 이미지만 업로드할 수 있습니다.');
  }

  const dataUrl = await resizeAndEncode(file);
  const store = load();
  store[key] = dataUrl;
  save(store);
  return dataUrl;
}

/** 저장된 이미지 조회. 없으면 null */
export function getImage(key: ImageKey): string | null {
  const store = load();
  return store[key] ?? null;
}

/** 저장된 이미지가 있으면 사용, 없으면 fallback 경로 반환 */
export function getImageOrFallback(key: ImageKey, fallback: string): string {
  return getImage(key) ?? fallback;
}

/** 삭제 */
export function removeImage(key: ImageKey) {
  const store = load();
  delete store[key];
  save(store);
}

/** 전체 저장 용량 (KB) */
export function getStoreSize(): number {
  const raw = localStorage.getItem(STORE_KEY) ?? '';
  return Math.round(new Blob([raw]).size / 1024);
}

/* ── 리사이즈 로직 ── */
function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지 디코딩 실패'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((MAX_WIDTH / width) * height);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas context 생성 실패'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
