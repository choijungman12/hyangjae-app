import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';

/**
 * 문의·납품 관리
 *
 * 향재원은 공간대여를 운영하지 않습니다. 이 화면은 농산물 납품 상담,
 * 영농 견학 요청, 치유농업 협력 문의를 한곳에서 처리하기 위한 것입니다.
 */

type InquiryKind = 'supply' | 'tour' | 'care' | 'etc';

interface Inquiry {
  id: string;
  name: string;
  org: string;
  phone: string;
  kind: InquiryKind;
  /** 품목 · 요청 내용 요약 */
  subject: string;
  date: string;
  /** 납품 문의일 때 예상 거래액 (원). 견학·협력 문의는 0 */
  amount: number;
  status: 'pending' | 'contacted' | 'done' | 'closed';
}

const KIND_META: Record<InquiryKind, { label: string; icon: string; color: string }> = {
  supply: { label: '납품 상담', icon: 'ri-store-2-line',      color: 'bg-wasabi-100 text-wasabi-700' },
  tour:   { label: '영농 견학', icon: 'ri-graduation-cap-line', color: 'bg-amber-100 text-amber-700' },
  care:   { label: '치유농업', icon: 'ri-heart-pulse-line',   color: 'bg-rose-100 text-rose-700' },
  etc:    { label: '기타',     icon: 'ri-chat-3-line',        color: 'bg-gray-100 text-gray-600' },
};

