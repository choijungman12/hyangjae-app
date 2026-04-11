import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: 'ri-home-5', label: '홈', activeColor: 'text-emerald-600' },
  { to: '/smart-farm-data', icon: 'ri-dashboard-3', label: '데이터', activeColor: 'text-emerald-600' },
  { to: '/cultivation-calendar', icon: 'ri-calendar-check', label: '달력', activeColor: 'text-blue-600' },
  { to: '/profit-analysis', icon: 'ri-bar-chart-box', label: '수익분석', activeColor: 'text-purple-600' },
  { to: '/ai-consultant', icon: 'ri-robot', label: 'AI상담', activeColor: 'text-indigo-600' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 relative group"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/80 to-transparent" />
              )}
              <i
                className={`${item.icon}-${isActive ? 'fill' : 'line'} text-xl relative z-10 transition-all duration-300 ${
                  isActive ? item.activeColor : 'text-gray-400 group-hover:text-gray-600'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-xs relative z-10 transition-all duration-300 ${
                  isActive ? `font-bold ${item.activeColor}` : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
