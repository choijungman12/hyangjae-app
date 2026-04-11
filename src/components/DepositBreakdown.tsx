interface DepositBreakdownProps {
  total: number;
  deposit: number;
  remainder: number;
  className?: string;
}

export default function DepositBreakdown({ total, deposit, remainder, className = '' }: DepositBreakdownProps) {
  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-center justify-between py-2">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">총 금액</span>
        <span key={`deposit-total-${total}`} translate="no" className="text-sm font-black text-gray-900 dark:text-gray-100">
          {total.toLocaleString()}원
        </span>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-emerald-500 rounded-md px-1.5 py-0.5" translate="no">
            N
          </span>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">예약금 (30%)</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">네이버페이 결제</p>
          </div>
        </div>
        <span key={`deposit-${deposit}`} translate="no" className="text-sm font-black text-emerald-600 dark:text-emerald-400">
          {deposit.toLocaleString()}원
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <i className="ri-bank-card-line text-lg text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">현장 결제</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">카드·현금·페이</p>
          </div>
        </div>
        <span key={`remainder-${remainder}`} translate="no" className="text-sm font-black text-gray-700 dark:text-gray-200">
          {remainder.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
