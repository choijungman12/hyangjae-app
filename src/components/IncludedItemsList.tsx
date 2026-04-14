export interface IncludedItem {
  icon: string;          // emoji or remix class (prefix 'ri-')
  title: string;
  description?: string;
  highlight?: boolean;
}

interface IncludedItemsListProps {
  items: IncludedItem[];
  className?: string;
}

function isRemixIcon(icon: string): boolean {
  return icon.startsWith('ri-');
}

export default function IncludedItemsList({ items, className = '' }: IncludedItemsListProps) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, i) => (
        <li
          key={`${i}-${item.title}`}
          className={`flex items-start gap-3 p-3 rounded-2xl border ${
            item.highlight
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
              : 'bg-white/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              item.highlight
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
            }`}
          >
            {isRemixIcon(item.icon) ? (
              <i className={`${item.icon} text-lg ${item.highlight ? 'text-white' : 'text-gray-600 dark:text-gray-200'}`} aria-hidden="true" />
            ) : (
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black ${item.highlight ? 'text-emerald-800 dark:text-emerald-200' : 'text-gray-900 dark:text-gray-100'}`}>
              {item.title}
            </p>
            {item.description && (
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
