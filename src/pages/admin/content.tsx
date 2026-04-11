import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './page';
import { saveImage, getImage, removeImage, type ImageKey } from '@/lib/imageStore';

const CONTENT_KEY = 'hyangjae_content';

const DEFAULT_CONTENT = {
  heroTitle: '향재원',
  heroSubtitle: '서초구 양재동 · 스마트팜 & 체험 공간',
  heroDesc: '고추냉이 스마트팜과 자연 속 힐링 체험을 경험하세요',
  noticeText: '2027년 6월 정식 오픈 예정입니다. 사전 예약을 받고 있습니다.',
  ctaBooking: '지금 예약하기',
  ctaMap: '오시는 길',
  facilityDesc: '서울 서초구 양재동 178-4 · 약 536평 규모의 복합 스마트팜 공간',
  openHourWeekday: '10:00 ~ 21:00',
  openHourWeekend: '09:00 ~ 22:00',
  phone: '010-4929-0070',
  address: '서울특별시 서초구 양재동 178-4',
  instagramHandle: '@hyangjae_farm',
  primaryColor: '#10b981',
  accentColor: '#6366f1',
  fontStyle: 'modern',
};

type ContentData = typeof DEFAULT_CONTENT;
type FontStyle = 'modern' | 'classic' | 'bold';

const FONT_PREVIEWS: { id: FontStyle; label: string; class: string }[] = [
  { id: 'modern',  label: '모던',   class: 'font-bold' },
  { id: 'classic', label: '클래식', class: 'font-medium' },
  { id: 'bold',    label: '굵게',   class: 'font-black' },
];

