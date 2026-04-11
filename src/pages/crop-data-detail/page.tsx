import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';

export default function CropDataDetail() {
  const [searchParams] = useSearchParams();
  const cropId = searchParams.get('id') || 'wasabi';
  const scrollY = useScrollY();
  const [activeTab, setActiveTab] = useState('status');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const today = new Date();
  const plantedDate = new Date(today.getTime() - 142 * 24 * 60 * 60 * 1000);
  const expectedHarvest = new Date(today.getTime() + (18 * 30 - 142) * 24 * 60 * 60 * 1000);

  const cropDataList: Record<string, any> = {
    wasabi: {
      name: '고추냉이 (와사비)',
      scientificName: 'Wasabia japonica',
      image: '',
      plantedDate: plantedDate.toISOString().slice(0, 10),
      expectedHarvest: expectedHarvest.toISOString().slice(0, 10),
      daysGrown: 142,
      healthScore: 92,
      growthStage: '생육 중기',
      growthProgress: 45,
      currentStatus: {
        height: '28cm',
        leafCount: 12,
        rootSize: '85g (예상)',
        condition: '매우 건강'
      },
      environment: {
        temperature: { current: 16.5, optimal: '15-18°C', status: 'optimal' },
        humidity: { current: 75, optimal: '70-80%', status: 'optimal' },
        light: { current: 55, optimal: '50-60%', status: 'optimal' },
        soilMoisture: { current: 68, optimal: '65-75%', status: 'optimal' },
        ec: { current: 1.4, optimal: '1.2-1.5', status: 'optimal' },
        ph: { current: 6.2, optimal: '6.0-6.5', status: 'optimal' }
      },
      weeklyData: {
        temperature: [16.2, 16.5, 16.8, 16.3, 16.5, 16.7, 16.5],
        humidity: [73, 75, 76, 74, 75, 77, 75],
        growth: [26.5, 27.0, 27.2, 27.5, 27.8, 28.0, 28.0]
      },
      monthlyData: {
        temperature: [15.8, 16.0, 16.2, 16.5],
        humidity: [72, 74, 75, 75],
        growth: [22, 24, 26, 28]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-08', type: 'fertilizer', description: 'EC 농도 조정 (1.3→1.4)', icon: 'ri-flask-line' },
        { date: '2026-04-07', type: 'inspection', description: '병해충 점검 - 이상 없음', icon: 'ri-search-eye-line' },
        { date: '2026-04-06', type: 'pruning', description: '노화 잎 제거 (2장)', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-05', type: 'measurement', description: '생육 측정 - 높이 27.5cm', icon: 'ri-ruler-line' }
      ],
      alerts: [
        { type: 'info', message: '다음 주 양액 교체 예정', date: '2026-04-14' },
        { type: 'success', message: '생육 상태 양호 - 예상 수확량 달성 가능', date: '2026-04-09' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 85, phosphorus: 78, potassium: 82 },
        { date: '6/2', nitrogen: 86, phosphorus: 79, potassium: 83 },
        { date: '6/3', nitrogen: 87, phosphorus: 80, potassium: 84 },
        { date: '6/4', nitrogen: 88, phosphorus: 81, potassium: 85 },
        { date: '6/5', nitrogen: 88, phosphorus: 82, potassium: 85 }
      ]
    },
    strawberry: {
      name: '딸기',
      scientificName: 'Fragaria × ananassa',
      image: '',
      plantedDate: '2026-02-10',
      expectedHarvest: '2026-06-15',
      daysGrown: 89,
      healthScore: 88,
      growthStage: '착과기',
      growthProgress: 65,
      currentStatus: {
        height: '25cm',
        leafCount: 18,
        fruitCount: '24개',
        condition: '건강'
      },
      environment: {
        temperature: { current: 22, optimal: '20-25°C', status: 'optimal' },
        humidity: { current: 65, optimal: '60-70%', status: 'optimal' },
        light: { current: 80, optimal: '70-90%', status: 'optimal' },
        soilMoisture: { current: 62, optimal: '60-70%', status: 'optimal' },
        ec: { current: 0.7, optimal: '0.6-0.8', status: 'optimal' },
        ph: { current: 6.0, optimal: '5.5-6.5', status: 'optimal' }
      },
      weeklyData: {
        temperature: [21.5, 22.0, 22.3, 21.8, 22.0, 22.5, 22.0],
        humidity: [63, 65, 66, 64, 65, 67, 65],
        growth: [23.5, 24.0, 24.2, 24.5, 24.8, 25.0, 25.0]
      },
      monthlyData: {
        temperature: [20.5, 21.0, 21.5, 22.0],
        humidity: [62, 63, 64, 65],
        growth: [18, 20, 23, 25]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'pollination', description: '인공 수분 작업', icon: 'ri-flower-line' },
        { date: '2026-04-08', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-07', type: 'inspection', description: '잿빛곰팡이병 예방 살포', icon: 'ri-shield-check-line' },
        { date: '2026-04-06', type: 'pruning', description: '런너 제거', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-05', type: 'harvest', description: '1차 수확 - 2.5kg', icon: 'ri-hand-heart-line' }
      ],
      alerts: [
        { type: 'warning', message: '야간 온도 관리 주의 필요', date: '2026-04-09' },
        { type: 'info', message: '2차 수확 예정일: 6월 10일', date: '2026-04-07' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 80, phosphorus: 85, potassium: 88 },
        { date: '6/2', nitrogen: 81, phosphorus: 85, potassium: 88 },
        { date: '6/3', nitrogen: 82, phosphorus: 86, potassium: 89 },
        { date: '6/4', nitrogen: 82, phosphorus: 86, potassium: 89 },
        { date: '6/5', nitrogen: 83, phosphorus: 87, potassium: 90 }
      ]
    },
    basil: {
      name: '바질',
      scientificName: 'Ocimum basilicum',
      image: '',
      plantedDate: '2026-03-01',
      expectedHarvest: '2026-04-20',
      daysGrown: 56,
      healthScore: 95,
      growthStage: '수확기',
      growthProgress: 90,
      currentStatus: {
        height: '35cm',
        leafCount: 45,
        branchCount: '8개',
        condition: '매우 건강'
      },
      environment: {
        temperature: { current: 23, optimal: '20-25°C', status: 'optimal' },
        humidity: { current: 65, optimal: '60-70%', status: 'optimal' },
        light: { current: 85, optimal: '80-100%', status: 'optimal' },
        soilMoisture: { current: 58, optimal: '55-65%', status: 'optimal' },
        ec: { current: 1.2, optimal: '1.0-1.4', status: 'optimal' },
        ph: { current: 6.3, optimal: '6.0-7.0', status: 'optimal' }
      },
      weeklyData: {
        temperature: [22.5, 23.0, 23.2, 22.8, 23.0, 23.5, 23.0],
        humidity: [63, 65, 66, 64, 65, 66, 65],
        growth: [32, 33, 33.5, 34, 34.5, 35, 35]
      },
      monthlyData: {
        temperature: [21, 22, 22.5, 23],
        humidity: [62, 63, 64, 65],
        growth: [15, 22, 28, 35]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'harvest', description: '잎 수확 - 150g', icon: 'ri-hand-heart-line' },
        { date: '2026-04-08', type: 'pruning', description: '꽃대 제거', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-07', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-06', type: 'inspection', description: '진딧물 점검 - 이상 없음', icon: 'ri-search-eye-line' },
        { date: '2026-04-05', type: 'fertilizer', description: '엽면 시비', icon: 'ri-flask-line' }
      ],
      alerts: [
        { type: 'success', message: '생육 상태 최상 - 수확 적기', date: '2026-04-09' },
        { type: 'info', message: '다음 수확 예정: 6월 8일', date: '2026-04-09' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 90, phosphorus: 82, potassium: 85 },
        { date: '6/2', nitrogen: 91, phosphorus: 83, potassium: 86 },
        { date: '6/3', nitrogen: 92, phosphorus: 84, potassium: 87 },
        { date: '6/4', nitrogen: 93, phosphorus: 85, potassium: 88 },
        { date: '6/5', nitrogen: 94, phosphorus: 86, potassium: 89 }
      ]
    },
    lettuce: {
      name: '상추',
      scientificName: 'Lactuca sativa',
      image: '',
      plantedDate: '2026-02-20',
      expectedHarvest: '2026-04-25',
      daysGrown: 35,
      healthScore: 85,
      growthStage: '생육 후기',
      growthProgress: 75,
      currentStatus: {
        height: '22cm',
        leafCount: 28,
        weight: '180g (예상)',
        condition: '양호'
      },
      environment: {
        temperature: { current: 20, optimal: '18-22°C', status: 'optimal' },
        humidity: { current: 70, optimal: '65-75%', status: 'optimal' },
        light: { current: 75, optimal: '70-85%', status: 'optimal' },
        soilMoisture: { current: 65, optimal: '60-70%', status: 'optimal' },
        ec: { current: 1.0, optimal: '0.8-1.2', status: 'optimal' },
        ph: { current: 6.0, optimal: '5.8-6.5', status: 'optimal' }
      },
      weeklyData: {
        temperature: [19.5, 20.0, 20.2, 19.8, 20.0, 20.3, 20.0],
        humidity: [68, 70, 71, 69, 70, 72, 70],
        growth: [18, 19, 19.5, 20, 21, 21.5, 22]
      },
      monthlyData: {
        temperature: [18, 19, 19.5, 20],
        humidity: [65, 67, 68, 70],
        growth: [5, 10, 16, 22]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-08', type: 'inspection', description: '생육 상태 점검', icon: 'ri-search-eye-line' },
        { date: '2026-04-07', type: 'fertilizer', description: 'EC 농도 조정', icon: 'ri-flask-line' },
        { date: '2026-04-06', type: 'pruning', description: '하엽 정리', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-05', type: 'measurement', description: '생육 측정 - 높이 21cm', icon: 'ri-ruler-line' }
      ],
      alerts: [
        { type: 'info', message: '수확 예정일까지 15일 남음', date: '2026-04-09' },
        { type: 'warning', message: '고온 주의 - 환기 필요', date: '2026-04-08' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 82, phosphorus: 75, potassium: 78 },
        { date: '6/2', nitrogen: 83, phosphorus: 76, potassium: 79 },
        { date: '6/3', nitrogen: 84, phosphorus: 77, potassium: 80 },
        { date: '6/4', nitrogen: 85, phosphorus: 78, potassium: 81 },
        { date: '6/5', nitrogen: 85, phosphorus: 78, potassium: 82 }
      ]
    },
    perilla: {
      name: '깻잎',
      scientificName: 'Perilla frutescens',
      image: '',
      plantedDate: '2026-03-10',
      expectedHarvest: '2026-04-30',
      daysGrown: 46,
      healthScore: 90,
      growthStage: '수확기',
      growthProgress: 85,
      currentStatus: {
        height: '40cm',
        leafCount: 35,
        harvestedLeaves: '120장',
        condition: '건강'
      },
      environment: {
        temperature: { current: 25, optimal: '22-28°C', status: 'optimal' },
        humidity: { current: 68, optimal: '65-75%', status: 'optimal' },
        light: { current: 80, optimal: '75-90%', status: 'optimal' },
        soilMoisture: { current: 62, optimal: '58-68%', status: 'optimal' },
        ec: { current: 1.3, optimal: '1.0-1.5', status: 'optimal' },
        ph: { current: 6.2, optimal: '6.0-7.0', status: 'optimal' }
      },
      weeklyData: {
        temperature: [24.5, 25.0, 25.2, 24.8, 25.0, 25.5, 25.0],
        humidity: [66, 68, 69, 67, 68, 70, 68],
        growth: [36, 37, 38, 38.5, 39, 39.5, 40]
      },
      monthlyData: {
        temperature: [23, 24, 24.5, 25],
        humidity: [64, 65, 67, 68],
        growth: [20, 28, 35, 40]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'harvest', description: '잎 수확 - 30장', icon: 'ri-hand-heart-line' },
        { date: '2026-04-08', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-07', type: 'pruning', description: '순지르기 작업', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-06', type: 'inspection', description: '해충 점검 - 이상 없음', icon: 'ri-search-eye-line' },
        { date: '2026-04-05', type: 'fertilizer', description: '추비 시비', icon: 'ri-flask-line' }
      ],
      alerts: [
        { type: 'success', message: '수확량 목표 달성 중', date: '2026-04-09' },
        { type: 'info', message: '다음 수확 예정: 6월 8일', date: '2026-04-09' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 86, phosphorus: 80, potassium: 83 },
        { date: '6/2', nitrogen: 87, phosphorus: 81, potassium: 84 },
        { date: '6/3', nitrogen: 88, phosphorus: 82, potassium: 85 },
        { date: '6/4', nitrogen: 89, phosphorus: 83, potassium: 86 },
        { date: '6/5', nitrogen: 90, phosphorus: 84, potassium: 87 }
      ]
    },
    tomato: {
      name: '토마토',
      scientificName: 'Solanum lycopersicum',
      image: '',
      plantedDate: '2026-01-30',
      expectedHarvest: '2026-05-05',
      daysGrown: 82,
      healthScore: 78,
      growthStage: '착과기',
      growthProgress: 70,
      currentStatus: {
        height: '120cm',
        fruitCount: '18개',
        flowerCount: '12개',
        condition: '주의 필요'
      },
      environment: {
        temperature: { current: 26, optimal: '22-28°C', status: 'optimal' },
        humidity: { current: 72, optimal: '60-70%', status: 'high' },
        light: { current: 90, optimal: '85-100%', status: 'optimal' },
        soilMoisture: { current: 58, optimal: '55-65%', status: 'optimal' },
        ec: { current: 2.2, optimal: '2.0-2.5', status: 'optimal' },
        ph: { current: 6.3, optimal: '6.0-6.8', status: 'optimal' }
      },
      weeklyData: {
        temperature: [25.5, 26.0, 26.2, 25.8, 26.0, 26.5, 26.0],
        humidity: [70, 72, 73, 71, 72, 74, 72],
        growth: [115, 116, 117, 118, 119, 119.5, 120]
      },
      monthlyData: {
        temperature: [24, 25, 25.5, 26],
        humidity: [65, 68, 70, 72],
        growth: [80, 95, 110, 120]
      },
      recentActivities: [
        { date: '2026-04-09', type: 'inspection', description: '잎곰팡이병 초기 증상 발견', icon: 'ri-alert-line' },
        { date: '2026-04-08', type: 'pruning', description: '곁순 제거', icon: 'ri-scissors-cut-line' },
        { date: '2026-04-07', type: 'watering', description: '정기 관수 완료', icon: 'ri-drop-line' },
        { date: '2026-04-06', type: 'support', description: '유인줄 조정', icon: 'ri-links-line' },
        { date: '2026-04-05', type: 'fertilizer', description: '칼슘 엽면 시비', icon: 'ri-flask-line' }
      ],
      alerts: [
        { type: 'warning', message: '습도 높음 - 환기 필요', date: '2026-04-09' },
        { type: 'error', message: '잎곰팡이병 주의 - 방제 필요', date: '2026-04-09' }
      ],
      nutritionHistory: [
        { date: '6/1', nitrogen: 75, phosphorus: 80, potassium: 85 },
        { date: '6/2', nitrogen: 76, phosphorus: 80, potassium: 85 },
        { date: '6/3', nitrogen: 76, phosphorus: 81, potassium: 86 },
        { date: '6/4', nitrogen: 77, phosphorus: 81, potassium: 86 },
        { date: '6/5', nitrogen: 78, phosphorus: 82, potassium: 87 }
      ]
    }
  };

  const crop = cropDataList[cropId] || cropDataList.wasabi;
  const chartData = selectedPeriod === 'week' ? crop.weeklyData : crop.monthlyData;
  const labels = selectedPeriod === 'week' 
    ? ['월', '화', '수', '목', '금', '토', '일']
    : ['1주', '2주', '3주', '4주'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-50 to-emerald-50 border-green-200';
      case 'warning': return 'from-orange-50 to-amber-50 border-orange-200';
      case 'error': return 'from-red-50 to-rose-50 border-red-200';
      default: return 'from-blue-50 to-indigo-50 border-blue-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return 'ri-checkbox-circle-fill text-green-600';
      case 'warning': return 'ri-error-warning-fill text-orange-600';
      case 'error': return 'ri-close-circle-fill text-red-600';
      default: return 'ri-information-fill text-blue-600';
    }
  };

  const maxTemp = Math.max(...chartData.temperature);
  const maxHumidity = Math.max(...chartData.humidity);
  const maxGrowth = Math.max(...chartData.growth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20 overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      <PageHeader title="작물 상세 데이터" backTo="/smart-farm-data" />

      {/* Crop Hero */}
      <section className="px-4 pt-6 pb-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className={`relative h-44 bg-gradient-to-br ${CROP_VISUAL[cropId]?.gradient ?? 'from-emerald-400 to-teal-500'} flex items-center justify-center`}>
            <span className="text-9xl opacity-25 select-none">{CROP_VISUAL[cropId]?.emoji ?? '🌱'}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-black text-white mb-1 drop-shadow-lg">{crop.name}</h2>
                  <p className="text-xs text-white/80 font-medium italic">{crop.scientificName}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    crop.healthScore >= 90 ? 'bg-green-500/90' :
                    crop.healthScore >= 80 ? 'bg-blue-500/90' :
                    crop.healthScore >= 70 ? 'bg-orange-500/90' : 'bg-red-500/90'
                  }`}>
                    <i className="ri-heart-pulse-line text-white text-sm"></i>
                    <span className="text-sm font-black text-white">{crop.healthScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">재배일수</p>
              <p className="text-base font-black text-gray-900">{crop.daysGrown}일</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">생육단계</p>
              <p className="text-base font-black text-emerald-600">{crop.growthStage}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">진행률</p>
              <p className="text-base font-black text-blue-600">{crop.growthProgress}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">상태</p>
              <p className="text-base font-black text-purple-600">{crop.currentStatus.condition}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium">정식일: {crop.plantedDate}</span>
              <span className="font-medium">수확예정: {crop.expectedHarvest}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${crop.growthProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 pb-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-gray-100">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'status', icon: 'ri-plant-line', label: '상태' },
              { id: 'environment', icon: 'ri-dashboard-line', label: '환경' },
              { id: 'chart', icon: 'ri-line-chart-line', label: '그래프' },
              { id: 'activity', icon: 'ri-history-line', label: '기록' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${tab.icon} text-base block mb-0.5`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts */}
      {crop.alerts && crop.alerts.length > 0 && (
        <section className="px-4 pb-4 relative z-10">
          <div className="space-y-2">
            {crop.alerts.map((alert: any, index: number) => (
              <div 
                key={index}
                className={`bg-gradient-to-r ${getAlertColor(alert.type)} rounded-2xl p-4 border-2 flex items-start gap-3`}
              >
                <i className={`${getAlertIcon(alert.type)} text-lg mt-0.5`}></i>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Status Tab */}
        {activeTab === 'status' && (
          <section className="px-4 pb-6 space-y-4 animate-fadeIn">
            {/* Current Status */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                  <i className="ri-plant-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">현재 생육 상태</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(crop.currentStatus).map(([key, value]: [string, any]) => {
                  const labels: Record<string, string> = {
                    height: '높이',
                    leafCount: '잎 수',
                    rootSize: '근경 크기',
                    fruitCount: '열매 수',
                    flowerCount: '꽃 수',
                    branchCount: '가지 수',
                    weight: '무게',
                    harvestedLeaves: '수확 잎',
                    condition: '상태'
                  };
                  const icons: Record<string, string> = {
                    height: 'ri-ruler-line',
                    leafCount: 'ri-leaf-line',
                    rootSize: 'ri-plant-line',
                    fruitCount: 'ri-apple-line',
                    flowerCount: 'ri-flower-line',
                    branchCount: 'ri-git-branch-line',
                    weight: 'ri-scales-line',
                    harvestedLeaves: 'ri-stack-line',
                    condition: 'ri-heart-pulse-line'
                  };

                  return (
                    <div key={key} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className={`${icons[key] || 'ri-information-line'} text-emerald-600 text-sm`}></i>
                        <p className="text-xs text-gray-500 font-medium">{labels[key] || key}</p>
                      </div>
                      <p className="text-base font-black text-gray-900">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nutrition Status */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                  <i className="ri-flask-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">양분 상태</h3>
              </div>

              <div className="space-y-4">
                {['nitrogen', 'phosphorus', 'potassium'].map((nutrient) => {
                  const labels: Record<string, string> = {
                    nitrogen: '질소 (N)',
                    phosphorus: '인산 (P)',
                    potassium: '칼륨 (K)'
                  };
                  const colors: Record<string, string> = {
                    nitrogen: 'from-green-500 to-emerald-500',
                    phosphorus: 'from-orange-500 to-amber-500',
                    potassium: 'from-purple-500 to-pink-500'
                  };
                  const latestValue = crop.nutritionHistory[crop.nutritionHistory.length - 1][nutrient];

                  return (
                    <div key={nutrient}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">{labels[nutrient]}</span>
                        <span className="text-sm font-black text-gray-900">{latestValue}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${colors[nutrient]} rounded-full transition-all duration-500`}
                          style={{ width: `${latestValue}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  <i className="ri-dashboard-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">환경 데이터</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(crop.environment).map(([key, data]: [string, any]) => {
                  const labels: Record<string, string> = {
                    temperature: '온도',
                    humidity: '습도',
                    light: '광량',
                    soilMoisture: '토양 수분',
                    ec: 'EC 농도',
                    ph: 'pH'
                  };
                  const icons: Record<string, string> = {
                    temperature: 'ri-temp-hot-line',
                    humidity: 'ri-drop-line',
                    light: 'ri-sun-line',
                    soilMoisture: 'ri-water-flash-line',
                    ec: 'ri-flask-line',
                    ph: 'ri-test-tube-line'
                  };
                  const colors: Record<string, string> = {
                    temperature: 'from-red-400 to-orange-500',
                    humidity: 'from-blue-400 to-cyan-500',
                    light: 'from-yellow-400 to-orange-500',
                    soilMoisture: 'from-cyan-400 to-blue-500',
                    ec: 'from-purple-400 to-pink-500',
                    ph: 'from-green-400 to-emerald-500'
                  };
                  const units: Record<string, string> = {
                    temperature: '°C',
                    humidity: '%',
                    light: '%',
                    soilMoisture: '%',
                    ec: 'mS/cm',
                    ph: ''
                  };

                  return (
                    <div key={key} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${colors[key]} rounded-xl shadow-lg`}>
                            <i className={`${icons[key]} text-lg text-white`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{labels[key]}</p>
                            <p className="text-xs text-gray-500 font-medium">적정: {data.optimal}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-gray-900">{data.current}{units[key]}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(data.status)}`}>
                            {data.status === 'optimal' ? '적정' : data.status === 'high' ? '높음' : '낮음'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Chart Tab */}
        {activeTab === 'chart' && (
          <section className="px-4 pb-6 space-y-4 animate-fadeIn">
            {/* Period Selector */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedPeriod === 'week'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  주간 데이터
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedPeriod === 'month'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  월간 데이터
                </button>
              </div>
            </div>

            {/* Temperature Chart */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg">
                  <i className="ri-temp-hot-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">온도 변화</h3>
              </div>

              <div className="h-40 flex items-end justify-between gap-2">
                {chartData.temperature.map((temp: number, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-500 hover:from-red-600 hover:to-orange-500"
                      style={{ height: `${(temp / maxTemp) * 100}%` }}
                    ></div>
                    <p className="text-xs font-bold text-gray-600 mt-2">{labels[index]}</p>
                    <p className="text-xs font-black text-gray-900">{temp}°C</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg">
                  <i className="ri-drop-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">습도 변화</h3>
              </div>

              <div className="h-40 flex items-end justify-between gap-2">
                {chartData.humidity.map((humidity: number, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500"
                      style={{ height: `${(humidity / maxHumidity) * 100}%` }}
                    ></div>
                    <p className="text-xs font-bold text-gray-600 mt-2">{labels[index]}</p>
                    <p className="text-xs font-black text-gray-900">{humidity}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                  <i className="ri-line-chart-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">생육 변화</h3>
              </div>

              <div className="h-40 flex items-end justify-between gap-2">
                {chartData.growth.map((growth: number, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-emerald-500"
                      style={{ height: `${(growth / maxGrowth) * 100}%` }}
                    ></div>
                    <p className="text-xs font-bold text-gray-600 mt-2">{labels[index]}</p>
                    <p className="text-xs font-black text-gray-900">{growth}cm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Trend */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                  <i className="ri-flask-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">양분 추이</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-600">질소</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-gray-600">인산</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="font-medium text-gray-600">칼륨</span>
                  </div>
                </div>

                <div className="h-32 flex items-end justify-between gap-3">
                  {crop.nutritionHistory.map((data: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 h-24 items-end">
                        <div 
                          className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          style={{ height: `${data.nitrogen}%` }}
                        ></div>
                        <div 
                          className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                          style={{ height: `${data.phosphorus}%` }}
                        ></div>
                        <div 
                          className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                          style={{ height: `${data.potassium}%` }}
                        ></div>
                      </div>
                      <p className="text-xs font-bold text-gray-600">{data.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                  <i className="ri-history-line text-lg text-white"></i>
                </div>
                <h3 className="text-base font-black text-gray-900">최근 관리 기록</h3>
              </div>

              <div className="space-y-3">
                {crop.recentActivities.map((activity: any, index: number) => {
                  const typeColors: Record<string, string> = {
                    watering: 'from-blue-400 to-cyan-500',
                    fertilizer: 'from-purple-400 to-pink-500',
                    inspection: 'from-green-400 to-emerald-500',
                    pruning: 'from-orange-400 to-red-500',
                    measurement: 'from-indigo-400 to-purple-500',
                    harvest: 'from-yellow-400 to-orange-500',
                    pollination: 'from-pink-400 to-rose-500',
                    support: 'from-gray-400 to-gray-500'
                  };

                  return (
                    <div 
                      key={index}
                      className="relative pl-10"
                    >
                      <div className={`absolute left-0 top-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br ${typeColors[activity.type] || 'from-gray-400 to-gray-500'} rounded-xl shadow-lg`}>
                        <i className={`${activity.icon} text-sm text-white`}></i>
                      </div>
                      {index < crop.recentActivities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200"></div>
                      )}
                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100 ml-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-gray-900">{activity.description}</p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{activity.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:shadow-lg transition-all duration-300">
                전체 기록 보기
              </button>
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
