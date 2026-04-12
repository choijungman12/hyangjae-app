import { useState, useEffect } from 'react';
import { getImage, type ImageKey } from '@/lib/imageStore';

/**
 * 관리자 페이지에서 업로드한 커스텀 이미지가 있으면 사용하고,
 * 없으면 fallback URL을 반환. 이미지 저장 이벤트에 반응해 자동 갱신.
 */
export function useCustomImage(key: ImageKey, fallback: string): string {
  const [src, setSrc] = useState<string>(() => getImage(key) ?? fallback);

  useEffect(() => {
    const update = () => setSrc(getImage(key) ?? fallback);
    update();
    window.addEventListener('hyangjae-image-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('hyangjae-image-updated', update);
      window.removeEventListener('storage', update);
    };
  }, [key, fallback]);

  return src;
}
