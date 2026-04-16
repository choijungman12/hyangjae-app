import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import CropAIOverlay from '@/components/CropAIOverlay';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';
import { identifyPlant, PLANT_ID_CONFIGURED } from '@/lib/plantIdApi';

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

  /**
   * 실제 이미지 픽셀 분석 기반 작물 식별 + 건강 분석
   * - 색상 분포로 식물 유형 추정 (녹색 잎, 꽃, 흙, 줄기 등)
   * - 건강도: 녹색 비율 + 갈변 비율 + 황화 비율 종합
   * - 추후 TensorFlow.js 모델 연동 시 이 함수만 교체
   */
  const analyzeImage = (imageUrl?: string) => {
    setAnalyzing(true);
    setUploadProgress(0);
    setResult(null);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) { clearInterval(progressIntervalRef.current!); return 100; }
        return prev + 10;
      });
    }, 200);

    // 실제 이미지 로드 → Canvas 픽셀 분석 + Plant.id API 식별
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      // ── Plant.id API로 정확한 식물 식별 시도 ──
      let aiName = '';
      let aiScientific = '';
      let aiFamily = '';
      let aiConfidence = 0;
      let aiDescription = '';
      let aiDiseases: string[] = [];
      let aiSource: 'plantnet' | 'color-fallback' = 'color-fallback';

      if (PLANT_ID_CONFIGURED && imageUrl) {
        try {
          const plantResult = await identifyPlant(imageUrl);
          if (plantResult.success) {
            aiName = plantResult.name;
            aiScientific = plantResult.scientificName;
            aiFamily = plantResult.family;
            aiConfidence = plantResult.probability;
            aiDescription = plantResult.description;
            aiDiseases = plantResult.diseases.map(d => `${d.name} (${(d.probability * 100).toFixed(0)}%)`);
            aiSource = 'plantnet';
          }
        } catch { /* API 실패 시 색상 분석 fallback */ }
      }

      // ── Canvas 픽셀 분석 (색상 기반 건강도 + 크기 측정) ──
      const cvs = document.createElement('canvas');
      const w = Math.min(img.width, 640); // 성능을 위해 640px로 다운스케일
      const h = Math.round((img.height / img.width) * w);
      cvs.width = w;
      cvs.height = h;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const total = data.length / 4;

      let greenPx = 0, brownPx = 0, yellowPx = 0, redPx = 0, brightPx = 0;
      let rSum = 0, gSum = 0, bSum = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], bl = data[i + 2];
        rSum += r; gSum += g; bSum += bl;
        const brightness = (r + g + bl) / 3;
        if (brightness > 200) brightPx++;
        if (g > r * 1.15 && g > bl * 1.1 && g > 50) greenPx++;
        if (r > g * 1.1 && r > bl * 1.3 && r > 80 && r < 200) brownPx++;
        if (r > 140 && g > 120 && bl < 100) yellowPx++;
        if (r > 150 && g < 80 && bl < 80) redPx++;
      }

      const greenR = Math.round((greenPx / total) * 100);
      const brownR = Math.round((brownPx / total) * 100);
      const yellowR = Math.round((yellowPx / total) * 100);
      const redR = Math.round((redPx / total) * 100);
      const avgR = Math.round(rSum / total);
      const avgG = Math.round(gSum / total);
      const avgB = Math.round(bSum / total);
      const brightR = Math.round((brightPx / total) * 100);

      // ── 식물 유형 추정 (색상 분포 기반) ──
      let cropName = '미확인 식물';
      let scientificName = 'Unknown species';
      let family = '판별 불가';
      let plantType: 'leaf' | 'flower' | 'fruit' | 'none' = 'none';

      if (greenR >= 25) {
        plantType = 'leaf';
        if (greenR > 40 && avgG > avgR * 1.3) {
          cropName = '엽채류 (쌈채소 계열)';
          scientificName = 'Lactuca / Perilla 추정';
          family = '국화과 또는 꿀풀과';
        } else if (greenR > 25 && brownR > 8) {
          cropName = '허브류 또는 근경 식물';
          scientificName = 'Eutrema / Ocimum 추정';
          family = '십자화과 또는 꿀풀과';
        } else {
          cropName = '녹색 엽채류';
          scientificName = '상세 판별은 AI 모델 연동 필요';
          family = '엽채류 추정';
        }
      } else if (redR > 10 || (avgR > 150 && avgG < 100)) {
        plantType = 'fruit';
        if (redR > 15) {
          cropName = '과실류 (딸기·토마토 계열)';
          scientificName = 'Fragaria / Solanum 추정';
          family = '장미과 또는 가지과';
        } else {
          cropName = '붉은 열매 식물';
          scientificName = '상세 판별은 AI 모델 연동 필요';
          family = '과실류 추정';
        }
      } else if (yellowR > 10) {
        plantType = 'flower';
        cropName = '황색 꽃 또는 숙성 과실';
        scientificName = '상세 판별은 AI 모델 연동 필요';
        family = '판별 중';
      } else if (greenR < 5 && brownR < 5) {
        cropName = '식물이 감지되지 않았습니다';
        scientificName = '작물이 아닌 객체로 판단됩니다';
        family = '해당 없음';
      } else {
        cropName = '미확인 식물 (촬영 조건 확인)';
        scientificName = '더 가까이서 재촬영 권장';
        family = '판별 불가';
      }

      // ── 건강도 계산 ──
      let healthScore = 0;
      let health = '분석 불가';
      if (plantType !== 'none') {
        healthScore = Math.min(100, Math.max(0,
          (greenR * 2) - (brownR * 3) - (yellowR * 1.5) + 45
        ));
        health = healthScore >= 85 ? '매우 건강' :
                 healthScore >= 70 ? '건강' :
                 healthScore >= 50 ? '주의 필요' :
                 healthScore >= 30 ? '이상 징후' : '위험';
      }

      // ── 잎 크기 추정 (녹색 영역 바운딩 박스) ──
      let leafMinX = w, leafMaxX = 0, leafMinY = h, leafMaxY = 0;
      for (let y = 0; y < h; y += 3) {
        for (let x = 0; x < w; x += 3) {
          const idx = (y * w + x) * 4;
          const gr = data[idx + 1];
          if (gr > data[idx] * 1.1 && gr > 50) {
            if (x < leafMinX) leafMinX = x;
            if (x > leafMaxX) leafMaxX = x;
            if (y < leafMinY) leafMinY = y;
            if (y > leafMaxY) leafMaxY = y;
          }
        }
      }
      const leafWidthPx = Math.max(0, leafMaxX - leafMinX);
      const leafHeightPx = Math.max(0, leafMaxY - leafMinY);
      const pxPerCm = w / 25; // 카메라 25cm 시야각 추정
      const leafWidthCm = (leafWidthPx / pxPerCm).toFixed(1);
      const leafHeightCm = (leafHeightPx / pxPerCm).toFixed(1);

      // ── 이상 징후 + 처방 ──
      const diseases: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (plantType !== 'none') {
        if (brownR > 10) { diseases.push('갈변 감지 — 잎 병반 또는 마름 증상'); warnings.push('⚠ 병반부 즉시 제거 · 살균제 살포 · 통풍 개선'); }
        if (yellowR > 8) { diseases.push('황화 감지 — 영양 결핍 또는 과습'); warnings.push('⚠ 비료 투입 · 배수 점검 · EC 확인'); }
        if (greenR > 30 && brownR < 5 && yellowR < 5) { recommendations.push('✓ 잎 색상 양호 — 현재 관리 방식 유지'); }
        if (healthScore >= 80) { recommendations.push('✓ 전반적으로 건강한 상태입니다'); }
        if (healthScore < 50) { warnings.push('⚠ 건강도가 낮습니다 — 환경 점검 필요'); }
        recommendations.push(`✓ 감지된 식물 유형: ${cropName}`);
        recommendations.push(`✓ 추정 잎 크기: ${leafWidthCm}cm × ${leafHeightCm}cm`);
      } else {
        recommendations.push('작물에 더 가까이 카메라를 가져가 주세요');
        recommendations.push('밝은 곳에서 촬영하면 정확도가 올라갑니다');
      }

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setUploadProgress(100);

      // Plant.id AI 결과가 있으면 우선 사용, 없으면 색상 분석 결과
      const finalCropName = aiSource === 'plantnet' ? aiName : cropName;
      const finalScientific = aiSource === 'plantnet' ? aiScientific : scientificName;
      const finalFamily = aiSource === 'plantnet' ? aiFamily : family;
      const finalDiseases = aiSource === 'plantnet' && aiDiseases.length > 0 ? aiDiseases : diseases;

      if (aiSource === 'plantnet') {
        recommendations.unshift(`🤖 Plant.id AI 식별: ${aiName} (신뢰도 ${(aiConfidence * 100).toFixed(0)}%)`);
        if (aiDescription) recommendations.push(`📋 ${aiDescription.slice(0, 100)}...`);
      } else {
        recommendations.unshift('💡 Plant.id API 키 설정 시 46만종 정확한 식물 식별 가능');
        recommendations.push('현재: 색상 분포 기반 분석 (형태·줄기·꽃 분석은 AI 모델 필요)');
      }

      setResult({
        cropName: finalCropName,
        scientificName: finalScientific,
        family: finalFamily,
        growthStage: plantType === 'leaf' ? (greenR > 35 ? '활발한 생육기' : '초기~중기 생육') : (plantType === 'fruit' ? '결실기' : '판별 불가'),
        growthStageDetail: `녹색 ${greenR}% · 갈변 ${brownR}% · 황화 ${yellowR}% · 적색 ${redR}%` + (aiSource === 'plantnet' ? ` · AI: ${aiName}` : ''),
        health: aiSource === 'plantnet' ? (aiConfidence > 0.5 ? '식별 완료' : health) : health,
        healthScore,
        diseases: finalDiseases,
        pests: [],
        leafAnalysis: {
          color: `평균 RGB (${avgR}, ${avgG}, ${avgB})`,
          texture: greenR > 30 ? '녹색 잎 밀도 높음' : '녹색 영역 부족',
          size: plantType !== 'none' ? `약 ${leafWidthCm}cm × ${leafHeightCm}cm (추정)` : '측정 불가',
          condition: brownR > 10 ? `갈변 ${brownR}% 감지 — 점검 필요` : brownR > 5 ? `경미한 갈변 ${brownR}%` : '이상 없음'
        },
        rootAnalysis: {
          development: plantType !== 'none' ? '촬영 이미지에서 근경 확인 불가 (지상부만 분석)' : '—',
          estimatedSize: '—',
          quality: '근경 분석은 별도 촬영 필요'
        },
        environmentalConditions: {
          currentTemp: '촬영 환경 측정 불가 (IoT 센서 연동 필요)',
          currentHumidity: '—',
          lightIntensity: brightR > 40 ? `밝음 (밝은 픽셀 ${brightR}%)` : brightR > 15 ? '보통' : `어두움 (밝은 픽셀 ${brightR}%)`,
          soilMoisture: '—'
        },
        cultivationGuide: {
          temperature: plantType === 'leaf' ? '15-25°C (엽채류 적정)' : '10-30°C (일반)',
          temperatureDetail: '• AI 판별 기반 일반 가이드\n• 정확한 품종 확인 후 수정 필요',
          humidity: '60-80% (일반 범위)',
          humidityDetail: '• 품종별 차이 있음\n• IoT 센서 연동 시 실시간 제공',
          light: greenR > 30 ? '현재 충분한 광량' : '광량 보충 권장',
          lightDetail: `• 촬영 이미지 밝은 픽셀: ${brightR}%`,
          ec: '1.0-2.0 mS/cm (일반)',
          ecDetail: '• 품종 확인 후 정확한 범위 제공',
          ph: '5.5-7.0 (일반)',
          phDetail: '• 품종별 선호 pH 상이',
          watering: '토양 표면 건조 시 관수',
          wateringDetail: '• 과습 주의',
          fertilizer: 'N-P-K 균형 시비',
          fertilizerDetail: '• 생육 단계에 따라 조절'
        },
        nutritionStatus: {
          nitrogen: greenR > 30 ? '충분 (짙은 녹색)' : '부족 가능 (연한 녹색)',
          phosphorus: '촬영만으로 판별 어려움',
          potassium: '촬영만으로 판별 어려움',
          calcium: '촬영만으로 판별 어려움',
          magnesium: yellowR > 8 ? '부족 가능 (잎맥간 황화 감지)' : '정상 추정',
          micronutrients: '정밀 분석은 엽분석 검사 필요'
        },
        recommendations,
        warnings,
        diseasePreventionTips: [
          brownR > 5 ? '갈변 예방: 통풍 개선, 과습 방지, 이병주 즉시 제거' : '현재 병반 미감지 — 예방 관리 지속',
          '잿빛곰팡이병 예방: 습도 관리, 환기, 예방적 살균제 살포',
          '진딧물 예방: 황색 끈끈이 트랩 설치, 천적 활용',
          '응애 예방: 습도 유지, 정기적 관찰, 초기 방제'
        ],
        nextHarvest: plantType !== 'none' ? '품종 확인 후 수확 시기 안내' : '—',
        harvestTiming: plantType === 'leaf' ? '외엽 30cm 이상 시 수확 가능' : '품종별 상이',
        estimatedYield: plantType !== 'none' ? '정밀 분석 시 수확량 예측 가능' : '—',
        yieldQuality: health,
        marketPrice: '품종 확인 후 시세 조회 가능 (KAMIS 연동)',
        marketDemand: '—',
        profitEstimate: '수익성 분석 페이지에서 시뮬레이션 가능'
      });
      setAnalyzing(false);
    };
    img.onerror = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setUploadProgress(100);
      setResult({
        cropName: '이미지 분석 실패',
        scientificName: '이미지를 불러올 수 없습니다',
        family: '—',
        growthStage: '—', growthStageDetail: '—',
        health: '분석 불가', healthScore: 0,
        diseases: [], pests: [],
        leafAnalysis: { color: '—', texture: '—', size: '—', condition: '—' },
        rootAnalysis: { development: '—', estimatedSize: '—', quality: '—' },
        environmentalConditions: { currentTemp: '—', currentHumidity: '—', lightIntensity: '—', soilMoisture: '—' },
        cultivationGuide: { temperature: '—', temperatureDetail: '', humidity: '—', humidityDetail: '', light: '—', lightDetail: '', ec: '—', ecDetail: '', ph: '—', phDetail: '', watering: '—', wateringDetail: '', fertilizer: '—', fertilizerDetail: '' },
        nutritionStatus: { nitrogen: '—', phosphorus: '—', potassium: '—', calcium: '—', magnesium: '—', micronutrients: '—' },
        recommendations: ['다시 촬영해 주세요'], warnings: [], diseasePreventionTips: [],
        nextHarvest: '—', harvestTiming: '—', estimatedYield: '—', yieldQuality: '—', marketPrice: '—', marketDemand: '—', profitEstimate: '—',
      });
      setAnalyzing(false);
    };
    img.src = imageUrl || '';
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
                  onCapture={(imageData) => {
                    // 촬영된 이미지를 설정하고 기존 분석 흐름(analyzeImage)으로 연결
                    setSelectedImage(imageData);
                    closeCamera();
                    analyzeImage(imageData);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </div>

          {/* 촬영 컨트롤 — AI 오버레이가 OFF일 때만 기본 컨트롤 표시 (AI ON 시에는 오버레이 내부 버튼 사용) */}
          {!cameraError && !aiOverlayActive && (
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