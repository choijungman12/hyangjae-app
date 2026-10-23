import { useCustomImage } from '@/hooks/useCustomImage';
import type { ImageKey } from '@/lib/imageStore';

interface UploadedHeroPhotoProps {
  imageKey: ImageKey;
  alt: string;
  /** 사진이 없을 때 대신 보여 줄 내용 (벡터 도해 등). 없으면 아무것도 렌더하지 않습니다. */
  fallback?: React.ReactNode;
  className?: string;
  /** 사진 위에 깔 그라디언트 오버레이 클래스 */
  overlayClassName?: string;
}

/**
 * 관리자가 `/admin/content` 에서 올린 실사진이 있으면 사진을, 없으면 fallback 을 보여 줍니다.
 *
 * 향재원은 검수되지 않은 시설 사진을 저장소에서 직접 참조하지 않습니다.
 * 야영·휴게를 연상시키는 이미지가 섞여 있기 때문입니다.
 * 그래서 평소에는 벡터 도해를 쓰고, 검수를 마친 사진만 업로드로 교체합니다.
 */
export default function UploadedHeroPhoto({
  imageKey,
  alt,
  fallback = null,
  className = '',
  overlayClassName = '',
}: UploadedHeroPhotoProps) {
  const src = useCustomImage(imageKey, '');

  if (!src) return <>{fallback}</>;

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      {overlayClassName && <span className={`absolute inset-0 ${overlayClassName}`} aria-hidden="true" />}
    </span>
  );
}