export default function AdminContent() {
  const navigate = useNavigate();
  const { isAuth } = useAdminAuth();
  const [tab, setTab] = useState<'text' | 'images' | 'style' | 'contact'>('text');
  const [content, setContent] = useState<ContentData>(() => {
    const raw = localStorage.getItem(CONTENT_KEY);
    return raw ? { ...DEFAULT_CONTENT, ...JSON.parse(raw) } : DEFAULT_CONTENT;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isAuth()) navigate('/admin'); }, []);

  const update = (field: keyof ContentData, val: string) => {
    const next = { ...content, [field]: val };
    setContent(next);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const reset = () => {
    setContent(DEFAULT_CONTENT);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(DEFAULT_CONTENT));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const TABS = [
    { id: 'text',    label: '텍스트',  icon: 'ri-text' },
    { id: 'images',  label: '이미지',  icon: 'ri-image-line' },
    { id: 'style',   label: '스타일',  icon: 'ri-palette-line' },
    { id: 'contact', label: '연락처', icon: 'ri-phone-line' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-white text-lg" />
          </Link>
          <div className="flex-1">
            <p className="text-white font-black text-sm">콘텐츠 관리</p>
            <p className="text-gray-400 text-[10px]">텍스트 · 스타일 · 연락처 편집</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg">
                <i className="ri-check-line text-emerald-300 text-xs" />
                <span className="text-[10px] font-black text-emerald-200">저장</span>
              </div>
            )}
            <button onClick={reset} className="text-xs text-gray-400 hover:text-white font-bold flex items-center gap-1 transition-colors">
              <i className="ri-refresh-line" />초기화
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* 탭 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${tab === t.id ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className={t.icon} />{t.label}
            </button>
          ))}
        </div>

        {/* 텍스트 탭 */}
        {tab === 'text' && (
          <div className="space-y-4">
            {/* 미리보기 */}
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-[10px] text-white/60 mb-1">미리보기</p>
              <h2 className={`text-2xl text-white mb-1 ${FONT_PREVIEWS.find(f => f.id === content.fontStyle)?.class ?? 'font-bold'}`}>{content.heroTitle}</h2>
              <p className="text-xs text-white/80">{content.heroSubtitle}</p>
            </div>

            {[
              { field: 'heroTitle', label: '메인 제목', placeholder: '향재원' },
              { field: 'heroSubtitle', label: '부제목', placeholder: '서초구 양재동 · 스마트팜 & 체험 공간' },
              { field: 'heroDesc', label: '메인 설명', placeholder: '설명 문구' },
              { field: 'noticeText', label: '공지사항', placeholder: '공지 문구' },
              { field: 'ctaBooking', label: '예약 버튼 텍스트', placeholder: '지금 예약하기' },
              { field: 'ctaMap', label: '지도 버튼 텍스트', placeholder: '오시는 길' },
              { field: 'facilityDesc', label: '시설 설명', placeholder: '시설 안내 문구' },
            ].map(row => (
              <div key={row.field}>
                <label className="block text-xs font-black text-gray-700 mb-1.5">{row.label}</label>
                <input
                  type="text"
                  value={content[row.field as keyof ContentData]}
                  onChange={e => update(row.field as keyof ContentData, e.target.value)}
                  placeholder={row.placeholder}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* 이미지 탭 */}
        {tab === 'images' && <ImageUploadSection />}

        {/* 스타일 탭 */}
        {tab === 'style' && (
          <div className="space-y-5">
            {/* 폰트 스타일 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-font-size text-orange-500" />폰트 스타일
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {FONT_PREVIEWS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => update('fontStyle', f.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${content.fontStyle === f.id ? 'border-orange-400 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                  >
                    <p className={`text-base text-gray-800 mb-1 ${f.class}`}>가나다</p>
                    <p className="text-[10px] text-gray-500 font-bold">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 색상 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-palette-line text-orange-500" />테마 색상
              </h3>
              <div className="space-y-4">
                {[
                  { field: 'primaryColor', label: '메인 색상', desc: '버튼, 강조 색상' },
                  { field: 'accentColor',  label: '포인트 색상', desc: '아이콘, 보조 강조' },
                ].map(row => (
                  <div key={row.field} className="flex items-center gap-4">
                    <div>
                      <p className="text-xs font-black text-gray-700 mb-0.5">{row.label}</p>
                      <p className="text-[10px] text-gray-400">{row.desc}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl shadow-md border border-gray-200" style={{ backgroundColor: content[row.field as keyof ContentData] }} />
                      <input
                        type="color"
                        value={content[row.field as keyof ContentData]}
                        onChange={e => update(row.field as keyof ContentData, e.target.value)}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 운영시간 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-time-line text-orange-500" />운영 시간
              </h3>
              <div className="space-y-3">
                {[
                  { field: 'openHourWeekday', label: '평일 운영 시간' },
                  { field: 'openHourWeekend', label: '주말·공휴일 운영 시간' },
                ].map(row => (
                  <div key={row.field}>
                    <label className="block text-xs font-black text-gray-600 mb-1">{row.label}</label>
                    <input
                      type="text"
                      value={content[row.field as keyof ContentData]}
                      onChange={e => update(row.field as keyof ContentData, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 연락처 탭 */}
        {tab === 'contact' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-phone-line text-orange-500" />연락처 정보
              </h3>
              <div className="space-y-4">
                {[
                  { field: 'phone', label: '대표 전화번호', icon: 'ri-phone-line', placeholder: '010-0000-0000' },
                  { field: 'address', label: '주소', icon: 'ri-map-pin-line', placeholder: '서울특별시 서초구 양재동 178-4' },
                  { field: 'instagramHandle', label: '인스타그램', icon: 'ri-instagram-line', placeholder: '@hyangjae_farm' },
                ].map(row => (
                  <div key={row.field}>
                    <label className="flex items-center gap-1.5 text-xs font-black text-gray-700 mb-1.5">
                      <i className={`${row.icon} text-orange-400`} />{row.label}
                    </label>
                    <input
                      type="text"
                      value={content[row.field as keyof ContentData]}
                      onChange={e => update(row.field as keyof ContentData, e.target.value)}
                      placeholder={row.placeholder}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 미리보기 */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                <i className="ri-eye-line text-gray-400" />연락처 미리보기
              </h3>
              <div className="space-y-3">
                <a href={`tel:${content.phone}`} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <i className="ri-phone-line text-emerald-600" />
                  <span className="text-sm font-black text-emerald-700">{content.phone}</span>
                </a>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <i className="ri-map-pin-line text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">{content.address}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <i className="ri-instagram-line text-pink-600" />
                  <span className="text-sm font-black text-pink-700">{content.instagramHandle}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ 이미지 업로드 섹션 ═══════ */

interface ImageSlotDef {
  key: ImageKey;
  label: string;
  description: string;
  gradient: string;
}

const IMAGE_SLOTS: ImageSlotDef[] = [
  {
    key: 'glamping-outdoor',
    label: '스마트팜 데크 외부',
    description: '예약 페이지 상단 · 외부 전경 이미지',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    key: 'glamping-interior',
    label: '스마트팜 내부',
    description: '예약 페이지 상단 · 텐트 내부 이미지',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    key: 'store-interior',
    label: '매점 내부',
    description: '예약 페이지 하단 · 향재원 매점 전경',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    key: 'store-products',
    label: '매점 상품',
    description: '가공상품 진열대 이미지',
    gradient: 'from-purple-400 to-pink-500',
  },
];

function ImageUploadSection() {
  const [images, setImages] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    IMAGE_SLOTS.forEach(slot => { initial[slot.key] = getImage(slot.key); });
    return initial;
  });
  const [uploading, setUploading] = useState<ImageKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<ImageKey | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = () => {
    const next: Record<string, string | null> = {};
    IMAGE_SLOTS.forEach(slot => { next[slot.key] = getImage(slot.key); });
    setImages(next);
  };

  const handleFile = async (key: ImageKey, file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(key);
    try {
      await saveImage(key, file);
      refresh();
      setSuccessKey(key);
      setTimeout(() => setSuccessKey(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (key: ImageKey) => {
    removeImage(key);
    refresh();
  };

  return (
    <div className="space-y-4">
      {/* 안내 */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100 flex gap-3">
        <i className="ri-information-line text-orange-500 text-lg flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-orange-900 mb-1">이미지 업로드 안내</p>
          <ul className="text-[11px] text-orange-700 leading-relaxed space-y-0.5">
            <li>• 최대 10MB · JPG/PNG · 자동 리사이즈 (1280px)</li>
            <li>• 업로드 즉시 앱 전체에 반영됩니다</li>
            <li>• 브라우저 저장소를 사용합니다 (서버 업로드 아님)</li>
          </ul>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <i className="ri-error-warning-line text-red-500" />
          <p className="text-xs font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* 이미지 슬롯 그리드 */}
      {IMAGE_SLOTS.map(slot => {
        const current = images[slot.key];
        const isUploading = uploading === slot.key;
        const isSuccess = successKey === slot.key;

        return (
          <div key={slot.key} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            {/* 헤더 */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${slot.gradient} flex items-center justify-center shadow-md`}>
                  <i className="ri-image-line text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{slot.label}</p>
                  <p className="text-[10px] text-gray-500">{slot.description}</p>
                </div>
              </div>
              {isSuccess && (
                <div className="flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-lg">
                  <i className="ri-check-line text-emerald-600 text-xs" />
                  <span className="text-[10px] font-black text-emerald-700">업로드 완료</span>
                </div>
              )}
            </div>

            {/* 미리보기 */}
            <div className="relative bg-gray-50">
              {current ? (
                <div className="relative group">
                  <img src={current} alt={slot.label} className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                    <button
                      onClick={() => inputRefs.current[slot.key]?.click()}
                      className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-xs font-black text-gray-800 hover:bg-white transition-all shadow-md"
                    >
                      <i className="ri-refresh-line mr-1" />교체
                    </button>
                    <button
                      onClick={() => handleRemove(slot.key)}
                      className="px-3 py-1.5 bg-red-500/90 backdrop-blur-md rounded-lg text-xs font-black text-white hover:bg-red-600 transition-all shadow-md"
                    >
                      <i className="ri-delete-bin-line mr-1" />삭제
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => inputRefs.current[slot.key]?.click()}
                  disabled={isUploading}
                  className="w-full h-44 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/40 transition-all group"
                >
                  {isUploading ? (
                    <>
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2" />
                      <p className="text-xs font-black text-gray-500">업로드 중...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                        <i className="ri-upload-cloud-2-line text-2xl text-gray-400 group-hover:text-orange-500" />
                      </div>
                      <p className="text-xs font-black text-gray-600">클릭해서 이미지 업로드</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG · 최대 10MB</p>
                    </>
                  )}
                </button>
              )}

              <input
                ref={el => { inputRefs.current[slot.key] = el; }}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(slot.key, e.target.files?.[0])}
                className="hidden"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
