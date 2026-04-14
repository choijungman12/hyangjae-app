import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';

// 가격 계산: basePrice(평일139K/주말159K) + 추가인원(4인 초과 × 20K) + 불멍(30K) + 숯불(20K)
const ALL_BOOKINGS = [
  { id: 'B2040', name: '김민준', phone: '010-1234-5678', type: '3번 데크 + 불멍',     date: '2026-04-12', time: '18:30', guests: 6, price: 229000, status: 'confirmed' },  // 주말159+2명40+불멍30=229
  { id: 'B2039', name: '박지영', phone: '010-2345-6789', type: '심화 투어',           date: '2026-04-11', time: '11:00', guests: 2, price: 30000,  status: 'pending' },    // 15K×2인=30K
  { id: 'B2038', name: '이서현', phone: '010-3456-7890', type: '7번 데크 + 숯불',     date: '2026-04-11', time: '16:00', guests: 8, price: 259000, status: 'confirmed' },  // 평일139+4명80+숯불20+애견10=249 (or 주말159+4명80+숯불20=259)
  { id: 'B2037', name: '정도현', phone: '010-4567-8901', type: '1번 데크',            date: '2026-04-10', time: '13:30', guests: 4, price: 139000, status: 'done' },       // 평일139
  { id: 'B2036', name: '최수아', phone: '010-5678-9012', type: '심화 투어',           date: '2026-04-10', time: '13:00', guests: 3, price: 45000,  status: 'confirmed' },  // 15K×3인=45K
  { id: 'B2035', name: '강현우', phone: '010-6789-0123', type: '5번 데크',            date: '2026-04-09', time: '16:00', guests: 3, price: 139000, status: 'cancelled' },  // 평일139
  { id: 'B2034', name: '윤서연', phone: '010-7890-1234', type: '영어 튜터 프로그램',   date: '2026-04-08', time: '15:00', guests: 1, price: 45000,  status: 'done' },       // 45K×1인=45K
  { id: 'B2033', name: '임재원', phone: '010-8901-2345', type: '2번 데크 + 불멍+숯불', date: '2026-04-07', time: '18:30', guests: 7, price: 249000, status: 'done' },       // 평일139+3명60+불멍30+숯불20=249
];

const STATUS_META = {
  confirmed: { label: '확정', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  pending:   { label: '대기', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  done:      { label: '완료', color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-300' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-600',       dot: 'bg-red-400' },
};

export default function AdminBookings() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [bookings, setBookings] = useState(ALL_BOOKINGS);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const selectedBooking = bookings.find(b => b.id === selected);

  const updateStatus = (id: string, status: string) => {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
  };

  const totalRevenue = bookings.filter(b => b.status === 'done' || b.status === 'confirmed').reduce((s, b) => s + b.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-white text-lg" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">예약 관리</p>
            <p className="text-gray-400 text-[10px]">총 {bookings.length}건 · 매출 {(totalRevenue / 10000).toFixed(0)}만원</p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 현황 요약 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '전체', count: bookings.length, color: 'text-gray-700', bg: 'bg-white' },
            { label: '확정', count: bookings.filter(b => b.status === 'confirmed').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '대기', count: bookings.filter(b => b.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: '취소', count: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => setFilter(stat.label === '전체' ? 'all' : stat.label === '확정' ? 'confirmed' : stat.label === '대기' ? 'pending' : 'cancelled')}
              className={`${stat.bg} rounded-2xl p-3 text-center shadow-sm border border-gray-100`}
            >
              <p className={`text-lg font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: '전체' },
            { id: 'confirmed', label: '확정' },
            { id: 'pending', label: '대기중' },
            { id: 'done', label: '완료' },
            { id: 'cancelled', label: '취소' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all ${filter === f.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map(b => {
            const s = STATUS_META[b.status as keyof typeof STATUS_META];
            return (
              <button
                key={b.id}
                onClick={() => setSelected(b.id === selected ? null : b.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-gray-900">{b.name}</p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{b.type} · {b.date} {b.time} · {b.guests}명</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-gray-800">{b.price.toLocaleString()}원</p>
                  <p className="text-[10px] text-gray-400">{b.id}</p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400 font-bold">예약 내역이 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 예약 상세 모달 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">예약 상세</h3>
              <button onClick={() => setSelected(null)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className="ri-close-line text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: '예약번호', value: selectedBooking.id },
                { label: '예약자', value: selectedBooking.name },
                { label: '연락처', value: selectedBooking.phone },
                { label: '구분', value: selectedBooking.type },
                { label: '날짜·시간', value: `${selectedBooking.date} ${selectedBooking.time}` },
                { label: '인원', value: `${selectedBooking.guests}명` },
                { label: '금액', value: `${selectedBooking.price.toLocaleString()}원` },
                { label: '상태', value: STATUS_META[selectedBooking.status as keyof typeof STATUS_META].label },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">{row.label}</p>
                  <p className="text-xs font-black text-gray-800">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['pending', 'confirmed', 'done', 'cancelled'] as const).map(s => {
                const meta = STATUS_META[s];
                return (
                  <button
                    key={s}
                    onClick={() => { updateStatus(selectedBooking.id, s); setSelected(null); }}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all ${meta.color} border border-transparent hover:border-gray-300`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
