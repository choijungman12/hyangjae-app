import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import StampBoard from '@/components/StampBoard';
import StampRewardModal from '@/components/StampRewardModal';
import { AUTH_KEY, UserInfo } from '@/pages/login/page';
import {
  loadStamps,
  addStamp,
  daysUntilExpiry,
  StampState,
  Reward,
} from '@/lib/stampStore';

type BookingStatus = 'confirmed' | 'done' | 'cancelled';
type Booking = {
  id: number;
  type: string;
  date: string;
  time: string;
  guests: number;
  price: number;
  status: BookingStatus;
};

const INITIAL_BOOKING_HISTORY: Booking[] = [
  { id: 1, type: '3번 스마트팜 체험 데크 · 6인 + 불멍', date: '2026-04-13', time: '18:30', guests: 6, price: 229000, status: 'confirmed' },
  { id: 2, type: '메인 하우스 심화 투어', date: '2026-04-13', time: '15:00', guests: 2, price: 30000, status: 'confirmed' },
  { id: 3, type: '5번 스마트팜 체험 데크 · 8인', date: '2026-03-20', time: '11:00', guests: 4, price: 139000, status: 'done' },
];

// 환불 정책: 2일 전 100%, 1일 전 50%, 당일/이후 0%
function calcRefund(bookingDate: string, price: number): { rate: number; amount: number; label: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(bookingDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 2) return { rate: 100, amount: price, label: '무료 취소' };
  if (diffDays === 1) return { rate: 50, amount: Math.floor(price / 2), label: '50% 환불' };
  return { rate: 0, amount: 0, label: '환불 불가' };
}