const STATUS_META = {
  pending:   { label: '접수',   color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  contacted: { label: '연락완료', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  done:      { label: '성사',   color: 'bg-wasabi-100 text-wasabi-700', dot: 'bg-wasabi-400' },
  closed:    { label: '종료',   color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-300' },
};

/* 🟢 EDIT:INQUIRIES ─ 실제 문의 데이터 연동 전까지 사용하는 샘플 */
const ALL_INQUIRIES: Inquiry[] = [
  { id: 'Q2040', name: '김민준', org: '양재 플라워마켓',   phone: '010-1234-5678', kind: 'supply', subject: '에메랄드그린 1.5m 80주 견적', date: '2026-10-20', amount: 3200000, status: 'contacted' },
  { id: 'Q2039', name: '박지영', org: '서초구 농업기술센터', phone: '010-2345-6789', kind: 'care',   subject: '치유농업 프로그램 협력 논의', date: '2026-10-19', amount: 0,       status: 'pending' },
  { id: 'Q2038', name: '이서현', org: '리스토란테 비아',    phone: '010-3456-7890', kind: 'supply', subject: '라디키오·루꼴라 주 2회 정기 납품', date: '2026-10-18', amount: 1800000, status: 'done' },
  { id: 'Q2037', name: '정도현', org: '한국농수산대학',     phone: '010-4567-8901', kind: 'tour',   subject: '고추냉이 수경재배 설비 견학 (12명)', date: '2026-10-17', amount: 0,       status: 'contacted' },
  { id: 'Q2036', name: '최수아', org: '(개인)',            phone: '010-5678-9012', kind: 'supply', subject: '생근경 소량 구매 문의',          date: '2026-10-16', amount: 120000,  status: 'done' },
  { id: 'Q2035', name: '강현우', org: '조경시공 그린스페이스', phone: '010-6789-0123', kind: 'supply', subject: '블루엔젤 1.8m 근분 40주',      date: '2026-10-15', amount: 2400000, status: 'pending' },
  { id: 'Q2034', name: '윤서연', org: '서초 복지관',        phone: '010-7890-1234', kind: 'care',   subject: '어르신 원예 활동 사전 협의',      date: '2026-10-14', amount: 0,       status: 'closed' },
  { id: 'Q2033', name: '임재원', org: '델리 마켓 양재',     phone: '010-8901-2345', kind: 'supply', subject: '카볼로 네로·스위스 차드 겨울 물량 확보', date: '2026-10-13', amount: 950000,  status: 'contacted' },
];

export default function AdminInquiries() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [filter, setFilter] = useState<'all' | Inquiry['status']>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>(ALL_INQUIRIES);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const filtered = filter === 'all' ? inquiries : inquiries.filter(q => q.status === filter);
  const selectedInquiry = inquiries.find(q => q.id === selected);

  const updateStatus = (id: string, status: Inquiry['status']) => {
    setInquiries(qs => qs.map(q => (q.id === id ? { ...q, status } : q)));
  };

  /** 성사·연락완료 건의 예상 거래액 합계 */
  const pipeline = inquiries
    .filter(q => q.status === 'done' || q.status === 'contacted')
    .reduce((s, q) => s + q.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                aria-label="뒤로 가기">
            <i className="ri-arrow-left-line text-white text-lg" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">문의 · 납품 관리</p>
            <p className="text-gray-400 text-[10px]" translate="no">
              총 {inquiries.length}건 · 파이프라인 {(pipeline / 10000).toFixed(0)}만원
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 현황 요약 */}
        <div className="grid grid-cols-4 gap-2">
          {([
            { label: '전체',   key: 'all'       as const, color: 'text-gray-700',   bg: 'bg-white' },
            { label: '접수',   key: 'pending'   as const, color: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: '연락완료', key: 'contacted' as const, color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: '성사',   key: 'done'      as const, color: 'text-wasabi-600', bg: 'bg-wasabi-50' },
          ]).map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`${stat.bg} rounded-2xl p-3 text-center shadow-sm border border-gray-100`}
            >
              <p className={`text-lg font-black ${stat.color}`} translate="no">
                {stat.key === 'all' ? inquiries.length : inquiries.filter(q => q.status === stat.key).length}
              </p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* 필터 */}
        <div className="flex gap-2 overflow-x-auto">
          {([
            { id: 'all'       as const, label: '전체' },
            { id: 'pending'   as const, label: '접수' },
            { id: 'contacted' as const, label: '연락완료' },
            { id: 'done'      as const, label: '성사' },
            { id: 'closed'    as const, label: '종료' },
          ]).map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                filter === f.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 문의 목록 */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map(q => {
            const s = STATUS_META[q.status];
            const k = KIND_META[q.kind];
            return (
              <button
                key={q.id}
                onClick={() => setSelected(q.id === selected ? null : q.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-gray-900">{q.name}</p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${k.color}`}>{k.label}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{q.org} · {q.subject}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-gray-800" translate="no">
                    {q.amount > 0 ? `${q.amount.toLocaleString()}원` : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400" translate="no">{q.date}</p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400 font-bold">해당 상태의 문의가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl w-full p-6 shadow-2xl animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">문의 상세</h3>
              <button onClick={() => setSelected(null)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
                      aria-label="닫기">
                <i className="ri-close-line text-gray-600" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: '문의번호', value: selectedInquiry.id },
                { label: '담당자',   value: selectedInquiry.name },
                { label: '소속',     value: selectedInquiry.org },
                { label: '연락처',   value: selectedInquiry.phone },
                { label: '유형',     value: KIND_META[selectedInquiry.kind].label },
                { label: '접수일',   value: selectedInquiry.date },
                { label: '예상 거래액', value: selectedInquiry.amount > 0 ? `${selectedInquiry.amount.toLocaleString()}원` : '—' },
                { label: '상태',     value: STATUS_META[selectedInquiry.status].label },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">{row.label}</p>
                  <p className="text-xs font-black text-gray-800" translate="no">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-[10px] text-gray-400 font-bold mb-0.5">요청 내용</p>
              <p className="text-xs font-bold text-gray-800 leading-relaxed">{selectedInquiry.subject}</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['pending', 'contacted', 'done', 'closed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { updateStatus(selectedInquiry.id, s); setSelected(null); }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${STATUS_META[s].color} border border-transparent hover:border-gray-300`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
