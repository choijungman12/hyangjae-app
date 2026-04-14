interface ColkijeFreeBannerProps {
  className?: string;
}

export default function ColkijeFreeBanner({ className = '' }: ColkijeFreeBannerProps) {
  return (
    <div
      className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl shadow-xl p-4 animate-slideUp ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
          <i className="ri-restaurant-2-fill text-white text-2xl" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-black text-emerald-700 bg-white rounded-md">
              NEW
            </span>
            <p className="text-sm font-black text-white">콜키지 프리 · 외부 음식 전면 자유 반입</p>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed">
            모든 식재료·주류·음료 자유롭게 가져오세요. 추가 요금 없이, 고기 필요 시 파트너 정육점 배달도 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
