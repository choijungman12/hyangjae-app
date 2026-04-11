import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

// TODO: 🟡 EDIT:ADDRESS ─ 실제 주소 (도로명 주소 권장)
const ADDRESS = '서울특별시 서초구 양재동 178-4';
// TODO: 🟡 EDIT:GPS ─ 지도 앱 딥링크용 GPS 좌표 (구글맵에서 확인 가능)
const LAT = 37.4690;
const LNG = 127.0499;
const PLACE_NAME = encodeURIComponent('향재원 스마트팜');
const ADDR_ENC = encodeURIComponent(ADDRESS);

const MAP_APPS = [
  {
    id: 'naver',
    name: '네이버 지도',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'ri-map-pin-2-line',
    deepLink: `nmap://place?lat=${LAT}&lng=${LNG}&name=${PLACE_NAME}&appname=com.hyangjae.app`,
    webLink: `https://map.naver.com/v5/search/${ADDR_ENC}`,
    desc: '네이버 지도로 길찾기',
  },
  {
    id: 'kakao',
    name: '카카오맵',
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'ri-map-2-line',
    deepLink: `kakaomap://route?ep=${LAT},${LNG}&by=CAR`,
    webLink: `https://map.kakao.com/link/to/${PLACE_NAME},${LAT},${LNG}`,
    desc: '카카오맵으로 길찾기',
  },
  {
    id: 'tmap',
    name: 'T map',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'ri-navigation-line',
    deepLink: `tmap://route?goalname=${PLACE_NAME}&goalx=${LNG}&goaly=${LAT}`,
    webLink: `https://tmap.life/route?goalname=${PLACE_NAME}&goalx=${LNG}&goaly=${LAT}`,
    desc: 'T map으로 내비게이션',
  },
  {
    id: 'google',
    name: '구글 지도',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ri-map-pin-line',
    deepLink: `comgooglemaps://?daddr=${LAT},${LNG}&directionsmode=driving`,
    webLink: `https://maps.google.com/maps?q=${LAT},${LNG}`,
    desc: '구글 지도로 길찾기',
  },
];

const TRANSIT_INFO = [
  {
    icon: 'ri-subway-line',
    title: '지하철',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    lines: [
      '3호선 양재역 1번 출구 도보 15분',
      '신분당선 양재시민의숲역 3번 출구 도보 8분',
    ],
  },
  {
    icon: 'ri-bus-line',
    title: '버스',
    color: 'text-green-600',
    bg: 'bg-green-50',
    lines: [
      '마을버스 서초13 · 양재동 178-4 정류장 하차',
      '간선버스 440 · 양재역 환승',
    ],
  },
  {
    icon: 'ri-car-line',
    title: '승용차',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    lines: [
      '경부고속도로 양재IC 진출 후 양재동 방면 5분',
      '주차장 완비 (무료 · 30대)',
    ],
  },
];

function openMapApp(app: typeof MAP_APPS[0]) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = app.deepLink;
  document.body.appendChild(iframe);
  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(app.webLink, '_blank');
  }, 1500);
}

