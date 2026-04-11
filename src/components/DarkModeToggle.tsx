import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'hyangjae-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-pressed={isDark}
      translate="no"
      className={`relative w-14 h-8 rounded-full p-1 transition-all duration-500 shadow-inner
        hover:scale-105 active:scale-95
        ${isDark
          ? 'bg-gradient-to-r from-indigo-700 to-purple-800'
          : 'bg-gradient-to-r from-amber-300 to-orange-400'}
        ${className}`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg
          flex items-center justify-center transition-transform duration-500 ease-out
          ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
      >
        <i
          className={`text-sm transition-all duration-500 ${
            isDark ? 'ri-moon-clear-fill text-indigo-600' : 'ri-sun-fill text-orange-500 animate-pulse'
          }`}
          aria-hidden="true"
        />
      </span>
      <i
        className={`absolute top-1/2 -translate-y-1/2 left-2 ri-sun-line text-xs text-white/90 transition-opacity duration-300 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
      <i
        className={`absolute top-1/2 -translate-y-1/2 right-2 ri-moon-line text-xs text-white/90 transition-opacity duration-300 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
