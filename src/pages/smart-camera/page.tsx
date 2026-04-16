/**
 * AI 스마트 카메라 허브
 *
 * 5가지 AI 카메라 모드:
 *   1. 🌱 작물 상태 분석 — 실시간 색상·형태 분석 → 건강도·생육 단계·이상 징후
 *   2. 📏 사이즈 측정 — 가로·세로·측면·높이 정밀 측정 (참조 보정)
 *   3. 👤 얼굴 인증 — 셀프 카메라 얼굴 감지 → 인증 후 후면 전환
 *   4. ✋ 모션 캡처 — 손동작 학습 → 로봇 티칭
 *   5. 🤖 로봇 자동화 — 재배→수확→세척→포장→배송 전 자동화 파이프라인
 *
 * 추후: TensorFlow.js / MediaPipe Hands / MediaPipe Face / MiDaS depth
 * 현재: Canvas 기반 실시간 분석 + Mock AI (시연용)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

type CameraMode = 'crop' | 'size' | 'face' | 'motion' | 'robot';

const MODES: { id: CameraMode; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'crop',   label: '작물 분석',  icon: 'ri-seedling-line',        desc: '실시간 건강도·병해충·생육 단계', color: 'from-emerald-500 to-teal-600' },
  { id: 'size',   label: '사이즈 측정', icon: 'ri-ruler-line',           desc: '가로·세로·높이·면적 정밀 측정',  color: 'from-cyan-500 to-blue-600' },
  { id: 'face',   label: '얼굴 인증',  icon: 'ri-user-smile-line',      desc: '얼굴 감지 → 인증 → 후면 전환',  color: 'from-purple-500 to-pink-600' },
  { id: 'motion', label: '모션 캡처',  icon: 'ri-hand-heart-line',      desc: '손동작 학습 → 로봇 티칭',       color: 'from-orange-500 to-red-600' },
  { id: 'robot',  label: '로봇 제어',  icon: 'ri-robot-2-line',         desc: '재배→수확→세척→포장 자동화',    color: 'from-gray-700 to-gray-900' },
];

// ── 작물 건강 분석 (Canvas 픽셀 기반 실 분석) ──
function analyzeCropHealth(canvas: HTMLCanvasElement): CropHealthResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return defaultCropHealth();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = data.length / 4;

  let greenSum = 0, brownSum = 0, yellowSum = 0, totalBrightness = 0;
  let greenPixels = 0, brownPixels = 0, yellowPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;

    // 녹색 영역 (건강한 잎)
    if (g > r * 1.2 && g > b * 1.1 && g > 60) {
      greenSum += g;
      greenPixels++;
    }
    // 갈색 영역 (마른 잎·병반)
    if (r > g * 1.1 && r > b * 1.3 && r > 80 && r < 180) {
      brownSum += r;
      brownPixels++;
    }
    // 황색 영역 (영양 결핍)
    if (r > 150 && g > 130 && b < 100) {
      yellowSum += (r + g) / 2;
      yellowPixels++;
    }
  }

  const greenRatio = greenPixels / totalPixels;
  const brownRatio = brownPixels / totalPixels;
  const yellowRatio = yellowPixels / totalPixels;
  const avgBrightness = totalBrightness / totalPixels;

  // 건강도 스코어 (0~100)
  let healthScore = Math.min(100, Math.max(0,
    (greenRatio * 300) - (brownRatio * 200) - (yellowRatio * 150) + 30
  ));

  const issues: string[] = [];
  const prescriptions: string[] = [];

  if (brownRatio > 0.08) {
    issues.push('갈변 부위 감지 (잎 병반 또는 마름 증상)');
    prescriptions.push('병반부 제거 · 살균제 살포 · 통풍 개선');
  }
  if (yellowRatio > 0.06) {
    issues.push('황화 현상 (영양 결핍 또는 과습)');
    prescriptions.push('비료 추가 투입 · 배수 점검 · EC 조절');
  }
  if (greenRatio < 0.1) {
    issues.push('녹색 영역 부족 (촬영 대상 확인 필요)');
    prescriptions.push('작물에 가까이 촬영해 주세요');
    healthScore = Math.min(healthScore, 50);
  }
  if (avgBrightness < 60) {
    issues.push('조도 부족 (촬영 환경이 어둡습니다)');
    prescriptions.push('밝은 곳에서 재촬영 권장');
  }

  const growthStage =
    greenRatio > 0.35 ? '활발한 생육기' :
    greenRatio > 0.2 ? '초기 생육기' :
    greenRatio > 0.1 ? '정식 초기' : '분석 불가 (작물 재촬영)';

  return {
    healthScore: Math.round(healthScore),
    greenRatio: Math.round(greenRatio * 100),
    brownRatio: Math.round(brownRatio * 100),
    yellowRatio: Math.round(yellowRatio * 100),
    brightness: Math.round(avgBrightness),
    growthStage,
    issues,
    prescriptions,
    timestamp: new Date().toISOString(),
  };
}

interface CropHealthResult {
  healthScore: number;
  greenRatio: number;
  brownRatio: number;
  yellowRatio: number;
  brightness: number;
  growthStage: string;
  issues: string[];
  prescriptions: string[];
  timestamp: string;
}

function defaultCropHealth(): CropHealthResult {
  return { healthScore: 0, greenRatio: 0, brownRatio: 0, yellowRatio: 0, brightness: 0, growthStage: '분석 중...', issues: [], prescriptions: [], timestamp: '' };
}

// ── 사이즈 측정 (캔버스 엣지 감지 기반) ──
interface SizeMeasurement {
  widthPx: number; heightPx: number;
  widthCm: string; heightCm: string; depthCm: string; areaCm: string;
  objectType: string;
}

function measureSize(canvas: HTMLCanvasElement): SizeMeasurement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { widthPx: 0, heightPx: 0, widthCm: '—', heightCm: '—', depthCm: '—', areaCm: '—', objectType: '—' };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 간단한 엣지 감지: 중앙 영역에서 가장 큰 "비배경" 영역 크기 추정
  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  const threshold = 40; // 엣지 감도

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = (r + g + b) / 3;

      // 중앙 60% 영역만 분석
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const dx = Math.abs(x - cx) / cx, dy = Math.abs(y - cy) / cy;
      if (dx > 0.7 || dy > 0.7) continue;

      if (brightness > threshold && brightness < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const widthPx = Math.max(0, maxX - minX);
  const heightPx = Math.max(0, maxY - minY);

  // 픽셀 → cm 변환 (1280px 기준 ~30cm 시야각 추정, 추후 참조 보정)
  const pxPerCm = canvas.width / 30;
  const wCm = (widthPx / pxPerCm).toFixed(1);
  const hCm = (heightPx / pxPerCm).toFixed(1);
  const depthCm = ((widthPx * 0.6) / pxPerCm).toFixed(1); // 깊이 추정 (정면 대비 60%)
  const areaCm = (parseFloat(wCm) * parseFloat(hCm)).toFixed(1);

  const ratio = widthPx > 0 ? heightPx / widthPx : 0;
  const objectType =
    ratio > 2 ? '세로 길쭉한 객체' :
    ratio < 0.5 ? '가로 넓은 객체' :
    ratio > 0.8 && ratio < 1.2 ? '정방형 객체' : '직사각형 객체';

  return { widthPx, heightPx, widthCm: wCm, heightCm: hCm, depthCm, areaCm, objectType };
}

// ── 로봇 자동화 파이프라인 ──
const ROBOT_PIPELINE = [
  { id: 'seed',    label: '파종',     icon: 'ri-seedling-line',       status: 'ready' as const, desc: 'AI 최적 파종 시기 판단 → 자동 파종기 작동' },
  { id: 'grow',    label: '재배 관리', icon: 'ri-plant-line',          status: 'ready' as const, desc: '센서 기반 관수·양분·조명 자동 제어' },
  { id: 'monitor', label: 'AI 모니터링', icon: 'ri-eye-line',          status: 'active' as const, desc: '24시간 카메라 촬영 → 생육 상태 실시간 분석' },
  { id: 'harvest', label: '수확',     icon: 'ri-scissors-2-line',     status: 'ready' as const, desc: '크기·숙성도 AI 판단 → 로봇 팔 자동 수확' },
  { id: 'sort',    label: '선별',     icon: 'ri-filter-3-line',       status: 'ready' as const, desc: '등급별 자동 분류 (상·중·하)' },
  { id: 'wash',    label: '세척',     icon: 'ri-drop-line',           status: 'ready' as const, desc: '자동 세척 라인 → 이물질 제거' },
  { id: 'pack',    label: '포장',     icon: 'ri-gift-line',           status: 'ready' as const, desc: '중량 자동 측정 → 진공/일반 포장' },
  { id: 'ship',    label: '출하 대기', icon: 'ri-truck-line',          status: 'ready' as const, desc: '냉장 보관 → 배송 연계' },
];

export default function SmartCameraPage() {
  const [mode, setMode] = useState<CameraMode>('crop');
  const [cameraActive, setCameraActive] = useState(false);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);

  // 작물 분석 결과
  const [cropHealth, setCropHealth] = useState<CropHealthResult>(defaultCropHealth());
  // 사이즈 측정 결과
  const [sizeMeasure, setSizeMeasure] = useState<SizeMeasurement | null>(null);
  // 얼굴 감지
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceAuthenticated, setFaceAuthenticated] = useState(false);
  // 모션 캡처
  const [gestureRecording, setGestureRecording] = useState(false);
  const [gestureCount, setGestureCount] = useState(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setCameraActive(false);
  }, []);

  const startCamera = async (face: 'environment' | 'user' = facing) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('카메라 미지원 브라우저');
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : '카메라 오류');
    }
  };

  // 실시간 분석 루프
  const analysisLoop = useCallback(() => {
    if (!cameraActive || !videoRef.current || !analysisCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;
    if (video.videoWidth === 0) {
      frameRef.current = requestAnimationFrame(analysisLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    if (mode === 'crop') {
      setCropHealth(analyzeCropHealth(canvas));
    } else if (mode === 'size') {
      setSizeMeasure(measureSize(canvas));
    } else if (mode === 'face') {
      // 얼굴 감지 Mock (중앙 영역 피부색 비율)
      const imgData = ctx.getImageData(canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.4, canvas.height * 0.5);
      let skinPixels = 0;
      for (let i = 0; i < imgData.data.length; i += 16) {
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
        if (r > 100 && g > 60 && b > 40 && r > g && r > b && (r - g) > 15) skinPixels++;
      }
      const skinRatio = skinPixels / (imgData.data.length / 16);
      setFaceDetected(skinRatio > 0.15);
    }

    frameRef.current = requestAnimationFrame(analysisLoop);
  }, [cameraActive, mode]);

  useEffect(() => {
    if (cameraActive) {
      frameRef.current = requestAnimationFrame(analysisLoop);
    }
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [cameraActive, analysisLoop]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // 모드 전환 시 카메라 방향 자동 설정
  useEffect(() => {
    if (mode === 'face') {
      setFacing('user');
      if (cameraActive) startCamera('user');
    } else {
      setFacing('environment');
      if (cameraActive) startCamera('environment');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const activeMode = MODES.find(m => m.id === mode)!;

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* 헤더 */}
      <header className="bg-gray-900/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800 transition-colors">
            <i className="ri-arrow-left-line text-xl text-gray-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <i className="ri-camera-ai-line text-emerald-400" />
              AI 스마트 카메라
            </h1>
            <p className="text-[10px] text-gray-400">{activeMode.desc}</p>
          </div>
          {cameraActive && (
            <span className="flex items-center gap-1.5 bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-300">LIVE</span>
            </span>
          )}
        </div>

        {/* 모드 탭 (가로 스크롤) */}
        <div className="px-3 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {MODES.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                mode === m.id
                  ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <i className={m.icon} />
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* 카메라 뷰 (모드 공통) */}
      {mode !== 'robot' && (
        <section className="relative">
          {!cameraActive ? (
            <div className="aspect-[4/3] bg-gray-900 flex flex-col items-center justify-center gap-4">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${activeMode.color} flex items-center justify-center shadow-2xl`}>
                <i className={`${activeMode.icon} text-4xl text-white`} />
              </div>
              <p className="text-white font-black text-base">{activeMode.label}</p>
              <p className="text-gray-400 text-xs text-center max-w-xs">{activeMode.desc}</p>
              <button
                type="button"
                onClick={() => startCamera(mode === 'face' ? 'user' : 'environment')}
                className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${activeMode.color} text-white font-black text-sm shadow-xl`}
              >
                <i className="ri-camera-line mr-1.5" />
                카메라 시작
              </button>
              {cameraError && (
                <p className="text-red-400 text-xs text-center px-4">{cameraError}</p>
              )}
            </div>
          ) : (
            <div className="relative aspect-[4/3] bg-black overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={analysisCanvasRef} className="hidden" />

              {/* 모드별 오버레이 */}
              {mode === 'crop' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg ${
                      cropHealth.healthScore >= 80 ? 'bg-emerald-500' :
                      cropHealth.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {cropHealth.healthScore}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-black text-sm">건강도 {cropHealth.healthScore}%</p>
                      <p className="text-emerald-300 text-[11px] font-bold">{cropHealth.growthStage}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-black">녹색 {cropHealth.greenRatio}%</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[9px] font-black">황화 {cropHealth.yellowRatio}%</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-300 text-[9px] font-black">갈변 {cropHealth.brownRatio}%</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[9px] font-black">조도 {cropHealth.brightness}</span>
                  </div>
                  {cropHealth.issues.length > 0 && (
                    <div className="space-y-1">
                      {cropHealth.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <i className="ri-error-warning-line text-amber-400 text-xs mt-0.5" />
                          <p className="text-amber-200 text-[10px] leading-tight">{issue}</p>
                        </div>
                      ))}
                      {cropHealth.prescriptions.map((rx, i) => (
                        <div key={`rx-${i}`} className="flex items-start gap-1.5">
                          <i className="ri-medicine-bottle-line text-cyan-400 text-xs mt-0.5" />
                          <p className="text-cyan-200 text-[10px] leading-tight">처방: {rx}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mode === 'size' && sizeMeasure && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* 측정 프레임 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-cyan-400"
                    style={{
                      width: `${Math.min(80, (sizeMeasure.widthPx / (analysisCanvasRef.current?.width || 1)) * 100)}%`,
                      height: `${Math.min(80, (sizeMeasure.heightPx / (analysisCanvasRef.current?.height || 1)) * 100)}%`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
                    <p className="text-cyan-300 text-xs font-black mb-2">{sizeMeasure.objectType}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div><p className="text-[8px] text-gray-400">가로</p><p className="text-sm font-black text-white" translate="no">{sizeMeasure.widthCm}cm</p></div>
                      <div><p className="text-[8px] text-gray-400">세로</p><p className="text-sm font-black text-white" translate="no">{sizeMeasure.heightCm}cm</p></div>
                      <div><p className="text-[8px] text-gray-400">측면(추정)</p><p className="text-sm font-black text-white" translate="no">{sizeMeasure.depthCm}cm</p></div>
                      <div><p className="text-[8px] text-gray-400">면적</p><p className="text-sm font-black text-white" translate="no">{sizeMeasure.areaCm}cm²</p></div>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1">* 참조 객체 보정 전 추정값 · 정확도 향상을 위해 기준자를 함께 촬영</p>
                  </div>
                </div>
              )}

              {mode === 'face' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-48 h-56 rounded-[40%] border-4 transition-colors duration-500 ${
                    faceAuthenticated ? 'border-emerald-400' :
                    faceDetected ? 'border-amber-400 animate-pulse' : 'border-white/30'
                  }`} />
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    {faceAuthenticated ? (
                      <div className="bg-emerald-500/90 backdrop-blur-xl rounded-2xl px-6 py-3 mx-auto inline-block">
                        <p className="text-white font-black text-sm">✅ 인증 완료 · 후면 카메라로 전환하세요</p>
                      </div>
                    ) : faceDetected ? (
                      <button
                        type="button"
                        className="bg-amber-500/90 backdrop-blur-xl rounded-2xl px-6 py-3 mx-auto inline-block pointer-events-auto"
                        onClick={() => setFaceAuthenticated(true)}
                      >
                        <p className="text-white font-black text-sm">👤 얼굴 감지됨 · 탭하여 인증</p>
                      </button>
                    ) : (
                      <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-3 mx-auto inline-block">
                        <p className="text-white/70 font-black text-sm">얼굴을 프레임 안에 맞춰 주세요</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'motion' && (
                <div className="absolute inset-0">
                  {/* 손 감지 가이드 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-orange-400/50 rounded-3xl" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-orange-300 text-xs font-black">
                        <i className="ri-hand-heart-line mr-1" />
                        {gestureRecording ? '🔴 녹화 중...' : '손동작 학습 모드'}
                      </p>
                      <span className="text-[10px] text-gray-400" translate="no">학습된 동작: {gestureCount}개</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (gestureRecording) {
                            setGestureRecording(false);
                            setGestureCount(prev => prev + 1);
                          } else {
                            setGestureRecording(true);
                          }
                        }}
                        className={`flex-1 py-3 rounded-xl font-black text-sm ${
                          gestureRecording
                            ? 'bg-red-500 text-white'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        }`}
                      >
                        {gestureRecording ? '⏹ 녹화 중지' : '⏺ 동작 녹화 시작'}
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('향후 로봇 연결 시 학습된 동작을 전송합니다.')}
                        className="px-4 py-3 bg-gray-700 text-white rounded-xl font-black text-sm"
                        disabled={gestureCount === 0}
                      >
                        🤖 전송
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">
                      손을 프레임 안에 두고 동작을 천천히 반복하세요. 로봇에게 전송하면 동일 동작을 자동으로 학습합니다.
                      추후 MediaPipe Hands 연동으로 21개 관절 포인트 실시간 추적.
                    </p>
                  </div>
                </div>
              )}

              {/* 카메라 닫기 */}
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-xl rounded-xl flex items-center justify-center z-30"
              >
                <i className="ri-close-line text-white text-xl" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ═══ 로봇 자동화 파이프라인 (모드 5) ═══ */}
      {mode === 'robot' && (
        <section className="px-4 pt-5 space-y-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-5 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <i className="ri-robot-2-line text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg">로봇 자동화 파이프라인</h2>
                <p className="text-gray-400 text-xs mt-0.5">재배 → 수확 → 세척 → 포장 → 출하</p>
              </div>
            </div>

            <div className="space-y-2">
              {ROBOT_PIPELINE.map((step, i) => (
                <div key={step.id} className="flex items-start gap-3">
                  {/* 타임라인 커넥터 */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      step.status === 'active'
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse'
                        : 'bg-gray-700'
                    }`}>
                      <i className={`${step.icon} text-white text-lg`} />
                    </div>
                    {i < ROBOT_PIPELINE.length - 1 && (
                      <div className={`w-0.5 h-6 ${step.status === 'active' ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-black text-sm">{step.label}</p>
                      {step.status === 'active' && (
                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          활성
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-200 text-xs font-black mb-1">향후 로봇 연동 계획</p>
                <ul className="text-blue-300/80 text-[10px] space-y-0.5 leading-relaxed">
                  <li>• 모션 캡처 모드에서 학습한 손동작을 로봇 팔에 전송</li>
                  <li>• AI 카메라가 작물 크기·숙성도 판단 → 로봇 자동 수확 명령</li>
                  <li>• 컨베이어 벨트 연동 → 세척·선별·포장 자동화</li>
                  <li>• 실시간 모니터링 대시보드에서 전 공정 원격 제어</li>
                  <li>• MQTT/ROS2 프로토콜로 로봇 통신</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}
