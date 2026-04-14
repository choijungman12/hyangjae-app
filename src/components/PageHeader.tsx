import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightSlot?: React.ReactNode;
  subtitle?: string;
}

export default function PageHeader({ title, backTo = '/', rightSlot, subtitle }: PageHeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 theme-transition">
      <div className="px-4 py-4 flex items-center gap-3">
        <Link
          to={backTo}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="뒤로 가기"
        >
          <i className="ri-arrow-left-line text-xl text-gray-700 dark:text-gray-200" aria-hidden="true" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-50">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {rightSlot}
      </div>
    </header>
  );
}