export default function MapPage() {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = ADDRESS;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">오시는 길</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
            <i className="ri-map-pin-2-fill text-white text-xl" />
          </div>
        </div>
      </header>

      {/* 지도 대체 영역 (정적 시각화) */}
      <section className="px-4 pt-5 pb-5">
        <div className="relative bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 rounded-3xl overflow-hidden shadow-2xl" style={{ height: '220px' }}>
          {/* 지도 패턴 배경 */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`h${i}`} className="absolute w-full border-t border-white" style={{ top: `${i * 14}%` }} />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`v${i}`} className="absolute h-full border-l border-white" style={{ left: `${i * 11}%` }} />
            ))}
          </div>
          {/* 길 표시 */}
          <div className="absolute inset-0">
            <div className="absolute bg-white/30 rounded-full" style={{ top: '45%', left: '10%', right: '10%', height: '6px', transform: 'rotate(-3deg)' }} />
            <div className="absolute bg-white/20 rounded-full" style={{ top: '20%', bottom: '20%', left: '50%', width: '6px', transform: 'rotate(8deg)' }} />
          </div>
          {/* 핀 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-emerald-400 animate-bounce" style={{ animationDuration: '2s' }}>
              <i className="ri-map-pin-2-fill text-emerald-600 text-2xl" />
            </div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full mt-1 shadow-lg" />
          </div>
          {/* 라벨 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg">
              <p className="text-sm font-black text-gray-900">향재원 스마트팜</p>
              <p className="text-xs text-gray-500">{ADDRESS}</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-md">
            <p className="text-[10px] font-black text-gray-500">지도 앱으로 이동 ↓</p>
          </div>
        </div>
      </section>

      {/* 주소 복사 */}
      <section className="px-4 pb-5">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-map-pin-line text-emerald-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold mb-0.5">주소</p>
            <p className="text-sm font-black text-gray-900 truncate">{ADDRESS}</p>
          </div>
          <button
            onClick={copyAddress}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all ${copiedAddress ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {copiedAddress ? (
              <span className="flex items-center gap-1"><i className="ri-check-line" />복사됨</span>
            ) : (
              <span className="flex items-center gap-1"><i className="ri-file-copy-line" />복사</span>
            )}
          </button>
        </div>
      </section>

      {/* 지도 앱 선택 */}
      <section className="px-4 pb-5">
        <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
          <i className="ri-navigation-fill text-emerald-500" />
          지도 앱으로 길찾기
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {MAP_APPS.map(app => (
            <button
              key={app.id}
              onClick={() => openMapApp(app)}
              className={`${app.bg} border ${app.border} rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-3 shadow-md`}>
                <i className={`${app.icon} text-white text-lg`} />
              </div>
              <p className="text-sm font-black text-gray-900">{app.name}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{app.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-3">앱이 설치된 경우 자동으로 실행됩니다</p>
      </section>

      {/* 운영 시간 */}
      <section className="px-4 pb-5">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <i className="ri-time-line text-white" />
            </div>
            <h3 className="text-sm font-black text-gray-900">운영 시간</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { day: '평일 (월~금)', times: ['11:00 ~ 14:00', '18:00 ~ 21:00'], active: true },
              { day: '주말 · 공휴일', times: ['11:00 ~ 14:00', '15:00 ~ 18:00', '18:00 ~ 21:00'], active: true },
              { day: '정기 휴무', times: ['매월 첫째 월요일'], active: false },
            ].map(row => (
              <div key={row.day} className="flex items-start justify-between gap-3">
                <span className={`text-xs font-bold pt-0.5 ${row.active ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{row.day}</span>
                <span className={`text-xs font-black text-right leading-relaxed ${row.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400 dark:text-red-300'}`}>
                  {row.times.map((t, i) => (
                    <span key={i} translate="no" className="block">{t}</span>
                  ))}
                </span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <i className="ri-phone-line text-emerald-500" />
              <span className="text-xs font-bold text-gray-700">예약 문의</span>
              {/* TODO: 🟡 EDIT:PHONE ─ 대표 전화번호 */}
              <a href="tel:01049290070" className="text-xs font-black text-emerald-600 ml-auto">010-4929-0070</a>
            </div>
          </div>
        </div>
      </section>

      {/* 교통 안내 */}
      <section className="px-4 pb-6">
        <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
          <i className="ri-bus-line text-emerald-500" />
          교통 안내
        </h3>
        <div className="space-y-3">
          {TRANSIT_INFO.map(info => (
            <div key={info.title} className={`${info.bg} rounded-2xl p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-2.5">
                <i className={`${info.icon} ${info.color} text-lg`} />
                <span className={`text-xs font-black ${info.color}`}>{info.title}</span>
              </div>
              <div className="space-y-1.5">
                {info.lines.map(line => (
                  <div key={line} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 예약 CTA */}
      <section className="px-4 pb-6">
        <Link
          to="/booking"
          className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-black text-sm text-center shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <i className="ri-calendar-check-line text-lg" />
          향재원 예약하기
        </Link>
      </section>

      <BottomNav />
    </div>
  );
}
