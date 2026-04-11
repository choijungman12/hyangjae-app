import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { AUTH_KEY, UserInfo } from '@/pages/login/page';

const BOOKING_HISTORY = [
  { id: 1, type: '3번 글램핑 데크 · 8인 + 불멍', date: '2026-04-12', time: '18:30', guests: 6, price: 189000, status: 'confirmed' },
  { id: 2, type: '와사비 수확 체험', date: '2026-04-12', time: '15:00', guests: 2, price: 50000, status: 'confirmed' },
  { id: 3, type: '5번 글램핑 데크 · 8인', date: '2026-03-20', time: '11:00', guests: 4, price: 139000, status: 'done' },
];

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

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

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
              { label: '예약 횟수', value: BOOKING_HISTORY.length, icon: 'ri-calendar-check-line' },
              { label: '방문 체험', value: '1회', icon: 'ri-map-pin-line' },
              { label: '관심 작물', value: '3종', icon: 'ri-heart-line' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className={`${stat.icon} text-lg mb-0.5`} />
                <p className="text-sm font-black">{stat.value}</p>
                <p className="text-[10px] text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <div className="divide-y divide-gray-100">
            {BOOKING_HISTORY.map(b => (
              <div key={b.id} className="px-5 py-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${b.status === 'confirmed' ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                  <i className={`ri-calendar-line ${b.status === 'confirmed' ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 truncate">{b.type}</p>
                  <p className="text-[11px] text-gray-500">{b.date} {b.time} · {b.guests}명</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-gray-900">{b.price.toLocaleString()}원</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.status === 'confirmed' ? '예약 확정' : '이용 완료'}
                  </span>
                </div>
              </div>
            ))}
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

      <BottomNav />
    </div>
  );
}
