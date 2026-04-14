import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';

const MOCK_MEMBERS = [
  { id: 'U001', name: '김민준', email: 'minjun@kakao.com', phone: '010-1234-5678', type: 'kakao', joined: '2026-01-10', bookings: 5, status: 'active' },
  { id: 'U002', name: '박지영', email: 'jiyoung@kakao.com', phone: '010-2345-6789', type: 'kakao', joined: '2026-01-22', bookings: 3, status: 'active' },
  { id: 'U003', name: '이서현', email: 'seohyun@kakao.com', phone: '010-3456-7890', type: 'kakao', joined: '2026-02-05', bookings: 2, status: 'active' },
  { id: 'U004', name: '정도현', email: 'dohyun@kakao.com', phone: '010-4567-8901', type: 'kakao', joined: '2026-02-14', bookings: 1, status: 'active' },
  { id: 'U005', name: '최수아', email: 'sua@kakao.com', phone: '010-5678-9012', type: 'kakao', joined: '2026-02-28', bookings: 4, status: 'active' },
  { id: 'U006', name: '강현우', email: 'hyunwoo@kakao.com', phone: '010-6789-0123', type: 'kakao', joined: '2026-03-07', bookings: 0, status: 'inactive' },
  { id: 'U007', name: '윤서연', email: 'seoyeon@kakao.com', phone: '010-7890-1234', type: 'kakao', joined: '2026-03-15', bookings: 2, status: 'active' },
  { id: 'U008', name: '임재원', email: 'jaewon@kakao.com', phone: '010-8901-2345', type: 'kakao', joined: '2026-03-25', bookings: 1, status: 'active' },
  { id: 'U009', name: '오민서', email: '', phone: '', type: 'guest', joined: '2026-04-01', bookings: 0, status: 'active' },
  { id: 'U010', name: '한지원', email: 'jiwon@kakao.com', phone: '010-0123-4567', type: 'kakao', joined: '2026-04-05', bookings: 2, status: 'active' },
];

export default function AdminMembers() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'kakao' | 'guest'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const filtered = MOCK_MEMBERS.filter(m => {
    const matchSearch = m.name.includes(search) || m.email.includes(search) || m.id.includes(search);
    const matchFilter = filter === 'all' ? true : filter === 'kakao' ? m.type === 'kakao' : filter === 'guest' ? m.type === 'guest' : m.status === filter;
    return matchSearch && matchFilter;
  });

  const selectedMember = MOCK_MEMBERS.find(m => m.id === selected);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-white text-lg" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">회원 관리</p>
            <p className="text-gray-400 text-[10px]">총 {MOCK_MEMBERS.length}명</p>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/20 px-2.5 py-1.5 rounded-xl">
            <i className="ri-group-line text-blue-300 text-sm" />
            <span className="text-xs font-black text-blue-200">{MOCK_MEMBERS.filter(m => m.status === 'active').length}명 활성</span>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 검색 */}
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름, 이메일, 회원번호 검색"
            className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
          />
        </div>

        {/* 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { id: 'all', label: '전체', count: MOCK_MEMBERS.length },
            { id: 'active', label: '활성', count: MOCK_MEMBERS.filter(m => m.status === 'active').length },
            { id: 'kakao', label: '카카오', count: MOCK_MEMBERS.filter(m => m.type === 'kakao').length },
            { id: 'guest', label: '게스트', count: MOCK_MEMBERS.filter(m => m.type === 'guest').length },
            { id: 'inactive', label: '비활성', count: MOCK_MEMBERS.filter(m => m.status === 'inactive').length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all ${filter === f.id ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
            >
              {f.label} <span className="ml-1 opacity-70">{f.count}</span>
            </button>
          ))}
        </div>

        {/* 회원 목록 */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(member => (
              <button
                key={member.id}
                onClick={() => setSelected(member.id === selected ? null : member.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-blue-700">{member.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900">{member.name}</p>
                    {member.type === 'kakao' && (
                      <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">카카오</span>
                    )}
                    {member.status === 'inactive' && (
                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">비활성</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{member.email || '이메일 없음'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{member.id}</p>
                  <p className="text-[10px] font-bold text-blue-600">예약 {member.bookings}건</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <i className="ri-user-search-line text-3xl text-gray-300 mb-2 block" />
                <p className="text-sm text-gray-400 font-bold">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 회원 상세 모달 */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">회원 상세 정보</h3>
              <button onClick={() => setSelected(null)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className="ri-close-line text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">{selectedMember.name[0]}</span>
              </div>
              <div>
                <p className="text-base font-black text-gray-900">{selectedMember.name}</p>
                <p className="text-xs text-gray-500">{selectedMember.id} · 가입일 {selectedMember.joined}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: '이메일', value: selectedMember.email || '-' },
                { label: '연락처', value: selectedMember.phone || '-' },
                { label: '가입 방식', value: selectedMember.type === 'kakao' ? '카카오' : '게스트' },
                { label: '예약 횟수', value: `${selectedMember.bookings}건` },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">{row.label}</p>
                  <p className="text-xs font-black text-gray-800 truncate">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-200 transition-all">문자 발송</button>
              <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all">예약 내역</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
