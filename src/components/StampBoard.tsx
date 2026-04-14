import { STAMP_GOAL } from '@/lib/stampStore';

interface StampBoardProps {
  current: number;
  total: number;
  className?: string;
}

export default function StampBoard({ current, total, className = '' }: StampBoardProps) {
  const cells = Array.from({ length: STAMP_GOAL }, (_, i) => i < current);
  const progress = Math.min(100, Math.round((current / STAMP_GOAL) * 100));

  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-seedling-fill text-emerald-500 dark:text-emerald-400 text-xl" aria-hidden="true" />
            <h3 className="text-base font-black text-gray-900 dark:text-gray-100">향재원 스티커</h3>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            이용 완료 1건당 1개 · 요일·금액 무관
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">현재</p>
          <p key={`stamp-${current}`} translate="no" className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {current}
            <span className="text-sm text-gray-400 dark:text-gray-500">/{STAMP_GOAL}</span>
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-5 gap-3">
        {cells.map((filled, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full flex items-center justify-center transition-all ${
              filled
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg animate-stamp-pop'
                : 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40'
            }`}
            aria-label={filled ? `${i + 1}번째 스탬프 · 적립 완료` : `${i + 1}번째 스탬프 · 미적립`}
          >
            {filled ? (
              <i className="ri-seedling-fill text-white text-lg" aria-hidden="true" />
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs font-bold" aria-hidden="true">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-start gap-2">
        <i className="ri-gift-2-fill text-amber-500 dark:text-amber-400 text-lg mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100">
            10개 달성 시 향재원 고추냉이 선물 세트 🎁
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            쿠폰은 발급일로부터 6개월 유효 · 누적 {total}개
          </p>
        </div>
      </div>
    </div>
  );
}
