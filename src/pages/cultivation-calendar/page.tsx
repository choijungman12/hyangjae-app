import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { CROPS, CropData, CROP_VISUAL } from '@/data/crops';

// cultivation-calendar 전용 추가 필드 (CROPS에 없는 필드만 유지)
interface CropExtra {
  id: string;
  category: string;
  growthPeriod: number;
  gradient: string;
}

const CROP_EXTRAS: CropExtra[] = [
  { id: 'wasabi',        category: 'herb',   growthPeriod: 18,  gradient: 'from-emerald-400 to-teal-500' },
  { id: 'strawberry',    category: 'fruit',  growthPeriod: 6,   gradient: 'from-red-400 to-pink-500' },
  { id: 'basil',         category: 'herb',   growthPeriod: 2,   gradient: 'from-green-400 to-emerald-500' },
  { id: 'tomato',        category: 'fruit',  growthPeriod: 4,   gradient: 'from-orange-400 to-red-500' },
  { id: 'lettuce',       category: 'leafy',  growthPeriod: 1.5, gradient: 'from-lime-400 to-green-500' },
  { id: 'perilla',       category: 'herb',   growthPeriod: 2,   gradient: 'from-purple-400 to-indigo-500' },
  { id: 'cucumber',      category: 'fruit',  growthPeriod: 3,   gradient: 'from-teal-400 to-cyan-500' },
  { id: 'paprika',       category: 'fruit',  growthPeriod: 5,   gradient: 'from-yellow-400 to-orange-500' },
  { id: 'spinach',       category: 'leafy',  growthPeriod: 1.5, gradient: 'from-green-500 to-emerald-600' },
  { id: 'kale',          category: 'leafy',  growthPeriod: 2,   gradient: 'from-emerald-500 to-green-600' },
  { id: 'mint',          category: 'herb',   growthPeriod: 2,   gradient: 'from-cyan-400 to-teal-500' },
  { id: 'cherry-tomato', category: 'fruit',  growthPeriod: 3.5, gradient: 'from-rose-400 to-red-500' },
];

type MergedCrop = CropData & CropExtra;

const crops: MergedCrop[] = CROPS.map((crop) => {
  const extra = CROP_EXTRAS.find((e) => e.id === crop.id) ?? {
    id: crop.id,
    category: 'other',
    growthPeriod: 0,
    gradient: 'from-gray-400 to-gray-500',
  };
  return { ...crop, ...extra };
});

