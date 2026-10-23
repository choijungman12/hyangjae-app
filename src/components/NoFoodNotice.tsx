import { NO_FOOD_NOTICE } from '@/data/farmStory';

interface NoFoodNoticeProps {
  /**
   * banner — 한 줄 요약 배너 (홈 상단·지도 등 전역 노출용)
   * full   — 금지 항목 전체를 펼친 카드 (방문 안내·이용 가이드용)
   */
  variant?: 'banner' | 'full';
  className?: string;
}

/**
 * 취식 불가 공지.
 *
 * 향재원은 농산물 생산 구역이므로 숯불·도시락 등 모든 취식과 화기 사용,
 * 야영·공간대여가 불가합니다. 사이트에서 가장 오해가 잦은 지점이라
 * 홈 최상단과 방문 안내에 상시 노출합니다.
 */
export default function NoFoodNotice({ variant = 'banner', className = '' }: NoFoodNoticeProps) {
  if (variant === 'banner') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border border-red-200/80 dark:border-red-900/60
                    bg-gradient-to-br from-red-50 via-orange-50 to-red-50
                    dark:from-red-950/70 dark:via-orange-950/40 dark:to-red-950/70
                    p-4 shadow-depth-2 animate-alert-breathe grain ${className}`}
        role="note"
      >
        <div className="relative z-10 flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600
                          flex items-center justify-center shadow-depth-2">
            <i className="ri-error-warning-line text-2xl text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-red-800 dark:text-red-100 leading-snug">
              {NO_FOOD_NOTICE.headline}
            </p>
            <p className="mt-1 text-[11px] font-bold text-red-700/90 dark:text-red-200/90 leading-relaxed">
              숯불 · 바비큐 · 도시락 등 <b>모든 취식과 화기 사용 불가</b> · 야영 · 숙박 · 공간대여 운영 없음
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['숯불 불가', '도시락 불가', '음주 불가', '야영 불가', '공간대여 없음'].map(t => (
                <span key={t} className="chip-warn">
                  <i className="ri-close-circle-line text-[11px]" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-4xl border border-red-200/80 dark:border-red-900/60
                  bg-gradient-to-br from-red-50 via-white to-orange-50
                  dark:from-red-950/60 dark:via-gray-900 dark:to-orange-950/40
                  p-5 shadow-depth-3 grain ${className}`}
      aria-labelledby="no-food-heading"
    >
      <div className="orb -top-10 -right-8 w-40 h-40 bg-red-400/20" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip-warn">
            <i className="ri-information-line" aria-hidden="true" />
            필수 안내
          </span>
          <span className="text-[10px] font-bold text-red-600/80 dark:text-red-300/80">
            {NO_FOOD_NOTICE.sub}
          </span>
        </div>

        <h2 id="no-food-heading" className="text-xl font-black text-red-800 dark:text-red-50 leading-tight">
          {NO_FOOD_NOTICE.headline}
        </h2>

        <p className="mt-2 text-[13px] leading-relaxed text-red-900/80 dark:text-red-100/80 font-medium">
          {NO_FOOD_NOTICE.body}
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {NO_FOOD_NOTICE.forbidden.map(item => (
            <li
              key={item.label}
              className="relative rounded-2xl bg-white/80 dark:bg-gray-900/60 border border-red-100 dark:border-red-900/50
                         p-3 shadow-depth-1"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <i className={`${item.icon} text-base text-red-500`} aria-hidden="true" />
                <i className="ri-forbid-2-line text-[11px] text-red-400" aria-hidden="true" />
              </div>
              <p className="text-[11.5px] font-black text-gray-900 dark:text-gray-50 leading-tight">{item.label}</p>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] font-bold text-red-700 dark:text-red-200">
          <i className="ri-shield-check-line mt-0.5" aria-hidden="true" />
          <span>{NO_FOOD_NOTICE.reason}</span>
        </p>
      </div>
    </section>
  );
}
