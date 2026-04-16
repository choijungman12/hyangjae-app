/**
 * CropAIOverlay — 카메라 피드 위에 실시간 AI 분석 오버레이
 *
 * ✅ 실제 Canvas 픽셀 분석 기반 (Mock 랜덤 아님)
 * - 녹색/갈색/황색 비율로 작물 유무 판단
 * - 작물 미감지 시 "작물이 감지되지 않았습니다" 표시
 * - 촬영 시 분석 데이터를 결과 화면에 전달
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface CropAIOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  onCapture?: (imageData: string, analysis: AIAnalysisResult) => void;
}

export interface AIAnalysisResult {
  detected: boolean;
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

function analyzeFrame(canvas: HTMLCanvasElement): AIAnalysisResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return emptyResult();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = data.length / 4;

  let greenPixels = 0, brownPixels = 0, yellowPixels = 0, totalBrightness = 0;

  for (let i = 0; i < data.length; i += 8) { // 2px 간격 샘플링 (성능)
    const r = data[i], g = data[i + 1], b = data[i + 2];
    totalBrightness += (r + g + b) / 3;

    if (g > r * 1.15 && g > b * 1.1 && g > 50) greenPixels++;
    if (r > g * 1.1 && r > b * 1.3 && r > 80 && r < 200) brownPixels++;
    if (r > 140 && g > 120 && b < 100) yellowPixels++;
  }

  const sampleCount = totalPixels / 2;
  const greenRatio = Math.round((greenPixels / sampleCount) * 100);
  const brownRatio = Math.round((brownPixels / sampleCount) * 100);
  const yellowRatio = Math.round((yellowPixels / sampleCount) * 100);
  const brightness = Math.round(totalBrightness / sampleCount);

  // 작물 감지 기준: 녹색 비율 8% 이상
  const detected = greenRatio >= 8;

  if (!detected) {
    return {
      detected: false,
      healthScore: 0,
      greenRatio, brownRatio, yellowRatio, brightness,
      growthStage: '작물 미감지',
      issues: ['화면에 작물이 감지되지 않았습니다'],
      prescriptions: ['카메라를 작물 가까이 가져가 주세요'],
      timestamp: new Date().toISOString(),
    };
  }

  let healthScore = Math.min(100, Math.max(0,
    (greenRatio * 2.5) - (brownRatio * 3) - (yellowRatio * 2) + 40
  ));

  const issues: string[] = [];
  const prescriptions: string[] = [];

  if (brownRatio > 10) {
    issues.push(`갈변 ${brownRatio}% — 잎 병반 또는 마름 증상`);
    prescriptions.push('병반부 즉시 제거 · 살균제 살포 · 통풍 개선');
    healthScore -= 10;
  }
  if (yellowRatio > 8) {
    issues.push(`황화 ${yellowRatio}% — 영양 결핍 또는 과습 징후`);
    prescriptions.push('비료 추가 투입 · 배수 점검 · EC 값 확인');
    healthScore -= 8;
  }
  if (brightness < 50) {
    issues.push('조도 부족 — 촬영 환경이 어둡습니다');
    prescriptions.push('밝은 곳에서 재촬영 또는 보조광 사용');
  }
  if (greenRatio > 40 && brownRatio < 3 && yellowRatio < 3) {
    issues.push('✅ 양호 — 뚜렷한 이상 징후 없음');
    prescriptions.push('현재 관리 방식 유지 · 정기 모니터링 지속');
  }

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  const growthStage =
    greenRatio > 35 ? '활발한 생육기 (잎 밀도 높음)' :
    greenRatio > 20 ? '중기 생육 (성장 진행 중)' :
    greenRatio > 8  ? '초기 생육 (정식 후 발아)' : '작물 미감지';

  return {
    detected, healthScore, greenRatio, brownRatio, yellowRatio, brightness,
    growthStage, issues, prescriptions,
    timestamp: new Date().toISOString(),
  };
}

function emptyResult(): AIAnalysisResult {
  return {
    detected: false, healthScore: 0, greenRatio: 0, brownRatio: 0, yellowRatio: 0,
    brightness: 0, growthStage: '대기 중', issues: [], prescriptions: [], timestamp: '',
  };
}

export default function CropAIOverlay({ videoRef, active, onCapture }: CropAIOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult>(emptyResult());
  const [showPanel, setShowPanel] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1초마다 실시간 분석
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      setAnalysis(analyzeFrame(canvas));
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, videoRef]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    const finalAnalysis = analyzeFrame(canvas);
    onCapture?.(imageData, finalAnalysis);
  };

  if (!active) return null;

  const scoreColor =
    !analysis.detected ? 'bg-gray-500' :
    analysis.healthScore >= 80 ? 'bg-emerald-500' :
    analysis.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      {/* 상단 상태 바 */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2">
        <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${scoreColor} ${analysis.detected ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black text-white">
            {analysis.detected ? 'AI 작물 감지' : '작물 미감지'}
          </span>
          {analysis.detected && (
            <>
              <span className="text-[10px] text-white/60">·</span>
              <span className="text-[10px] font-black text-emerald-300" translate="no">
                건강도 {analysis.healthScore}%
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowPanel(v => !v)}
          className="w-9 h-9 bg-black/60 backdrop-blur-xl rounded-xl flex items-center justify-center text-white"
        >
          <i className={`ri-${showPanel ? 'eye-off' : 'eye'}-line text-sm`} />
        </button>
      </div>

      {/* 하단 분석 패널 */}
      {showPanel && (
        <div className="absolute bottom-16 left-2 right-2 z-20 bg-black/70 backdrop-blur-xl rounded-2xl p-3 max-h-52 overflow-y-auto">
          {!analysis.detected ? (
            <div className="text-center py-4">
              <i className="ri-camera-lens-line text-3xl text-gray-400 mb-2" />
              <p className="text-white font-black text-sm">작물이 감지되지 않았습니다</p>
              <p className="text-gray-400 text-[11px] mt-1">카메라를 작물(잎·줄기) 가까이 가져가 주세요</p>
            </div>
          ) : (
            <>
              {/* 지표 배지 */}
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-black">녹색 {analysis.greenRatio}%</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[9px] font-black">황화 {analysis.yellowRatio}%</span>
                <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-300 text-[9px] font-black">갈변 {analysis.brownRatio}%</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[9px] font-black">조도 {analysis.brightness}</span>
              </div>

              {/* 생육 단계 */}
              <p className="text-emerald-300 text-[11px] font-black mb-2">📊 {analysis.growthStage}</p>

              {/* 이상 징후 + 처방 */}
              {analysis.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <i className={`${issue.startsWith('✅') ? 'ri-checkbox-circle-line text-emerald-400' : 'ri-error-warning-line text-amber-400'} text-xs mt-0.5`} />
                  <p className="text-white/80 text-[10px] leading-tight">{issue}</p>
                </div>
              ))}
              {analysis.prescriptions.map((rx, i) => (
                <div key={`rx-${i}`} className="flex items-start gap-1.5 mb-1">
                  <i className="ri-medicine-bottle-line text-cyan-400 text-xs mt-0.5" />
                  <p className="text-cyan-200 text-[10px] leading-tight">{rx}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 촬영 버튼 */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center">
        <button
          type="button"
          onClick={handleCapture}
          className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-400 active:scale-90 transition-transform"
          aria-label="AI 분석 촬영"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-camera-line text-2xl text-white" />
          </div>
        </button>
      </div>
    </>
  );
}