export default function CultivationCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const scrollY = useScrollY();
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const getCropsByMonth = (month: number) => {
    return crops.filter(crop => 
      crop.planting.includes(month) || crop.harvesting.includes(month)
    );
  };

  const getActivityType = (crop: MergedCrop, month: number) => {
    const isPlanting = crop.planting.includes(month);
    const isHarvesting = crop.harvesting.includes(month);
    
    if (isPlanting && isHarvesting) return 'both';
    if (isPlanting) return 'planting';
    if (isHarvesting) return 'harvesting';
    return 'none';
  };

  const selectedCropData = selectedCrop ? crops.find(c => c.id === selectedCrop) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">재배 달력</h1>
          <button 
            onClick={() => setViewMode(viewMode === 'calendar' ? 'timeline' : 'calendar')}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          >
            <i className={`${viewMode === 'calendar' ? 'ri-timeline-view' : 'ri-calendar-view'} text-xl text-white`}></i>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-6 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black mb-2 drop-shadow-lg">스마트 재배 달력</h2>
                <p className="text-sm text-white/90 font-medium">최적의 재배 시기를 확인하세요</p>
              </div>
              <div className="w-16 h-16 animate-bounce flex items-center justify-center" style={{ animationDuration: '3s' }}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <i className="ri-calendar-check-line text-3xl text-white drop-shadow-lg"></i>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-seedling-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">정식 시기</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-plant-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">생육 관리</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
                <i className="ri-scissors-line text-2xl mb-1"></i>
                <p className="text-xs font-bold">수확 시기</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Month Selector */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-gray-100">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(index)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                  selectedMonth === index
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewMode === 'calendar' ? (
        <>
          {/* Current Month Activities */}
          <section className="px-4 pb-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <i className="ri-calendar-check-line text-xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{months[selectedMonth]} 재배 활동</h3>
                  <p className="text-xs text-gray-500 font-medium">이달의 정식 및 수확 작물</p>
                </div>
              </div>

              <div className="space-y-3">
                {getCropsByMonth(selectedMonth).map((crop) => {
                  const activityType = getActivityType(crop, selectedMonth);
                  return (
                    <div 
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${crop.gradient}`}>
                          <span className="text-3xl">{CROP_VISUAL[crop.id]?.emoji ?? '🌱'}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900 mb-1">{crop.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {activityType === 'planting' || activityType === 'both' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                <i className="ri-seedling-line"></i>
                                정식
                              </span>
                            ) : null}
                            {activityType === 'harvesting' || activityType === 'both' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                                <i className="ri-scissors-line"></i>
                                수확
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* All Crops Overview */}
          <section className="px-4 pb-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                  <i className="ri-plant-line text-xl text-white"></i>
                </div>
                <h3 className="text-lg font-black text-gray-900">작물별 재배 일정</h3>
              </div>

              <div className="space-y-4">
                {crops.map((crop) => (
                  <div 
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center bg-gradient-to-br ${crop.gradient}`}>
                        <span className="text-2xl">{CROP_VISUAL[crop.id]?.emoji ?? '🌱'}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-gray-900">{crop.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">재배 기간: {crop.growthPeriod}개월</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-1">
                      {months.map((_, index) => {
                        const isPlanting = crop.planting.includes(index);
                        const isHarvesting = crop.harvesting.includes(index);
                        const isBoth = isPlanting && isHarvesting;
                        
                        return (
                          <div
                            key={index}
                            className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isBoth
                                ? `bg-gradient-to-br ${crop.gradient} text-white shadow-lg`
                                : isPlanting
                                ? 'bg-green-200 text-green-800'
                                : isHarvesting
                                ? 'bg-orange-200 text-orange-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {isBoth ? '●' : isPlanting ? '↑' : isHarvesting ? '↓' : ''}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-200 rounded"></div>
                        <span className="text-gray-600 font-medium">정식</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-200 rounded"></div>
                        <span className="text-gray-600 font-medium">수확</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 bg-gradient-to-br ${crop.gradient} rounded`}></div>
                        <span className="text-gray-600 font-medium">정식+수확</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Timeline View */
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <i className="ri-timeline-view text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-black text-gray-900">연간 타임라인</h3>
            </div>

            <div className="space-y-6">
              {crops.map((crop, cropIndex) => (
                <div key={crop.id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${crop.gradient}`}>
                      <span className="text-3xl">{CROP_VISUAL[crop.id]?.emoji ?? '🌱'}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-gray-900 mb-2">{crop.name}</h4>
                      <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden">
                        {/* Planting periods */}
                        {crop.planting.map((month, index) => (
                          <div
                            key={`plant-${index}`}
                            className="absolute top-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-80"
                            style={{
                              left: `${(month / 12) * 100}%`,
                              width: `${(1 / 12) * 100}%`
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <i className="ri-seedling-line text-white text-xs"></i>
                            </div>
                          </div>
                        ))}
                        {/* Harvesting periods */}
                        {crop.harvesting.map((month, index) => (
                          <div
                            key={`harvest-${index}`}
                            className="absolute bottom-0 h-full bg-gradient-to-r from-orange-400 to-red-500 opacity-80"
                            style={{
                              left: `${(month / 12) * 100}%`,
                              width: `${(1 / 12) * 100}%`
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <i className="ri-scissors-line text-white text-xs"></i>
                            </div>
                          </div>
                        ))}
                        {/* Month markers */}
                        {months.map((_, index) => (
                          <div
                            key={index}
                            className="absolute top-0 bottom-0 border-l border-gray-300"
                            style={{ left: `${(index / 12) * 100}%` }}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {[1, 3, 6, 9, 12].map((month) => (
                          <span key={month} className="text-xs text-gray-500 font-medium">{month}월</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {cropIndex < crops.length - 1 && (
                    <div className="h-px bg-gray-200 my-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Crop Detail Modal */}
      {selectedCropData && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end animate-fadeIn"
          onClick={() => setSelectedCrop(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain animate-slideUp flex flex-col"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-black text-gray-900">{selectedCropData.name} 재배 정보</h3>
              <button 
                onClick={() => setSelectedCrop(null)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-700"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Crop Visual Card */}
              <div className={`w-36 h-36 mx-auto rounded-3xl shadow-2xl bg-gradient-to-br ${CROP_VISUAL[selectedCropData.id]?.gradient ?? 'from-emerald-400 to-teal-500'} flex items-center justify-center`}>
                <span className="text-7xl">{CROP_VISUAL[selectedCropData.id]?.emoji ?? '🌱'}</span>
              </div>

              {/* Growth Period */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                    <i className="ri-time-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">재배 기간</h4>
                </div>
                <p className="text-2xl font-black text-blue-600">{selectedCropData.growthPeriod}개월</p>
              </div>

              {/* Planting Schedule - Smart Farm */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <i className="ri-seedling-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">정식 시기</h4>
                </div>

                {/* 스마트팜 기준 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-xs text-white font-black">🏭</span>
                    <span className="text-xs font-black text-gray-800">스마트팜(시설재배) 기준</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    {selectedCropData.plantingSmartFarm.map((month) => (
                      <span key={`sf-${month}`} className="px-3 py-1.5 bg-cyan-100 rounded-xl text-xs font-bold text-cyan-800 border border-cyan-200">
                        {months[month]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 노지재배 기준 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-xs text-white font-black">🌾</span>
                    <span className="text-xs font-black text-gray-800">노지재배 기준</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    {selectedCropData.plantingOpenField.map((month) => (
                      <span key={`of-${month}`} className="px-3 py-1.5 bg-amber-100 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
                        {months[month]}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed border-t border-green-200 pt-3">{selectedCropData.tasks.planting}</p>
              </div>

              {/* Growing Management - Detailed */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                    <i className="ri-plant-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">생육 관리</h4>
                </div>
                <ul className="space-y-2 mb-3">
                  {selectedCropData.growingPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                      <span className="mt-0.5 w-4 h-4 flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-black text-[9px]">{i + 1}</span>
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Environment Guide */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg">
                    <i className="ri-settings-3-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">환경 관리 기준</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: 'ri-temp-hot-line', label: '온도', value: selectedCropData.envGuide.temp },
                    { icon: 'ri-drop-line', label: '습도', value: selectedCropData.envGuide.humidity },
                    { icon: 'ri-sun-line', label: '광량', value: selectedCropData.envGuide.light },
                    { icon: 'ri-flask-line', label: 'EC', value: selectedCropData.envGuide.ec },
                    { icon: 'ri-test-tube-line', label: 'pH', value: selectedCropData.envGuide.ph },
                    { icon: 'ri-water-flash-line', label: '관수', value: selectedCropData.envGuide.water },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-3 border border-teal-100 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <i className={`${icon} text-teal-500 text-sm`}></i>
                        <span className="text-[10px] font-black text-gray-500">{label}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harvesting Schedule */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg">
                    <i className="ri-scissors-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">수확 시기</h4>
                </div>

                {/* 스마트팜 수확 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-xs text-white font-black">🏭</span>
                    <span className="text-xs font-black text-gray-800">스마트팜 기준</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    {selectedCropData.harvestingSmartFarm.map((month) => (
                      <span key={`hsf-${month}`} className="px-3 py-1.5 bg-cyan-100 rounded-xl text-xs font-bold text-cyan-800 border border-cyan-200">
                        {months[month]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 노지 수확 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-xs text-white font-black">🌾</span>
                    <span className="text-xs font-black text-gray-800">노지재배 기준</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    {selectedCropData.harvestingOpenField.map((month) => (
                      <span key={`hof-${month}`} className="px-3 py-1.5 bg-amber-100 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
                        {months[month]}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed border-t border-orange-200 pt-3">{selectedCropData.tasks.harvesting}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/growing-guide?id=${selectedCropData.id}`}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-black text-sm text-center shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
                >
                  <i className="ri-book-open-line" />
                  재배 가이드
                </Link>
                <Link
                  to={`/crop-detail?id=${selectedCropData.id}`}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm text-center shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
                >
                  <i className="ri-information-line" />
                  작물 정보
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <section className="px-4 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex gap-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                <i className="ri-information-line"></i>
                재배 달력 활용 팁
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                지역별 기후 특성에 따라 정식 시기가 달라질 수 있습니다. 시설 재배의 경우 연중 재배가 가능하며, 작물별 특성을 고려하여 재배 계획을 수립하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
