import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ! 🔴 EDIT:ADMIN_PW ─ 관리자 비밀번호 변경 (운영 배포 전 반드시 변경)
const ADMIN_PASSWORD = 'hjangjae2027';
const ADMIN_KEY = 'hyangjae_admin_auth';

export function useAdminAuth() {
  const isAuth = () => localStorage.getItem(ADMIN_KEY) === 'true';
  const login = () => localStorage.setItem(ADMIN_KEY, 'true');
  const logout = () => localStorage.removeItem(ADMIN_KEY);
  return { isAuth, login, logout };
}

/* ── 더미 통계 ── */
const STATS = [
  { label: '총 회원', value: '127명', sub: '이번주 +8', icon: 'ri-group-line', grad: 'from-blue-500 to-indigo-600' },
  { label: '이번달 예약', value: '43건', sub: '전월 대비 +12%', icon: 'ri-calendar-check-line', grad: 'from-emerald-500 to-teal-600' },
  { label: '이번달 매출', value: '214만원', sub: '목표 대비 79%', icon: 'ri-money-dollar-circle-line', grad: 'from-purple-500 to-pink-600' },
  { label: '미확인 문의', value: '5건', sub: '즉시 처리 필요', icon: 'ri-chat-3-line', grad: 'from-orange-500 to-red-500' },
];

const RECENT_BOOKINGS = [
  { id: 'B2040', name: '김민준', type: '3번 데크 + 불멍',    date: '2026-04-12', status: 'confirmed', amount: 189000 },
  { id: 'B2039', name: '박지영', type: '와사비 수확 체험',    date: '2026-04-11', status: 'pending',   amount: 50000  },
  { id: 'B2038', name: '이서현', type: '7번 데크 + 숯불',    date: '2026-04-11', status: 'confirmed', amount: 179000 },
  { id: 'B2037', name: '정도현', type: '1번 데크',           date: '2026-04-10', status: 'done',      amount: 139000 },
  { id: 'B2036', name: '최수아', type: '스마트팜 투어',       date: '2026-04-10', status: 'confirmed', amount: 45000  },
];

const STATUS_META = {
  confirmed: { label: '확정', color: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: '대기', color: 'bg-amber-100 text-amber-700' },
  done:      { label: '완료', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-600' },
};

const QUICK_LINKS = [
  { label: '회원 관리', icon: 'ri-group-line', to: '/admin/members', color: 'from-blue-400 to-indigo-500' },
  { label: '예약 관리', icon: 'ri-calendar-2-line', to: '/admin/bookings', color: 'from-emerald-400 to-teal-500' },
  { label: '가격/메뉴', icon: 'ri-price-tag-3-line', to: '/admin/products', color: 'from-purple-400 to-pink-500' },
  { label: '콘텐츠 관리', icon: 'ri-image-edit-line', to: '/admin/content', color: 'from-orange-400 to-red-500' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuth, login, logout } = useAdminAuth();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => { setAuthed(isAuth()); }, []);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      login(); setAuthed(true); setPwError('');
    } else {
      setPwError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => { logout(); setAuthed(false); setShowLogout(false); };

  /* ── 로그인 화면 ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4">
              <i className="ri-shield-keyhole-line text-4xl text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">관리자 로그인</h2>
            <p className="text-sm text-gray-400">향재원 관리자 전용 페이지입니다</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-300 mb-2">관리자 비밀번호</label>
              <div className="relative">
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
                <i className="ri-lock-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            {pwError && <p className="text-xs text-red-400 font-bold text-center">{pwError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all"
            >
              관리자 입장
            </button>
            <Link to="/" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
              ← 앱으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── 대시보드 ── */
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 관리자 헤더 */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
            <i className="ri-home-line text-white text-lg" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">향재원 관리자</p>
            <p className="text-gray-400 text-[10px]">Admin Dashboard</p>
          </div>
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-bold transition-colors"
          >
            <i className="ri-logout-box-line" />
            로그아웃
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(stat => (
            <div key={stat.label} className={`relative bg-gradient-to-br ${stat.grad} rounded-2xl p-4 text-white shadow-lg overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-2.5">
                  <i className={`${stat.icon} text-sm`} />
                </div>
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 빠른 메뉴 */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-apps-line text-gray-500" />관리 메뉴
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md`}>
                  <i className={`${link.icon} text-white text-xl`} />
                </div>
                <span className="text-[10px] font-black text-gray-700 text-center leading-tight">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 예약 */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <i className="ri-calendar-line text-emerald-500" />최근 예약
            </h3>
            <Link to="/admin/bookings" className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
              전체 <i className="ri-arrow-right-s-line" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {RECENT_BOOKINGS.map(b => {
              const s = STATUS_META[b.status as keyof typeof STATUS_META];
              return (
                <div key={b.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-gray-500">{b.id.slice(-3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{b.name} · {b.type}</p>
                    <p className="text-[10px] text-gray-400">{b.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-gray-800">{b.amount.toLocaleString()}원</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 공지 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
          <i className="ri-information-line text-amber-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-900 mb-1">시스템 안내</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              이 관리자 페이지는 프로토타입입니다. 실제 운영 시 서버 연동이 필요합니다.
              현재 데이터는 로컬 스토리지에 저장됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6" onClick={() => setShowLogout(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <i className="ri-logout-box-line text-3xl text-red-500 mb-2 block" />
              <p className="text-base font-black text-gray-900">관리자 로그아웃</p>
              <p className="text-xs text-gray-500 mt-1">로그아웃 하시겠습니까?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-black text-gray-600">취소</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-500 text-sm font-black text-white shadow-lg">로그아웃</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
