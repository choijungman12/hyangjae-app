/**
 * 앱 내 커스텀 이미지 저장소
 *
 * 관리자 페이지에서 업로드한 이미지를 localStorage에 base64로 저장하고,
 * 다른 페이지에서 키로 조회해서 사용합니다.
 *
 * 저장 가능한 이미지 키 목록:
 *   ── 홈 페이지 히어로 캐러셀 (메인 화면 자동 슬라이드) ──
 *   - hero-slide-1 ~ hero-slide-5 : 홈 히어로 슬라이드 5장
 *
 *   ── 예약 페이지 데크 캐러셀 (Apple 스타일 슬라이드) ──
 *   - deck-slide-1 ~ deck-slide-5 : 데크 히어로 슬라이드 5장
 *
 *   ── 시설 둘러보기 대표 썸네일 ──
 *   - facility-mainhouse-thumb : 메인 하우스 대표 썸네일
 *   - facility-store-thumb     : 향재원 매점 대표 썸네일
 *   - facility-deck-thumb      : 체험 데크 대표 썸네일
 *   - facility-site-thumb      : 전체 부지 대표 썸네일
 *
 *   ── (기존 · 호환성 유지) ──
 *   - glamping-outdoor : 스마트팜 체험 데크 외부 전경 (레거시 키)
 *   - glamping-interior: 스마트팜 체험 데크 내부 (레거시 키)
 *   - store-interior   : 향재원 매점 내부
 *   - store-products   : 매점 상품 진열대
 */

const STORE_KEY = 'hyangjae_custom_images';
const MAX_WIDTH = 1280; // 원본이 너무 크면 리사이즈 (용량 절감)
const JPEG_QUALITY = 0.85;

export type ImageKey =
  // 홈 히어로 캐러셀
  | 'hero-slide-1'
  | 'hero-slide-2'
  | 'hero-slide-3'
  | 'hero-slide-4'
  | 'hero-slide-5'
  // 예약 페이지 데크 캐러셀
  | 'deck-slide-1'
  | 'deck-slide-2'
  | 'deck-slide-3'
  | 'deck-slide-4'
  | 'deck-slide-5'
  // 시설 둘러보기 대표 썸네일
  | 'facility-mainhouse-thumb'
  | 'facility-store-thumb'
  | 'facility-deck-thumb'
  | 'facility-site-thumb'
  // 기존 호환
  | 'glamping-outdoor'
  | 'glamping-interior'
  | 'store-interior'
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
