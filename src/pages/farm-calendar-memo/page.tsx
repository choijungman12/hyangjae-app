import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Memo {
  id: string;
  date: string;
  cropId: string;
  cropName: string;
  category: 'planting' | 'care' | 'harvest' | 'maintenance' | 'observation';
  title: string;
  content: string;
  imageUrl?: string;
  weather?: string;
  temperature?: number;
  createdAt: Date;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  memos: Memo[];
}

export default function FarmCalendarMemo() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [memos, setMemos] = useLocalStorage<Memo[]>('farm-memos', []);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [newMemo, setNewMemo] = useState({
    cropId: '',
    cropName: '',
    category: 'care' as Memo['category'],
    title: '',
    content: '',
    weather: '',
    temperature: 0
  });

  const crops = [
    { id: 'wasabi', name: '고추냉이', color: 'emerald' },
    { id: 'strawberry', name: '딸기', color: 'red' },
    { id: 'basil', name: '바질', color: 'green' },
    { id: 'lettuce', name: '상추', color: 'lime' },
    { id: 'perilla', name: '깻잎', color: 'purple' },
    { id: 'tomato', name: '토마토', color: 'orange' },
    { id: 'cucumber', name: '오이', color: 'teal' },
    { id: 'paprika', name: '파프리카', color: 'yellow' }
  ];

  // 샘플 메모 데이터
  useEffect(() => {
    // localStorage에 이미 데이터가 있으면 샘플 추가 안 함
    const existing = localStorage.getItem('farm-memos');
    if (existing && JSON.parse(existing).length > 0) return;

    const today = new Date();
    const d = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString().split('T')[0];
    };

    const sampleMemos: Memo[] = [
      {
        id: '1',
        date: d(3),
        cropId: 'wasabi',
        cropName: '고추냉이',
        category: 'planting',
        title: '고추냉이 묘 정식',
        content: 'A구역에 고추냉이 묘 50주 정식 완료. 온도 22°C, 습도 70% 유지. 차광막 설치하여 직사광선 차단.',
        weather: '맑음',
        temperature: 22,
        createdAt: new Date(d(3))
      },
      {
        id: '2',
        date: d(2),
        cropId: 'strawberry',
        cropName: '딸기',
        category: 'care',
        title: '딸기 양액 농도 조절',
        content: 'EC 농도를 1.2로 조정하고 pH 5.8로 맞춤. 꽃대가 나오기 시작해서 칼슘 농도 증가 필요.',
        weather: '흐림',
        temperature: 20,
        createdAt: new Date(d(2))
      },
      {
        id: 'today',
        date: d(0),
        cropId: 'lettuce',
        cropName: '상추',
        category: 'observation',
        title: '상추 생육 상태 점검',
        content: '전체적으로 양호한 생육 상태. 일부 잎에 약간의 팁번 현상 관찰됨. 칼슘 부족으로 판단되어 Ca 농도 조절 필요.',
        weather: '맑음',
        temperature: 23,
        createdAt: new Date()
      }
    ];
    setMemos(sampleMemos);
  }, []);

  // 달력 데이터 생성
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentCalendarDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentCalendarDate.toISOString().split('T')[0];
      const dayMemos = memos.filter(memo => memo.date === dateStr);
      
      days.push({
        date: new Date(currentCalendarDate),
        isCurrentMonth: currentCalendarDate.getMonth() === month,
        memos: dayMemos
      });
      
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddMemo = () => {
    if (!selectedDate || !newMemo.title || !newMemo.content) return;

    const memo: Memo = {
      id: Date.now().toString(),
      date: selectedDate.toISOString().split('T')[0],
      cropId: newMemo.cropId,
      cropName: newMemo.cropName || '기타',
      category: newMemo.category,
      title: newMemo.title,
      content: newMemo.content,
      weather: newMemo.weather,
      temperature: newMemo.temperature || undefined,
      createdAt: new Date()
    };

    setMemos(prev => [...prev, memo]);
    setNewMemo({
      cropId: '',
      cropName: '',
      category: 'care',
      title: '',
      content: '',
      weather: '',
      temperature: 0
    });
    setShowMemoForm(false);
    setToast({ message: '메모가 저장되었습니다.', type: 'success' });
  };

  const handleDeleteMemo = (memoId: string) => {
    setMemos(prev => prev.filter(m => m.id !== memoId));
    setToast({ message: '메모가 삭제되었습니다.', type: 'info' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting': return 'ri-seedling-line';
      case 'care': return 'ri-heart-pulse-line';
      case 'harvest': return 'ri-scissors-line';
      case 'maintenance': return 'ri-settings-3-line';
      case 'observation': return 'ri-eye-line';
      default: return 'ri-sticky-note-line';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planting': return 'from-green-400 to-emerald-500';
      case 'care': return 'from-blue-400 to-cyan-500';
      case 'harvest': return 'from-orange-400 to-red-500';
      case 'maintenance': return 'from-purple-400 to-pink-500';
      case 'observation': return 'from-yellow-400 to-amber-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'planting': return '정식';
      case 'care': return '관리';
      case 'harvest': return '수확';
      case 'maintenance': return '유지보수';
      case 'observation': return '관찰';
      default: return '기타';
    }
  };

  const selectedDateMemos = selectedDate 
    ? memos.filter(memo => memo.date === selectedDate.toISOString().split('T')[0])
    : [];

  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900">스마트팜 달력</h1>
              <p className="text-xs text-emerald-600 font-medium">재배 일지 & 메모</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center gap-2 bg-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors"
          >
            <i className="ri-calendar-check-line text-sm text-emerald-600"></i>
            <span className="text-xs font-bold text-emerald-700">오늘</span>
          </button>
        </div>
      </header>

      {/* Calendar Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-xl hover:bg-emerald-200 transition-colors"
            >
              <i className="ri-arrow-left-s-line text-xl text-emerald-600"></i>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900">
                {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
              </h2>
              <p className="text-sm text-gray-500 font-medium">재배 일정 및 메모</p>
            </div>
            <button 
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-xl hover:bg-emerald-200 transition-colors"
            >
              <i className="ri-arrow-right-s-line text-xl text-emerald-600"></i>
            </button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-bold text-gray-500">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`aspect-square p-1 rounded-xl relative transition-all duration-300 hover:scale-105 ${
                  !day.isCurrentMonth 
                    ? 'text-gray-300' 
                    : isToday(day.date)
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg'
                    : day.memos.length > 0
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-200 hover:bg-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold">{day.date.getDate()}</span>
                {day.memos.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {day.memos.slice(0, 3).map((memo, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getCategoryColor(memo.category)} shadow-sm`}
                      ></div>
                    ))}
                    {day.memos.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="px-4 pb-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </h3>
                <p className="text-sm text-gray-500">{selectedDateMemos.length}개의 메모</p>
              </div>
              <button 
                onClick={() => setShowMemoForm(true)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg"
              >
                <i className="ri-add-line"></i>
                메모 추가
              </button>
            </div>

            {/* Memos List */}
            <div className="space-y-3">
              {selectedDateMemos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="ri-sticky-note-line text-4xl mb-2"></i>
                  <p className="font-medium">이 날짜에 메모가 없습니다</p>
                  <p className="text-sm">메모를 추가해보세요!</p>
                </div>
              ) : (
                selectedDateMemos.map((memo) => (
                  <div key={memo.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div></div>
                      <button
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm text-red-400"></i>
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r ${getCategoryColor(memo.category)} shadow-lg`}>
                        <i className={`${getCategoryIcon(memo.category)} text-xl text-white`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(memo.category)} text-white text-xs font-bold rounded-full`}>
                            {getCategoryText(memo.category)}
                          </span>
                          {memo.cropName && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {memo.cropName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 mb-2">{memo.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">{memo.content}</p>
                        
                        {(memo.weather || memo.temperature) && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {memo.weather && (
                              <div className="flex items-center gap-1">
                                <i className="ri-sun-line"></i>
                                <span>{memo.weather}</span>
                              </div>
                            )}
                            {memo.temperature && (
                              <div className="flex items-center gap-1">
                                <i className="ri-temp-hot-line"></i>
                                <span>{memo.temperature}°C</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="px-4 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
              <i className="ri-history-line text-lg text-white"></i>
            </div>
            <h3 className="text-lg font-black text-gray-900">최근 활동</h3>
          </div>

          <div className="space-y-3">
            {memos.slice(-5).reverse().map((memo) => (
              <div key={memo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r ${getCategoryColor(memo.category)}`}>
                  <i className={`${getCategoryIcon(memo.category)} text-sm text-white`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{memo.title}</p>
                    <span className="text-xs text-gray-500">{memo.cropName}</span>
                  </div>
                  <p className="text-xs text-gray-500">{memo.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memo Form Modal */}
      {showMemoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">메모 추가</h3>
              <button 
                onClick={() => setShowMemoForm(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-700"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Date Display */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line text-emerald-600"></i>
                  <span className="text-sm font-bold text-emerald-800">
                    {selectedDate?.toLocaleDateString('ko-KR', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </span>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">카테고리</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'planting', label: '정식', icon: 'ri-seedling-line' },
                    { id: 'care', label: '관리', icon: 'ri-heart-pulse-line' },
                    { id: 'harvest', label: '수확', icon: 'ri-scissors-line' },
                    { id: 'maintenance', label: '유지보수', icon: 'ri-settings-3-line' },
                    { id: 'observation', label: '관찰', icon: 'ri-eye-line' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewMemo(prev => ({ ...prev, category: cat.id as Memo['category'] }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                        newMemo.category === cat.id
                          ? `bg-gradient-to-r ${getCategoryColor(cat.id)} text-white border-transparent shadow-lg`
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${cat.icon} text-lg`}></i>
                      <span className="text-sm font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">작물 (선택사항)</label>
                <select
                  value={newMemo.cropId}
                  onChange={(e) => {
                    const crop = crops.find(c => c.id === e.target.value);
                    setNewMemo(prev => ({ 
                      ...prev, 
                      cropId: e.target.value,
                      cropName: crop?.name || ''
                    }));
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="">작물 선택</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">제목</label>
                <input
                  type="text"
                  value={newMemo.title}
                  onChange={(e) => setNewMemo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="메모 제목을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">내용</label>
                <textarea
                  value={newMemo.content}
                  onChange={(e) => setNewMemo(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="상세 내용을 입력하세요"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{newMemo.content.length}/500자</p>
              </div>

              {/* Weather & Temperature */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">날씨 (선택사항)</label>
                  <select
                    value={newMemo.weather}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, weather: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
                  >
                    <option value="">선택</option>
                    <option value="맑음">맑음</option>
                    <option value="흐림">흐림</option>
                    <option value="비">비</option>
                    <option value="눈">눈</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">온도 (°C)</label>
                  <input
                    type="number"
                    value={newMemo.temperature || ''}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, temperature: parseInt(e.target.value) || 0 }))}
                    placeholder="온도"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddMemo}
                disabled={!newMemo.title || !newMemo.content}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                메모 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <BottomNav />
    </div>
  );
}