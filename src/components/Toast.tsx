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
    success: 'bg-emerald-500 text-white',
    error:   'bg-red-500 text-white',
    info:    'bg-gray-800 text-white',
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
