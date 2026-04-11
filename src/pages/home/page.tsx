import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { AUTH_KEY } from '@/pages/login/page';

export default function Home() {
  const scrollY = useScrollY();
  const [activeFeature, setActiveFeature] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) { try { setUserName(JSON.parse(raw).name); } catch { /* noop */ } }
  }, []);

  const features = [
    {
      icon: 'ri-camera-lens-line',
      title: 'AI 작물 인식',
      desc: '사진 촬영으로 작물 자동 식별',
      link: '/crop-recognition',
      gradient: 'from-emerald-400 via-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    {
      icon: 'ri-building-line',
      title: '시설 설비 설계',
      desc: '스마트팜 시설 시뮬레이터',
      link: '/facility-design',
      gradient: 'from-blue-400 via-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      icon: 'ri-bar-chart-box-line',
      title: '수익성 분석',
      desc: '실시간 시세 기반 자동 계산',
      link: '/profit-analysis',
      gradient: 'from-purple-400 via-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: 'ri-line-chart-line',
      title: '가격 동향',
      desc: '가락시장 시세 그래프',
      link: '/price-trends',
      gradient: 'from-cyan-400 via-sky-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50'
    },
    {
      icon: 'ri-calendar-check-line',
      title: '체험 예약',
      desc: '공간 대여 및 체험 관리',
      link: '/booking',
      gradient: 'from-orange-400 via-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50'
    },
    {
      icon: 'ri-remote-control-line',
      title: '장비 제어',
      desc: 'QR · IP 로 IoT 연결',
      link: '/device-control',
      gradient: 'from-slate-400 via-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-50'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: '재배 작물', value: '3,000주', icon: 'ri-plant-line', gradientClass: 'from-emerald-400 to-emerald-600', bgClass: 'bg-emerald-100' },
    { label: '스마트팜', value: '150평', icon: 'ri-home-gear-line', gradientClass: 'from-blue-400 to-blue-600', bgClass: 'bg-blue-100' },
    { label: '연 매출 목표', value: '₩4억', icon: 'ri-money-dollar-circle-line', gradientClass: 'from-purple-400 to-purple-600', bgClass: 'bg-purple-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 pb-20 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      {/* Header with Glass Effect */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl relative z-10 shadow-lg">
                <i className="ri-plant-line text-2xl text-white"></i>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight">향재원</h1>
              <p className="text-xs text-emerald-600 font-semibold">Smart Farm AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={userName ? '/profile' : '/login'}
              className="flex items-center gap-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-3 h-10"
            >
              <i className="ri-user-line text-base text-white"></i>
              {userName && <span className="text-xs font-black text-white max-w-[60px] truncate">{userName}</span>}
            </Link>
            <Link
              to="/map"
              className="w-10 h-10 flex items-center justify-center bg-white/80 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <i className="ri-map-pin-2-line text-lg text-emerald-600"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-6 pb-4 relative">
        <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <img
            src="/facility-images/facility-10.jpg"
            alt="향재원 스마트팜 전경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-3 border border-white/30">
              <i className="ri-sparkling-line text-sm animate-pulse"></i>
              <span className="text-xs font-bold">서울 서초구 양재동 · Farm-to-Table</span>
            </div>
            <h2 className="text-2xl font-black mb-1 drop-shadow-lg">향재원 스마트팜</h2>
            <p className="text-sm text-white/90 font-medium">고추냉이 특화 스마트팜 + 체험 공간</p>
          </div>
        </div>
      </section>

      {/* Facility Photo Strip */}
      <section className="px-4 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { src: '/facility-images/facility-00.jpg', label: '스마트팜 내부' },
            { src: '/facility-images/facility-01.jpg', label: 'Farm-to-Table' },
            { src: '/facility-images/facility-09.jpg', label: '체험 데크' },
            { src: '/facility-images/facility-03.jpg', label: '향재원 매점' },
            { src: '/facility-images/facility-12.jpg', label: '전체 부지' },
          ].map((photo, i) => (
            <div key={i} className="flex-shrink-0 w-28 rounded-2xl overflow-hidden shadow-md relative">
              <img src={photo.src} alt={photo.label} className="w-28 h-20 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-1 left-0 right-0 text-center text-white text-[10px] font-bold">{photo.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Cards with 3D Effect */}
      <section className="px-4 pb-8 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientClass} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100">
                <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${stat.gradientClass} rounded-xl mb-3 shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                  <i className={`${stat.icon} text-xl text-white`}></i>
                </div>
                <p className="text-xs text-gray-500 mb-1 font-medium">{stat.label}</p>
                <p className="text-base font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Features with 3D Cards */}
      <section className="px-4 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">주요 기능</h3>
          <div className="flex gap-1">
            {features.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeFeature ? 'w-6 bg-emerald-500' : 'w-1.5 bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Link 
              key={index}
              to={feature.link}
              className="relative group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500`}></div>
              <div className={`relative bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-5 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 border border-white overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
                <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${feature.gradient} rounded-2xl mb-4 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                <h4 className="text-sm font-black text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
                <div className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                  <i className="ri-arrow-right-line text-sm text-gray-700"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions with 3D Effect */}
      <section className="px-4 pb-8">
        <h3 className="text-lg font-black text-gray-900 mb-5">빠른 실행</h3>
        <div className="space-y-4">
          <Link 
            to="/crop-recognition"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <i className="ri-camera-line text-2xl text-white"></i>
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-base font-black text-white mb-1">AI 작물 인식하기</h4>
                <p className="text-xs text-white/90 font-medium">AI가 자동으로 분석합니다</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-white/30 rounded-xl">
                <i className="ri-camera-line text-xl text-white"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/ai-consultant"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-4 bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl border-2 border-gray-100 transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <i className="ri-robot-line text-2xl text-white"></i>
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-base font-black text-gray-900 mb-1">AI 컨설턴트</h4>
                <p className="text-xs text-gray-600 font-medium">24시간 재배 상담 서비스</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-xl">
                <i className="ri-robot-line text-xl text-purple-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/guide"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-4 bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl border-2 border-gray-100 transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <i className="ri-book-open-line text-2xl text-white"></i>
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-black text-gray-900">재배 가이드 웹툰</h4>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">55화</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">고추냉이 스마트팜 완전 가이드</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all duration-300"></i>
            </div>
          </Link>
        </div>
      </section>

      {/* 향재원 소개 배너 */}
      <section className="px-4 pb-6">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img src="/facility-images/facility-01.jpg" alt="향재원 Farm to Table" className="w-full h-36 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <p className="text-emerald-300 text-xs font-bold mb-1">서울 서초구 양재동 178-4</p>
            <h3 className="text-white text-lg font-black">향재원 Farm to Table</h3>
            <p className="text-white/80 text-xs mt-1">고추냉이 스마트팜 + 체험 데크 8개소</p>
            <p className="text-yellow-300 text-xs font-semibold mt-1">2027년 6월 정식 오픈 예정</p>
          </div>
        </div>
      </section>

      {/* 제품 라인업 */}
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900">향재원 제품 라인업</h3>
          <Link to="/shop" className="text-xs text-emerald-600 font-black flex items-center gap-0.5 hover:gap-1 transition-all">
            전체 보기 <i className="ri-arrow-right-s-line" />
          </Link>
        </div>
        <Link
          to="/shop"
          className="block relative rounded-3xl overflow-hidden shadow-lg bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="relative h-40 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-80">
              <span className="text-6xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500">🌿</span>
              <span className="text-5xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" style={{ transitionDelay: '50ms' }}>🧂</span>
              <span className="text-5xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" style={{ transitionDelay: '100ms' }}>🍵</span>
              <span className="text-5xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" style={{ transitionDelay: '150ms' }}>🎁</span>
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow">
              <span className="text-[10px] font-black text-emerald-700">SHOP NOW</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-14" />
            <div className="absolute bottom-2 left-3 text-white">
              <p className="text-[10px] font-black opacity-90">Farm-to-Table 공식 스토어</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-black text-gray-900">고추냉이 가공식품 라인</p>
              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">8종</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['쌈장', '소금', '가루', '절임', '어묵', '원액차', '생근경', '선물세트'].map(item => (
                <span key={item} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">{item}</span>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-500 font-medium">5만원 이상 무료배송</p>
              <span className="text-[11px] text-emerald-600 font-black group-hover:translate-x-1 transition-transform">스토어 방문 →</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Recent Activity with Timeline */}
      <section className="px-4 pb-8">
        <h3 className="text-lg font-black text-gray-900 mb-5">최근 활동</h3>
        <div className="bg-white rounded-3xl shadow-xl divide-y divide-gray-100 border border-gray-100 overflow-hidden">
          {[
            { icon: 'ri-seedling-line', text: '스마트팜 실시간 데이터', time: '2시간 전', color: 'green', gradient: 'from-green-400 to-emerald-500', link: '/smart-farm-data' },
            { icon: 'ri-calendar-check-line', text: '스마트팜 스케줄러', time: '5시간 전', color: 'blue', gradient: 'from-blue-400 to-indigo-500', link: '/cultivation-calendar' },
            { icon: 'ri-line-chart-line', text: '작물 데이터 분석', time: '1일 전', color: 'orange', gradient: 'from-orange-400 to-red-500', link: '/smart-farm-data?tab=history' }
          ].map((activity, index) => (
            <Link
              key={index}
              to={activity.link}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${activity.gradient} rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                <div className={`relative w-12 h-12 flex items-center justify-center bg-gradient-to-br ${activity.gradient} rounded-xl shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                  <i className={`${activity.icon} text-xl text-white`}></i>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{activity.text}</p>
                <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-300 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300"></i>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}