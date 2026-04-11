import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-emerald-500 dark:bg-emerald-600 text-white ring-1 ring-emerald-400/40 dark:ring-emerald-300/20',
    error:   'bg-red-500 dark:bg-red-600 text-white ring-1 ring-red-400/40 dark:ring-red-300/20',
    info:    'bg-gray-800 dark:bg-gray-700 text-white ring-1 ring-white/10',
  };

  const icons = {
    success: 'ri-checkbox-circle-line',
    error:   'ri-error-warning-line',
    info:    'ri-information-line',
  };

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-[90vw] animate-bounce-in ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <i className={`${icons[type]} text-lg`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
