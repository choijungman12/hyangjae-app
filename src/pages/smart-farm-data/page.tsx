
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { CROP_VISUAL } from '@/data/crops';

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  co2Level: number;
  lightIntensity: number;
  ph: number;
}

interface CropStatus {
  id: number;
  name: string;
  zone: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  growthStage: string;
  daysToHarvest: number;
  image: string;
}

interface ControlDevice {
  id: string;
  name: string;
  icon: string;
  isOn: boolean;
  value?: number;
  unit?: string;
}

export default function SmartFarmData() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'history' | 'control'>('realtime');
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24.5,
    humidity: 68,
    soilMoisture: 72,
    co2Level: 850,
    lightIntensity: 12500,
    ph: 6.2
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [devices, setDevices] = useState<ControlDevice[]>([
    { id: 'fan', name: '환기팬', icon: 'ri-windy-line', isOn: true },
    { id: 'light', name: 'LED 조명', icon: 'ri-lightbulb-line', isOn: true, value: 80, unit: '%' },
    { id: 'water', name: '관수 시스템', icon: 'ri-drop-line', isOn: false },
    { id: 'heater', name: '난방기', icon: 'ri-temp-hot-line', isOn: false, value: 22, unit: '°C' },
    { id: 'cooler', name: '냉방기', icon: 'ri-temp-cold-line', isOn: true, value: 25, unit: '°C' },
    { id: 'co2', name: 'CO2 공급기', icon: 'ri-bubble-chart-line', isOn: true }
  ]);

  const crops: CropStatus[] = [
    {
      id: 1,
      name: '고추냉이',
      zone: 'A구역',
      health: 'excellent',
      growthStage: '성장기',
      daysToHarvest: 45,
      image: 'wasabi'
    },
    {
      id: 2,
      name: '딸기',
      zone: 'B구역',
      health: 'good',
      growthStage: '개화기',
      daysToHarvest: 21,
      image: 'strawberry'
    },
    {
      id: 3,
      name: '바질',
      zone: 'C구역',
      health: 'warning',
      growthStage: '수확기',
      daysToHarvest: 3,
      image: 'basil'
    },
    {
      id: 4,
      name: '상추',
      zone: 'D구역',
      health: 'excellent',
      growthStage: '성장기',
      daysToHarvest: 14,
      image: 'lettuce'
    }
  ];

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        temperature: Math.round((prev.temperature + (Math.random() - 0.5) * 0.5) * 10) / 10,
        humidity: Math.min(100, Math.max(0, Math.round(prev.humidity + (Math.random() - 0.5) * 2))),
        soilMoisture: Math.min(100, Math.max(0, Math.round(prev.soilMoisture + (Math.random() - 0.5) * 1.5))),
        co2Level: Math.min(2000, Math.max(300, Math.round(prev.co2Level + (Math.random() - 0.5) * 20))),
        lightIntensity: Math.min(80000, Math.max(1000, Math.round(prev.lightIntensity + (Math.random() - 0.5) * 500))),
        ph: Math.round((prev.ph + (Math.random() - 0.5) * 0.1) * 10) / 10
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(device => 
      device.id === id ? { ...device, isOn: !device.isOn } : device
    ));
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'from-emerald-400 to-green-500';
      case 'good': return 'from-blue-400 to-cyan-500';
      case 'warning': return 'from-yellow-400 to-orange-500';
      case 'critical': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'excellent': return '최상';
      case 'good': return '양호';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return '알 수 없음';
    }
  };

  const getSensorStatus = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        if (value >= 20 && value <= 28) return { status: 'optimal', color: 'text-emerald-500' };
        if (value >= 15 && value <= 32) return { status: 'normal', color: 'text-blue-500' };
        return { status: 'warning', color: 'text-red-500' };
      case 'humidity':
        if (value >= 60 && value <= 80) return { status: 'optimal', color: 'text-emerald-500' };
        if (value >= 40 && value <= 90) return { status: 'normal', color: 'text-blue-500' };
        return { status: 'warning', color: 'text-red-500' };
      case 'soilMoisture':
        if (value >= 65 && value <= 85) return { status: 'optimal', color: 'text-emerald-500' };
        if (value >= 50 && value <= 95) return { status: 'normal', color: 'text-blue-500' };
        return { status: 'warning', color: 'text-red-500' };
      default:
        return { status: 'normal', color: 'text-blue-500' };
    }
  };

  // 히스토리 차트 데이터 (시뮬레이션)
  const historyData = {
    day: [22, 23, 24, 25, 24, 23, 24, 25, 26, 25, 24, 24],
    week: [23, 24, 22, 25, 24, 23, 24],
    month: [22, 23, 24, 23, 24, 25, 24, 23, 24, 25, 26, 25, 24, 23, 24, 25, 24, 23, 24, 25, 24, 23, 24, 25, 24, 23, 24, 25, 24, 24]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl">
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900">스마트팜 데이터</h1>
              <p className="text-xs text-emerald-600 font-medium">IoT 모니터링 & 제어</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">실시간</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-4 pt-4">
        <div className="bg-gray-100 rounded-2xl p-1 flex">
          {[
            { id: 'realtime', label: '실시간 데이터', icon: 'ri-pulse-line' },
            { id: 'history', label: '기록 분석', icon: 'ri-line-chart-line' },
            { id: 'control', label: '장비 제어', icon: 'ri-settings-3-line' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'realtime' | 'history' | 'control')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-md'
                  : 'text-gray-500'
              }`}
            >
              <i className={`${tab.icon} text-base`}></i>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Data Tab */}
      {activeTab === 'realtime' && (
        <div className="px-4 pt-6 space-y-6">
          {/* Main Sensor Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                    <i className="ri-temp-hot-line text-xl text-white"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-500">온도</span>
                </div>
                <p className={`text-3xl font-black ${getSensorStatus('temperature', sensorData.temperature).color}`}>
                  {sensorData.temperature}°C
                </p>
                <p className="text-xs text-gray-400 mt-1">적정: 20-28°C</p>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg">
                    <i className="ri-water-percent-line text-xl text-white"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-500">습도</span>
                </div>
                <p className={`text-3xl font-black ${getSensorStatus('humidity', sensorData.humidity).color}`}>
                  {sensorData.humidity}%
                </p>
                <p className="text-xs text-gray-400 mt-1">적정: 60-80%</p>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                    <i className="ri-drop-line text-xl text-white"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-500">토양 수분</span>
                </div>
                <p className={`text-3xl font-black ${getSensorStatus('soilMoisture', sensorData.soilMoisture).color}`}>
                  {sensorData.soilMoisture}%
                </p>
                <p className="text-xs text-gray-400 mt-1">적정: 65-85%</p>
              </div>
            </div>

            {/* CO2 Level */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                    <i className="ri-bubble-chart-line text-xl text-white"></i>
                  </div>
                  <span className="text-xs font-bold text-gray-500">CO2 농도</span>
                </div>
                <p className="text-3xl font-black text-purple-500">
                  {sensorData.co2Level}
                </p>
                <p className="text-xs text-gray-400 mt-1">ppm (적정: 800-1200)</p>
              </div>
            </div>
          </div>

          {/* Additional Sensors */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4">추가 센서 데이터</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                  <i className="ri-sun-line text-2xl text-yellow-600"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">광량</p>
                  <p className="text-lg font-black text-gray-900">{sensorData.lightIntensity.toLocaleString()} lux</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <i className="ri-flask-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">pH 농도</p>
                  <p className="text-lg font-black text-gray-900">{sensorData.ph}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Crop Status */}
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-4">작물 상태</h3>
            <div className="space-y-3">
              {crops.map((crop) => (
                <Link
                  key={crop.id}
                  to={`/crop-data-detail?id=${crop.name === '고추냉이' ? 'wasabi' : crop.name === '딸기' ? 'strawberry' : crop.name === '바질' ? 'basil' : crop.name === '상추' ? 'lettuce' : 'wasabi'}`}
                  className="block bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl shadow-md flex items-center justify-center bg-gradient-to-br ${CROP_VISUAL[crop.image]?.gradient ?? 'from-gray-300 to-gray-400'} flex-shrink-0`}>
                      <span className="text-3xl">{CROP_VISUAL[crop.image]?.emoji ?? '🌱'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-gray-900">{crop.name}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{crop.zone}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{crop.growthStage} · 수확까지 {crop.daysToHarvest}일</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full bg-gradient-to-r ${getHealthColor(crop.health)} rounded-full`}
                            style={{ width: crop.health === 'excellent' ? '100%' : crop.health === 'good' ? '75%' : crop.health === 'warning' ? '50%' : '25%' }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getHealthColor(crop.health)} text-white`}>
                          {getHealthText(crop.health)}
                        </span>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-xl text-gray-300"></i>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="px-4 pt-6 space-y-6">
          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { id: 'day', label: '일간' },
              { id: 'week', label: '주간' },
              { id: 'month', label: '월간' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as 'day' | 'week' | 'month')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedPeriod === period.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Temperature Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900">온도 변화</h3>
              <span className="text-xs text-gray-500">평균 24.2°C</span>
            </div>
            <div className="h-40 flex items-end gap-1">
              {historyData[selectedPeriod].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-400 to-red-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(value - 15) * 8}px` }}
                  ></div>
                  {selectedPeriod === 'week' && (
                    <span className="text-xs text-gray-400">{['월', '화', '수', '목', '금', '토', '일'][index]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900">습도 변화</h3>
              <span className="text-xs text-gray-500">평균 68%</span>
            </div>
            <div className="h-40 flex items-end gap-1">
              {historyData[selectedPeriod].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-400 to-cyan-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${value * 4}px` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-xl text-white">
            <h3 className="text-sm font-black mb-4">통계 요약</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-white/80 mb-1">최고 온도</p>
                <p className="text-xl font-black">28.5°C</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-white/80 mb-1">최저 온도</p>
                <p className="text-xl font-black">19.2°C</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-white/80 mb-1">평균 습도</p>
                <p className="text-xl font-black">68%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-white/80 mb-1">관수 횟수</p>
                <p className="text-xl font-black">12회</p>
              </div>
            </div>
          </div>

          {/* Alerts History */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4">최근 알림 기록</h3>
            <div className="space-y-3">
              {[
                { type: 'warning', message: '습도가 85%를 초과했습니다', time: '2시간 전', icon: 'ri-water-percent-line' },
                { type: 'info', message: '자동 관수가 완료되었습니다', time: '5시간 전', icon: 'ri-drop-line' },
                { type: 'success', message: '온도가 적정 범위로 복귀했습니다', time: '1일 전', icon: 'ri-temp-hot-line' }
              ].map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                    alert.type === 'warning' ? 'bg-yellow-100' : alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <i className={`${alert.icon} text-lg ${
                      alert.type === 'warning' ? 'text-yellow-600' : alert.type === 'info' ? 'text-blue-600' : 'text-green-600'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Tab */}
      {activeTab === 'control' && (
        <div className="px-4 pt-6 space-y-6">
          <Link
            to="/device-control"
            className="block mb-4 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-qr-scan-line text-2xl text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">실제 IoT 장비 연결</p>
                <p className="text-[11px] text-white/80">QR 코드 스캔 또는 IP 직접 입력</p>
              </div>
              <i className="ri-arrow-right-line text-white text-xl" />
            </div>
          </Link>
          {/* Quick Controls */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-black text-white mb-4">빠른 제어</h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/30 transition-all duration-300">
                <i className="ri-water-flash-line text-2xl text-white"></i>
                <span className="text-xs font-bold text-white">긴급 관수</span>
              </button>
              <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/30 transition-all duration-300">
                <i className="ri-windy-line text-2xl text-white"></i>
                <span className="text-xs font-bold text-white">환기 시작</span>
              </button>
              <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/30 transition-all duration-300">
                <i className="ri-shut-down-line text-2xl text-white"></i>
                <span className="text-xs font-bold text-white">전체 정지</span>
              </button>
            </div>
          </div>

          {/* Device Controls */}
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-4">장비 제어</h3>
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                        device.isOn 
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg' 
                          : 'bg-gray-100'
                      }`}>
                        <i className={`${device.icon} text-2xl ${device.isOn ? 'text-white' : 'text-gray-400'}`}></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{device.name}</h4>
                        {device.value !== undefined && (
                          <p className="text-xs text-gray-500">설정값: {device.value}{device.unit}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDevice(device.id)}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                        device.isOn ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                        device.isOn ? 'left-7' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                  {device.value !== undefined && device.isOn && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">설정값 조절</span>
                        <span className="text-sm font-bold text-emerald-600">{device.value}{device.unit}</span>
                      </div>
                      <input
                        type="range"
                        min={device.id === 'light' ? 0 : 15}
                        max={device.id === 'light' ? 100 : 35}
                        value={device.value}
                        onChange={(e) => {
                          setDevices(prev => prev.map(d => 
                            d.id === device.id ? { ...d, value: parseInt(e.target.value) } : d
                          ));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900">자동화 스케줄</h3>
              <button className="text-xs font-bold text-emerald-600">설정</button>
            </div>
            <div className="space-y-3">
              {[
                { name: '자동 관수', time: '06:00, 18:00', active: true },
                { name: 'LED 조명', time: '05:00 - 21:00', active: true },
                { name: '환기 시스템', time: '온도 28°C 초과시', active: true }
              ].map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{schedule.name}</p>
                    <p className="text-xs text-gray-500">{schedule.time}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${schedule.active ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
