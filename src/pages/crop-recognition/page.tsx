import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import CropAIOverlay from '@/components/CropAIOverlay';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';

export default function CropRecognition() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [aiOverlayActive, setAiOverlayActive] = useState(true);
  const scrollY = useScrollY();
  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 카메라 제어 ── */
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setShowUploadOptions(false);
    setCameraOpen(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('이 브라우저는 카메라 접근을 지원하지 않습니다.');
      }
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setCameraError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라를 허용해 주세요.');
      } else if (msg.includes('NotFound')) {
        setCameraError('사용 가능한 카메라를 찾을 수 없습니다.');
      } else {
        setCameraError(msg);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError(null);
  };

  const switchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedImage(dataUrl);
    closeCamera();
    analyzeImage(dataUrl);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSelectedImage(imageUrl);
        setShowUploadOptions(false);
        analyzeImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const analyzeImage = (_imageUrl?: string) => {
    setAnalyzing(true);
    setUploadProgress(0);
    setResult(null);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    analysisTimeoutRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setResult({
        cropName: '고추냉이 (와사비)',
        scientificName: 'Wasabia japonica',
        family: '십자화과 (Brassicaceae)',
        growthStage: '생육 중기 (정식 후 12개월)',
        growthStageDetail: '근경 비대기 - 상품성 있는 크기로 성장 중',
        health: '매우 건강',
        healthScore: 92,
        diseases: [],
        pests: [],
        leafAnalysis: {
          color: '진한 녹색 (정상)',
          texture: '광택 있고 두꺼움 (양호)',
          size: '평균 12-15cm (적정)',
          condition: '병반 없음, 충해 흔적 없음'
        },
        rootAnalysis: {
          development: '양호한 근경 발달 확인',
          estimatedSize: '약 80-100g (예상)',
          quality: '상품성 우수'
        },
        environmentalConditions: {
          currentTemp: '16.5°C',
          currentHumidity: '75%',
          lightIntensity: '55% 차광',
          soilMoisture: '적정 수준'
        },
        cultivationGuide: {
          temperature: '15-18°C (최적 생육 온도)',
          temperatureDetail: '• 주간: 15-18°C 유지\n• 야간: 12-15°C 유지\n• 20°C 이상 시 생육 저하 및 품질 하락',
          humidity: '70-80% (높은 습도 유지 필수)',
          humidityDetail: '• 상대습도 70-80% 유지\n• 건조 시 잎 끝 마름 발생\n• 과습 시 무름병 주의',
          light: '50-60% 차광 (직사광선 피함)',
          lightDetail: '• 차광막 설치 필수\n• 직사광선 노출 시 잎 황화\n• 반그늘 환경 선호',
          ec: '1.2-1.5 mS/cm',
          ecDetail: '• 생육 초기: EC 1.0-1.2\n• 생육 중기: EC 1.2-1.5\n• 생육 후기: EC 1.3-1.5\n• 매일 측정 및 조정 필요',
          ph: '6.0-6.5',
          phDetail: '• 약산성 토양 선호\n• pH 5.5 이하: 생육 불량\n• pH 7.0 이상: 양분 흡수 저해',
          watering: '토양이 항상 촉촉하게 유지',
          wateringDetail: '• 깨끗한 유수 또는 정기적 관수\n• 토양 건조 절대 금지\n• 배수 불량 시 뿌리 썩음 주의',
          fertilizer: '질소:인산:칼륨 = 2:1:2 비율',
          fertilizerDetail: '• N-P-K = 2:1:2 비율 유지\n• 칼슘, 마그네슘 보충 필수\n• 미량 원소 균형 중요'
        },
        nutritionStatus: {
          nitrogen: '적정 (잎 색상 진한 녹색)',
          phosphorus: '적정 (뿌리 발달 양호)',
          potassium: '적정 (병 저항성 우수)',
          calcium: '적정 (세포벽 강화)',
          magnesium: '적정 (엽록소 합성 정상)',
          micronutrients: '균형 잡힌 상태'
        },
        recommendations: [
          '✓ 현재 생육 상태가 매우 양호합니다',
          '✓ EC 농도 1.4 mS/cm 유지 중 - 생육 중기 최적 수준',
          '✓ 온도 16.5°C - 최적 범위 내 유지 중',
          '✓ 습도 75% - 적정 수준 유지 중',
          '✓ 차광 55% - 직사광선 차단 양호',
          '✓ 근경 비대 순조롭게 진행 중',
          '✓ 병해충 징후 없음 - 예방 관리 지속',
          '✓ 6-8개월 후 수확 가능 예상'
        ],
        warnings: [
          '⚠ 온도가 20°C 이상 올라가지 않도록 환기 관리 철저',
          '⚠ 직사광선 노출 시 잎 손상 가능 - 차광막 점검',
          '⚠ 고온기 무름병 예방을 위한 통풍 관리 필수',
          '⚠ 토양 과습 방지 - 배수 상태 정기 점검'
        ],
        diseasePreventionTips: [
          '무름병 예방: 통풍 개선, 과습 방지, 이병주 즉시 제거',
          '잿빛곰팡이병 예방: 습도 관리, 환기, 예방적 살균제 살포',
          '진딧물 예방: 황색 끈끈이 트랩 설치, 천적 활용',
          '응애 예방: 습도 유지, 정기적 관찰, 초기 방제'
        ],
        nextHarvest: '6-8개월 후 (정식 후 18-20개월차)',
        harvestTiming: '근경 직경 3-4cm, 무게 80-120g 도달 시',
        estimatedYield: '250-350g/주 (현재 생육 상태 기준)',
        yieldQuality: '특등급 가능성 높음 (현재 건강 상태 우수)',
        marketPrice: 'kg당 ₩100,000-150,000 (특등급 기준)',
        marketDemand: '높음 - 일식당, 고급 레스토랑 수요 증가',
        profitEstimate: '주당 ₩25,000-45,000 예상 (특등급 기준)'
      });
      setAnalyzing(false);
    }, 2500);
  };

  const recentScans = [
    { crop: '고추냉이', cropId: 'wasabi',     date: '2시간 전', health: '건강', healthScore: 92 },
    { crop: '상추',     cropId: 'lettuce',    date: '1일 전',   health: '양호', healthScore: 85 },
    { crop: '토마토',   cropId: 'tomato',     date: '2일 전',   health: '주의', healthScore: 68 },
  ];

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

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl transition-all duration-300 transform hover:scale-110">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">AI 작물 인식</h1>
          <button className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
            <i className="ri-history-line text-xl text-white"></i>
          </button>
        </div>
      </header>

      {/* Camera Section with 3D Effect */}
      <section className="px-4 pt-6 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl transform hover:rotate-12 transition-transform duration-500">
                <i className="ri-camera-lens-line text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-black drop-shadow-lg">작물 촬영하기</h2>
                <p className="text-sm text-white/90 font-medium">AI가 자동으로 분석합니다</p>
              </div>
              <div className="ml-auto w-16 h-16 animate-bounce flex items-center justify-center" style={{ animationDuration: '3s' }}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <i className="ri-camera-ai-line text-3xl text-white drop-shadow-lg"></i>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowUploadOptions(true)}
              className="w-full bg-white/10 backdrop-blur-md border-2 border-white/30 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-white/20 hover:border-white/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center bg-white/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="ri-camera-line text-3xl"></i>
              </div>
              <p className="text-base font-black mb-1">사진 촬영 또는 업로드</p>
              <p className="text-xs text-white/80 font-medium">작물을 촬영하거나 갤러리에서 선택하세요</p>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ 업로드 옵션 바텀시트 모달 ═══════ */}
      {showUploadOptions && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center animate-fadeIn"
          onClick={() => setShowUploadOptions(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
              <div>
                <p className="text-base font-black text-gray-900">사진 업로드</p>
                <p className="text-xs text-gray-500 mt-0.5">방법을 선택해 주세요</p>
              </div>
              <button
                onClick={() => setShowUploadOptions(false)}
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              {/* 실시간 카메라 */}
              <button
                onClick={() => startCamera()}
                className="w-full flex items-center gap-3 p-4 hover:bg-emerald-50 rounded-2xl transition-all text-left border border-gray-100"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-md flex-shrink-0">
                  <i className="ri-camera-fill text-xl text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900">카메라로 촬영</p>
                  <p className="text-[11px] text-gray-500">실시간 웹캠 연결 후 촬영</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
              </button>

              {/* 모바일 네이티브 카메라 */}
              <label className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all border border-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-md flex-shrink-0">
                  <i className="ri-smartphone-line text-xl text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900">모바일 카메라</p>
                  <p className="text-[11px] text-gray-500">휴대폰 기본 카메라 앱 사용</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
              </label>

              {/* 갤러리 */}
              <label className="w-full flex items-center gap-3 p-4 hover:bg-purple-50 rounded-2xl cursor-pointer transition-all border border-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-md flex-shrink-0">
                  <i className="ri-image-line text-xl text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900">갤러리에서 선택</p>
                  <p className="text-[11px] text-gray-500">저장된 사진 첨부</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
              </label>
            </div>

            <div className="p-3 pt-0">
              <button
                onClick={() => setShowUploadOptions(false)}
                className="w-full p-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors"
              >
                취소
              </button>
            </div>

            {/* iOS safe area */}
            <div style={{ height: 'env(safe-area-inset-bottom)' }} />
          </div>
        </div>
      )}

      {/* ═══════ 실시간 카메라 풀스크린 모달 ═══════ */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          {/* 카메라 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent relative z-10">
            <button
              onClick={closeCamera}
              className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-xl"
            >
              <i className="ri-close-line text-white text-xl" />
            </button>
            <p className="text-white text-sm font-black">AI 작물 분석</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAiOverlayActive(v => !v)}
                className={`h-8 px-2.5 flex items-center gap-1 rounded-lg text-[10px] font-black transition-all ${
                  aiOverlayActive ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white/60'
                }`}
              >
                <i className="ri-robot-2-line text-xs" />
                AI {aiOverlayActive ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={switchCamera}
                className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-xl"
                disabled={!!cameraError}
              >
                <i className="ri-camera-switch-line text-white text-xl" />
              </button>
            </div>
          </div>

          {/* 비디오 영역 */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="text-center px-6">
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-3xl flex items-center justify-center mb-4">
                  <i className="ri-camera-off-line text-4xl text-red-400" />
                </div>
                <p className="text-base font-black text-white mb-2">카메라 사용 불가</p>
                <p className="text-xs text-white/70 leading-relaxed max-w-xs mx-auto">{cameraError}</p>
                <div className="mt-5 flex gap-2 justify-center">
                  <button
                    onClick={() => startCamera()}
                    className="px-4 py-2.5 bg-white text-black rounded-xl font-black text-xs"
                  >
                    다시 시도
                  </button>
                  <label className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    갤러리에서 선택
                  </label>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* AI 실시간 오버레이 (바운딩 박스 + 크기 측정 + 환경 분석 + 병해충 감지) */}
                <CropAIOverlay
                  videoRef={videoRef}
                  active={aiOverlayActive && !cameraError}
                  onCapture={(imageData, aiResult) => {
                    setSelectedImage(imageData);
                    closeCamera();
                    // AI 결과를 기존 분석 결과로 변환
                    setResult({
                      ...result,
                      cropName: aiResult.detections[0]?.label || '고추냉이',
                      confidence: aiResult.detections[0]?.confidence || 0.95,
                      healthScore: aiResult.healthScore,
                      diseases: aiResult.diseaseRisk.filter(d => d.probability > 0.2).map(d => d.name),
                      aiAnalysis: aiResult,
                    });
                  }}
                />
              </>
            )}
          </div>

          {/* 촬영 컨트롤 */}
          {!cameraError && (
            <div className="pb-8 pt-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-8">
              <label className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl cursor-pointer border border-white/20">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <i className="ri-image-line text-xl text-white" />
              </label>
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform ring-4 ring-white/30"
                aria-label="사진 촬영"
              >
                <div className="w-16 h-16 rounded-full bg-white border-4 border-black/80" />
              </button>
              <button
                onClick={switchCamera}
                className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
              >
                <i className="ri-camera-switch-line text-xl text-white" />
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Analysis Result */}
      {selectedImage && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform hover:shadow-3xl transition-all duration-500">
            <div className="relative h-72">
              <img 
                src={selectedImage} 
                alt="촬영된 작물"
                className="w-full h-full object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-scan-line text-3xl animate-pulse"></i>
                      </div>
                    </div>
                    <p className="text-base font-black mb-2">AI 분석 중...</p>
                    <div className="w-48 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-white/80 mt-2 font-medium">{uploadProgress}% 완료</p>
                  </div>
                </div>
              )}
            </div>

            {result && !analyzing && (
              <div className="p-6">
                {/* Crop Info Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{result.cropName}</h3>
                    <p className="text-xs text-gray-500 font-medium italic mb-1">{result.scientificName}</p>
                    <p className="text-xs text-gray-600 font-bold">{result.family}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border-2 border-green-200 shadow-lg">
                      <i className="ri-checkbox-circle-fill text-base text-green-600"></i>
                      <span className="text-sm font-black text-green-700">{result.health}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${result.healthScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 font-bold">{result.healthScore}%</p>
                    </div>
                  </div>
                </div>

                {/* Growth Stage & Harvest Info */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-lg">
                        <i className="ri-plant-line text-sm text-white"></i>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">생육 단계</p>
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-1">{result.growthStage}</p>
                    <p className="text-xs text-gray-600 font-medium">{result.growthStageDetail}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg shadow-lg">
                        <i className="ri-calendar-line text-sm text-white"></i>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">수확 시기</p>
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-1">{result.nextHarvest}</p>
                    <p className="text-xs text-gray-600 font-medium">{result.harvestTiming}</p>
                  </div>
                </div>

                {/* Leaf & Root Analysis */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                      <i className="ri-leaf-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">작물 상태 분석</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                      <p className="text-xs text-gray-500 font-bold mb-3">잎 상태 분석</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">색상</span>
                          <span className="text-xs text-gray-900 font-bold">{result.leafAnalysis.color}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">질감</span>
                          <span className="text-xs text-gray-900 font-bold">{result.leafAnalysis.texture}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">크기</span>
                          <span className="text-xs text-gray-900 font-bold">{result.leafAnalysis.size}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">병해충</span>
                          <span className="text-xs text-green-600 font-bold">{result.leafAnalysis.condition}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                      <p className="text-xs text-gray-500 font-bold mb-3">근경 상태 분석</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">발달 상태</span>
                          <span className="text-xs text-gray-900 font-bold">{result.rootAnalysis.development}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">예상 크기</span>
                          <span className="text-xs text-gray-900 font-bold">{result.rootAnalysis.estimatedSize}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 font-medium">품질</span>
                          <span className="text-xs text-orange-600 font-bold">{result.rootAnalysis.quality}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Environmental Conditions */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg">
                      <i className="ri-dashboard-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">현재 재배 환경</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-temp-hot-line text-sm text-red-600"></i>
                        <span className="text-xs text-gray-600 font-medium">온도</span>
                      </div>
                      <p className="text-base font-black text-gray-900">{result.environmentalConditions.currentTemp}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-drop-line text-sm text-blue-600"></i>
                        <span className="text-xs text-gray-600 font-medium">습도</span>
                      </div>
                      <p className="text-base font-black text-gray-900">{result.environmentalConditions.currentHumidity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-100">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-sun-line text-sm text-yellow-600"></i>
                        <span className="text-xs text-gray-600 font-medium">차광</span>
                      </div>
                      <p className="text-base font-black text-gray-900">{result.environmentalConditions.lightIntensity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-water-flash-line text-sm text-emerald-600"></i>
                        <span className="text-xs text-gray-600 font-medium">토양 수분</span>
                      </div>
                      <p className="text-base font-black text-gray-900">{result.environmentalConditions.soilMoisture}</p>
                    </div>
                  </div>
                </div>

                {/* Disease & Pest Check */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                      <i className="ri-shield-check-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">병충해 진단</h4>
                  </div>
                  {result.diseases.length === 0 && result.pests.length === 0 ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                          <i className="ri-checkbox-circle-fill text-2xl text-white"></i>
                        </div>
                        <div>
                          <p className="text-sm font-black text-green-900 mb-1">병충해 없음</p>
                          <p className="text-xs text-green-700 font-medium">작물이 건강한 상태입니다</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.diseases.map((disease: string, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border-2 border-red-200">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg flex-shrink-0">
                              <i className="ri-alert-line text-lg text-white"></i>
                            </div>
                            <div>
                              <p className="text-sm font-black text-red-900 mb-1">{disease}</p>
                              <p className="text-xs text-red-700 font-medium">즉시 조치가 필요합니다</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nutrition Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                      <i className="ri-flask-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">양분 상태</h4>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">질소 (N)</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.nitrogen}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">인산 (P)</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.phosphorus}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">칼륨 (K)</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.potassium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">칼슘 (Ca)</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.calcium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">마그네슘 (Mg)</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.magnesium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-medium">미량 원소</span>
                        <span className="text-xs text-green-600 font-bold">{result.nutritionStatus.micronutrients}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Cultivation Guide */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg">
                      <i className="ri-book-open-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">상세 재배 가이드</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-temp-hot-line text-sm text-red-600"></i>
                        <p className="text-xs text-gray-700 font-bold">온도 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">{result.cultivationGuide.temperature}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.temperatureDetail}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-drop-line text-sm text-blue-600"></i>
                        <p className="text-xs text-gray-700 font-bold">습도 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">{result.cultivationGuide.humidity}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.humidityDetail}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-sun-line text-sm text-yellow-600"></i>
                        <p className="text-xs text-gray-700 font-bold">광량 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">{result.cultivationGuide.light}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.lightDetail}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-flask-line text-sm text-emerald-600"></i>
                        <p className="text-xs text-gray-700 font-bold">양액 농도 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">EC {result.cultivationGuide.ec} / pH {result.cultivationGuide.ph}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line mb-2">{result.cultivationGuide.ecDetail}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.phDetail}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-water-flash-line text-sm text-cyan-600"></i>
                        <p className="text-xs text-gray-700 font-bold">관수 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">{result.cultivationGuide.watering}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.wateringDetail}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-plant-line text-sm text-purple-600"></i>
                        <p className="text-xs text-gray-700 font-bold">시비 관리</p>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2">{result.cultivationGuide.fertilizer}</p>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{result.cultivationGuide.fertilizerDetail}</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                      <i className="ri-lightbulb-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">재배 권장사항</h4>
                  </div>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg group"
                      >
                        <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg flex-shrink-0 transform group-hover:rotate-12 transition-transform duration-500">
                          <i className="ri-checkbox-circle-line text-white text-xs"></i>
                        </div>
                        <p className="text-xs text-gray-700 flex-1 font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                        <i className="ri-error-warning-line text-lg text-white"></i>
                      </div>
                      <h4 className="text-sm font-black text-gray-900">주의사항</h4>
                    </div>
                    <div className="space-y-2">
                      {result.warnings.map((warning: string, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200"
                        >
                          <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-lg flex-shrink-0">
                            <i className="ri-alert-line text-white text-xs"></i>
                          </div>
                          <p className="text-xs text-orange-900 flex-1 font-medium">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disease Prevention Tips */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                      <i className="ri-shield-line text-lg text-white"></i>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">병해충 예방 관리</h4>
                  </div>
                  <div className="space-y-2">
                    {result.diseasePreventionTips.map((tip: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                      >
                        <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-lg flex-shrink-0">
                          <i className="ri-shield-check-line text-white text-xs"></i>
                        </div>
                        <p className="text-xs text-gray-700 flex-1 font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Info */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg">
                        <i className="ri-money-dollar-circle-line text-lg text-white"></i>
                      </div>
                      <h4 className="text-sm font-black text-gray-900">수익성 정보</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                        <span className="text-xs text-gray-600 font-medium">예상 수확량</span>
                        <span className="text-sm font-black text-gray-900">{result.estimatedYield}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                        <span className="text-xs text-gray-600 font-medium">예상 등급</span>
                        <span className="text-sm font-black text-indigo-600">{result.yieldQuality}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                        <span className="text-xs text-gray-600 font-medium">시장 가격</span>
                        <span className="text-sm font-black text-indigo-600">{result.marketPrice}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                        <span className="text-xs text-gray-600 font-medium">시장 수요</span>
                        <span className="text-sm font-black text-gray-900">{result.marketDemand}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border-2 border-indigo-200">
                        <span className="text-xs text-gray-700 font-bold">예상 수익</span>
                        <span className="text-base font-black text-indigo-600">{result.profitEstimate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-black text-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <i className="ri-save-line text-lg relative z-10 transform group-hover:rotate-12 transition-transform duration-500"></i>
                    <span className="relative z-10">재배 일지 저장</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                      setShowUploadOptions(false);
                    }}
                    className="px-5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all duration-500 transform hover:scale-110 border border-gray-300"
                  >
                    <i className="ri-refresh-line text-lg"></i>
                  </button>
                  <button className="px-5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all duration-500 transform hover:scale-110 border border-gray-300">
                    <i className="ri-share-line text-lg"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Scans */}
      <section className="px-4 pb-6 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">최근 분석 기록</h3>
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            전체보기 <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
        <div className="space-y-3">
          {recentScans.map((scan, index) => (
            <div 
              key={index} 
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-2xl border border-gray-100 flex items-center gap-4 transform hover:scale-[1.02] transition-all duration-500 cursor-pointer group"
            >
              <div className={`relative w-20 h-20 rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${CROP_VISUAL[scan.cropId]?.gradient ?? 'from-gray-300 to-gray-400'}`}>
                <span className="text-3xl">{CROP_VISUAL[scan.cropId]?.emoji ?? '🌱'}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900 mb-1">{scan.crop}</h4>
                <p className="text-xs text-gray-500 font-medium mb-2">{scan.date}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        scan.health === '건강' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        scan.health === '양호' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                      style={{ width: `${scan.healthScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">{scan.healthScore}%</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black shadow-lg ${
                  scan.health === '건강' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' :
                  scan.health === '양호' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200' :
                  'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200'
                }`}>
                  {scan.health}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips with 3D Effect */}
      <section className="px-4 pb-6 relative z-10">
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200 overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex gap-4">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                <i className="ri-lightbulb-line"></i>
                촬영 팁
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                작물 전체가 보이도록 촬영하고, 자연광에서 찍으면 더 정확한 분석이 가능합니다. 흔들림 없이 선명하게 촬영하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}