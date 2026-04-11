import { PartnerStore, PARTNER_CATEGORY_LABELS } from '@/data/products';

interface PartnerStoreCardProps {
  store: PartnerStore;
  className?: string;
}

export default function PartnerStoreCard({ store, className = '' }: PartnerStoreCardProps) {
  const cat = PARTNER_CATEGORY_LABELS[store.category];
  const badgeClass = store.confirmed
    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
    : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700';
  const badgeLabel = store.confirmed ? '제휴 완료' : '협의 중';

  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 ${
        store.confirmed ? '' : 'opacity-80'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
          <i className={`${cat.icon} text-white text-lg`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">{store.name}</p>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${badgeClass}`}>{badgeLabel}</span>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 font-bold">{cat.label}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <i className="ri-route-line" aria-hidden="true" />
              {store.distance}
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-time-line" aria-hidden="true" />
              배달 약 {store.deliveryTimeMin}분
            </span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{store.notes}</p>
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              translate="no"
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <i className="ri-phone-fill" aria-hidden="true" />
              {store.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
