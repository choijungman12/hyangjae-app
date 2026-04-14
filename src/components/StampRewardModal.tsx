import { Reward, daysUntilExpiry } from '@/lib/stampStore';

interface StampRewardModalProps {
  open: boolean;
  reward: Reward | null;
  onClose: () => void;
  onViewCoupon?: () => void;
}

export default function StampRewardModal({ open, reward, onClose, onViewCoupon }: StampRewardModalProps) {
  if (!open || !reward) return null;

  const dday = daysUntilExpiry(reward);
  const expiresLabel = new Date(reward.expiresAt).toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="스탬프 보상 달성"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 px-6 pt-8 pb-6 text-center">
          <div className="text-6xl mb-3 animate-bounce-in" style={{ transform: 'translate(0,0)' }}>
            🎁
          </div>
          <p className="text-white/90 text-xs font-bold mb-1">스탬프 10개 달성!</p>
          <h3 className="text-white text-2xl font-black">축하합니다 🎉</h3>
        </div>

        <div className="p-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                <i className="ri-coupon-3-fill text-white text-2xl" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">발급 쿠폰</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100">
                  향재원 고추냉이 선물 세트
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1" translate="no">
                  유효기간: ~{expiresLabel} (D-{Math.max(0, dday)})
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 font-black text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              닫기
            </button>
            {onViewCoupon && (
              <button
                type="button"
                onClick={onViewCoupon}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-sm text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                쿠폰 확인하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