const MENU_ITEMS = [
  { icon: 'ri-calendar-check-line',  label: '예약 내역',       to: '/booking',             badge: null },
  { icon: 'ri-heart-line',           label: '관심 작물',       to: '/cultivation-calendar', badge: null },
  { icon: 'ri-book-open-line',       label: '재배 가이드',     to: '/growing-guide?id=wasabi', badge: null },
  { icon: 'ri-calendar-line',        label: '재배 일지',       to: '/farm-calendar-memo',  badge: null },
  { icon: 'ri-task-line',            label: '작업 스케줄',     to: '/task-calendar',       badge: null },
  { icon: 'ri-remote-control-line',  label: '장비 제어',       to: '/device-control',      badge: 'NEW' },
  { icon: 'ri-map-pin-line',         label: '오시는 길',       to: '/map',                 badge: null },
  { icon: 'ri-customer-service-line',label: 'AI 상담',         to: '/ai-consultant',       badge: null },
  { icon: 'ri-notification-line',    label: '알림 설정',       to: '/task-reminders',      badge: null },
  { icon: 'ri-shield-check-line',    label: '개인정보 처리방침', to: '/',                    badge: null },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKING_HISTORY);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [stampState, setStampState] = useState<StampState | null>(null);
  const [earnedReward, setEarnedReward] = useState<Reward | null>(null);

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    setBookings(prev => prev.map(b => (b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b)));
    setCancelTarget(null);
  };

  /** 테스트용: 예약 상태를 'done'으로 변경하면 스탬프 자동 적립 */
  const handleMarkAsDone = (booking: Booking) => {
    if (!user) return;
    setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, status: 'done' } : b)));
    const result = addStamp(user.email || user.name, booking.id);
    setStampState(result.state);
    if (result.newReward) {
      setEarnedReward(result.newReward);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // 로그인 후 기존 'done' 예약을 스탬프에 자동 반영 (중복 방지)
  useEffect(() => {
    if (!user) return;
    const userId = user.email || user.name;
    let current = loadStamps(userId);
    let lastReward: Reward | null = null;
    bookings
      .filter(b => b.status === 'done')
      .forEach(b => {
        const result = addStamp(userId, b.id);
        current = result.state;
        if (result.newReward) lastReward = result.newReward;
      });
    setStampState(current);
    if (lastReward) setEarnedReward(lastReward);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const availableRewards = useMemo(
    () => (stampState?.rewards ?? []).filter(r => r.status === 'available'),
    [stampState],
  );

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center pb-20 px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center">
            <i className="ri-user-line text-4xl text-gray-400" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-500">예약 내역, 관심 작물 등 다양한 서비스를<br />이용하려면 로그인해 주세요.</p>
        </div>
        <Link
          to="/login"
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <svg width="20" height="18" viewBox="0 0 22 20" fill="none">
            <path d="M11 0C4.925 0 0 3.9 0 8.714c0 3.1 2.025 5.834 5.1 7.378l-1.3 4.783c-.113.413.35.742.713.493L10.225 17.8c.258.017.516.026.775.026C17.075 17.826 22 13.926 22 8.714 22 3.9 17.075 0 11 0Z" fill="#191919"/>
          </svg>
          카카오로 로그인
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">마이페이지</h1>
          <Link to="/booking" className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all">
            <i className="ri-calendar-line text-emerald-600 text-xl" />
          </Link>
        </div>
      </header>

      {/* 프로필 카드 */}
      <section className="px-4 pt-6 pb-5">
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl flex-shrink-0">
              {user.loginType === 'kakao' ? (
                <svg width="30" height="27" viewBox="0 0 22 20" fill="none">
                  <path d="M11 0C4.925 0 0 3.9 0 8.714c0 3.1 2.025 5.834 5.1 7.378l-1.3 4.783c-.113.413.35.742.713.493L10.225 17.8c.258.017.516.026.775.026C17.075 17.826 22 13.926 22 8.714 22 3.9 17.075 0 11 0Z" fill="white"/>
                </svg>
              ) : (
                <i className="ri-user-line text-3xl text-white" />
              )}
            </div>
            <div>
              <p className="text-lg font-black">{user.name}</p>
              {user.email && <p className="text-sm text-white/70 font-medium">{user.email}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${user.loginType === 'kakao' ? 'bg-[#FEE500] text-[#191919]' : 'bg-white/20 text-white'}`}>
                  {user.loginType === 'kakao' ? '카카오' : '게스트'}
                </span>
                <span className="text-[10px] text-white/60 font-medium">가입일: {user.joinedAt}</span>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="relative z-10 grid grid-cols-3 gap-2 mt-5">
            {[
              { label: '예약 횟수', value: `${bookings.length}건`, icon: 'ri-calendar-check-line' },
              { label: '스탬프', value: `${stampState?.total ?? 0}개`, icon: 'ri-seedling-line' },
              { label: '보유 쿠폰', value: `${availableRewards.length}장`, icon: 'ri-coupon-3-line' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className={`${stat.icon} text-lg mb-0.5`} />
                <p key={`${stat.label}-${stat.value}`} translate="no" className="text-sm font-black">{stat.value}</p>
                <p className="text-[10px] text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 스탬프판 (Sprint-02) */}
      <section className="px-4 pb-5">
        <StampBoard
          current={stampState?.current ?? 0}
          total={stampState?.total ?? 0}
        />
      </section>

      {/* 내 쿠폰함 (Sprint-02) */}
      {availableRewards.length > 0 && (
        <section className="px-4 pb-5">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-gray-100">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <i className="ri-coupon-3-fill text-white" />
              </div>
              <h3 className="text-sm font-black text-gray-900">내 쿠폰함</h3>
              <span className="ml-auto text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" translate="no">
                {availableRewards.length}장
              </span>
            </div>
            <div className="p-4 space-y-2">
              {availableRewards.map(reward => {
                const dday = daysUntilExpiry(reward);
                const expiresLabel = new Date(reward.expiresAt).toISOString().slice(0, 10);
                return (
                  <div
                    key={reward.id}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <div className="text-3xl" aria-hidden="true">🎁</div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">향재원 고추냉이 선물 세트</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">스탬프 10개 달성 리워드</p>
                      <p className="text-[10px] text-amber-700 font-bold mt-1" translate="no">
                        유효기간: ~{expiresLabel} (D-{Math.max(0, dday)})
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full self-start">
                      사용 가능
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 예약 내역 */}
      <section className="px-4 pb-5">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <i className="ri-calendar-check-line text-white" />
              </div>
              <h3 className="text-sm font-black text-gray-900">예약 내역</h3>
            </div>
            <Link to="/booking" className="text-xs font-black text-emerald-600 flex items-center gap-1">
              전체 보기 <i className="ri-arrow-right-s-line" />
            </Link>
          </div>
          {/* 환불 정책 안내 배너 */}
          <div className="mx-5 mt-4 mb-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-amber-600 text-base mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-black text-amber-900 mb-1">예약 취소 · 환불 정책</p>
                <ul className="text-[10px] text-amber-800 leading-relaxed space-y-0.5">
                  <li>· 이용 2일 전까지: <span className="font-black">100% 무료 취소</span></li>
                  <li>· 이용 1일 전: <span className="font-black">50% 환불</span></li>
                  <li>· 당일 취소: <span className="font-black">환불 불가</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 mt-3">
            {bookings.map(b => {
              const isConfirmed = b.status === 'confirmed';
              const statusStyle =
                b.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : b.status === 'cancelled'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-500';
              const statusLabel =
                b.status === 'confirmed' ? '예약 확정' : b.status === 'cancelled' ? '취소됨' : '이용 완료';
              return (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isConfirmed ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                      <i className={`ri-calendar-line ${isConfirmed ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{b.type}</p>
                      <p className="text-[11px] text-gray-500">{b.date} {b.time} · {b.guests}명</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p key={`price-${b.id}`} translate="no" className="text-xs font-black text-gray-900">
                        {b.price.toLocaleString()}원
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  {isConfirmed && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkAsDone(b)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all"
                        title="테스트용: 이용 완료 처리하여 스탬프 적립"
                      >
                        이용 완료 처리
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelTarget(b)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                      >
                        예약 취소
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 메뉴 목록 */}
      <section className="px-4 pb-5">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {MENU_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-emerald-600 text-lg`} />
              </div>
              <span className="text-sm font-bold text-gray-800 flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
              <i className="ri-arrow-right-s-line text-gray-400" />
            </Link>
          ))}
        </div>
      </section>

      {/* 로그아웃 */}
      <section className="px-4 pb-6">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-100 text-red-500 font-black text-sm hover:bg-red-50 transition-all"
        >
          <i className="ri-logout-box-line" />
          로그아웃
        </button>
      </section>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-6" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                <i className="ri-logout-box-line text-3xl text-red-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1">로그아웃</h3>
              <p className="text-xs text-gray-500">정말 로그아웃 하시겠습니까?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-black text-sm text-gray-600 hover:bg-gray-50 transition-all">취소</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-500 font-black text-sm text-white hover:bg-red-600 transition-all shadow-lg">로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 취소 확인 모달 */}
      {cancelTarget && (() => {
        const refund = calcRefund(cancelTarget.date, cancelTarget.price);
        const refundable = refund.rate > 0;
        return (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            onClick={() => setCancelTarget(null)}
          >
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                  <i className="ri-close-circle-line text-3xl text-red-500" />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">예약을 취소하시겠습니까?</h3>
                <p className="text-xs text-gray-500">아래 환불 금액을 확인해 주세요.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] text-gray-500 font-bold">예약</span>
                  <span className="text-[11px] font-black text-gray-900 text-right flex-1">{cancelTarget.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500 font-bold">이용일</span>
                  <span className="text-[11px] font-black text-gray-900">{cancelTarget.date} {cancelTarget.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-500 font-bold">결제 금액</span>
                  <span key={`paid-${cancelTarget.id}`} translate="no" className="text-[11px] font-black text-gray-900">
                    {cancelTarget.price.toLocaleString()}원
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-700 font-black">환불 금액 ({refund.label})</span>
                  <span
                    key={`refund-${cancelTarget.id}`}
                    translate="no"
                    className={`text-sm font-black ${refundable ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {refund.amount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {!refundable && (
                <p className="text-[11px] text-red-500 font-bold text-center mb-3">
                  당일 취소는 환불이 불가합니다.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-black text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                  돌아가기
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 py-3 rounded-xl bg-red-500 font-black text-sm text-white hover:bg-red-600 transition-all shadow-lg"
                >
                  취소 확정
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 스탬프 10개 달성 축하 모달 (Sprint-02) */}
      <StampRewardModal
        open={!!earnedReward}
        reward={earnedReward}
        onClose={() => setEarnedReward(null)}
      />

      <BottomNav />
    </div>
  );
}
