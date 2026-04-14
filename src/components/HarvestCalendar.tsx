import { HarvestMonth, SEASONAL_HARVEST } from '@/data/products';

interface HarvestCalendarProps {
  currentMonth: number; // 1 ~ 12
  className?: string;
}

const CROP_EMOJI: Record<string, string> = {
  딸기: '🍓',
  상추: '🥬',
  로메인: '🥬',
  깻잎: '🌿',
  양상추: '🥬',
};

function cropIcon(name: string): string {
  return CROP_EMOJI[name] ?? '🌱';
}

export default function HarvestCalendar({ currentMonth, className = '' }: HarvestCalendarProps) {
  const months: { month: number; data: HarvestMonth }[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    data: SEASONAL_HARVEST[i + 1],
  }));

  const current = SEASONAL_HARVEST[currentMonth];

  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <i className="ri-calendar-check-fill text-emerald-500 dark:text-emerald-400 text-xl" aria-hidden="true" />
        <h3 className="text-base font-black text-gray-900 dark:text-gray-100">월별 수확 달력</h3>
      </div>

      {current && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 mb-4 animate-harvest-glow">
          <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 mb-2" translate="no">
            {currentMonth}월 수확 작물
          </p>
          <div className="flex flex-wrap gap-2">
            {current.primary.map(crop => (
              <span
                key={`primary-${crop}`}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-xs font-black text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full shadow-sm border border-emerald-200 dark:border-emerald-700"
              >
                <span aria-hidden="true">{cropIcon(crop)}</span>
                {crop}
                <span className="text-[9px] font-black bg-emerald-500 text-white rounded px-1 ml-0.5">시즌</span>
              </span>
            ))}
            {current.rotation.map(crop => (
              <span
                key={`rotation-${crop}`}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <span aria-hidden="true">{cropIcon(crop)}</span>
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {months.map(({ month, data }) => {
          const isCurrent = month === currentMonth;
          const hasPrimary = data.primary.length > 0;
          return (
            <div
              key={month}
              className={`rounded-xl p-2 text-center transition-all ${
                isCurrent
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
              }`}
            >
              <p className="text-[10px] font-black" translate="no">
                {month}월
              </p>
              <p className="text-sm mt-0.5" aria-hidden="true">
                {hasPrimary ? '🍓' : '🥬'}
              </p>
              <p className={`text-[9px] mt-0.5 ${isCurrent ? 'text-white/90' : 'text-gray-400 dark:text-gray-500'}`}>
                {data.rotation.length}종
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><span aria-hidden="true">🍓</span> 딸기 시즌 (12~5월)</span>
        <span className="flex items-center gap-1"><span aria-hidden="true">🥬</span> 쌈채소 (연중)</span>
      </div>
    </div>
  );
}
