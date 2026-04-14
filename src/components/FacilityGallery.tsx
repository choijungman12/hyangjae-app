import { useEffect, useState, useCallback } from 'react';

interface FacilityGalleryProps {
  open: boolean;
  title: string;
  subtitle?: string;
  images: string[];
  onClose: () => void;
}

export default function FacilityGallery({ open, title, subtitle, images, onClose }: FacilityGalleryProps) {
  const [index, setIndex] = useState(0);

  const go = useCallback((delta: number) => {
    setIndex(prev => {
      const next = prev + delta;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose, go]);

  if (!open || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black animate-fadeIn flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 이미지 갤러리`}
    >
      {/* 상단 바 */}
      <header className="flex items-center justify-between px-5 py-4 text-white">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black truncate">{title}</h3>
          {subtitle && <p className="text-xs text-white/60 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <span className="text-xs font-bold text-white/80 mx-3" translate="no">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all active:scale-95"
          aria-label="갤러리 닫기"
        >
          <i className="ri-close-line text-xl" aria-hidden="true" />
        </button>
      </header>

      {/* 메인 이미지 */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <img
          src={images[index]}
          alt={`${title} ${index + 1}`}
          className="max-w-full max-h-full object-contain animate-fadeIn"
          key={images[index]}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="이전 이미지"
            >
              <i className="ri-arrow-left-s-line text-2xl" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="다음 이미지"
            >
              <i className="ri-arrow-right-s-line text-2xl" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* 하단 썸네일 스트립 */}
      {images.length > 1 && (
        <div className="px-5 py-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 justify-center">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  i === index ? 'border-white scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
                aria-label={`${i + 1}번째 이미지로 이동`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 배경 탭 닫기 (보이지 않는 영역) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 -z-10"
        aria-label="갤러리 닫기 (배경)"
        tabIndex={-1}
      />
    </div>
  );
}
