/**
 * CropAIOverlay — 카메라 피드 위에 실시간 AI 분석 오버레이
 *
 * 기능:
 * 1. 실시간 작물 감지 바운딩 박스 (mock, 추후 TensorFlow.js 연동)
 * 2. 크기 측정 (참조 객체 기반 추정)
 * 3. 모션 감지 (프레임 간 변화 추적)
 * 4. 식생 건강도 실시간 스코어
 * 5. 병해충 위험도 표시
 *
 * PC: 웹캠 연결 · 모바일: 후면 카메라 자동 연결
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface CropAIOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  onCapture?: (imageData: string, analysis: AIAnalysisResult) => void;
}

export interface AIAnalysisResult {
  detections: Detection[];
  healthScore: number;
  motionLevel: number;
  environmentRisk: EnvironmentRisk;
  diseaseRisk: DiseaseRisk[];
  sizeEstimate: SizeEstimate | null;
  timestamp: string;
}

interface Detection {
  id: number;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  color: string;
}

interface EnvironmentRisk {
  overall: 'good' | 'warning' | 'danger';
  factors: { name: string; value: string; status: 'good' | 'warning' | 'danger' }[];
}

interface DiseaseRisk {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  prescription: string;
}

interface SizeEstimate {
  width: string;
  height: string;
  area: string;
  growthRate: string;
}

// Mock AI 감지 데이터 생성
function generateMockDetections(): Detection[] {
  const types = [
    { label: '고추냉이 잎', color: '#10b981' },
    { label: '고추냉이 근경', color: '#06b6d4' },
    { label: '상추', color: '#22c55e' },
    { label: '깻잎', color: '#84cc16' },
    { label: '잡초 (제거 필요)', color: '#ef4444' },
    { label: '딸기', color: '#f43f5e' },
  ];

  const count = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: i,
      label: type.label,
      confidence: 0.75 + Math.random() * 0.24,
      bbox: {
        x: 0.1 + Math.random() * 0.5,
        y: 0.1 + Math.random() * 0.4,
        w: 0.15 + Math.random() * 0.25,
        h: 0.15 + Math.random() * 0.25,
      },
      color: type.color,
    };
  });
}

function generateMockAnalysis(): AIAnalysisResult {
  const diseases: DiseaseRisk[] = [
    {
      name: '무름병 (Soft Rot)',
      probability: 0.12 + Math.random() * 0.15,
      severity: 'low',
      prescription: '통풍 개선 · 과습 방지 · 이병주 즉시 제거 · 구리제 예방 살포',
    },
    {
      name: '잿빛곰팡이병 (Gray Mold)',
      probability: 0.08 + Math.random() * 0.1,
      severity: 'low',
      prescription: '습도 60% 이하 유지 · 환기 횟수 증가 · 보트리티스 전용 살균제',
    },
    {
      name: '진딧물 (Aphid)',
      probability: 0.05 + Math.random() * 0.2,
      severity: Math.random() > 0.7 ? 'medium' : 'low',
      prescription: '천적(무당벌레) 투입 · 님오일 살포 · 황색 끈끈이 트랩 설치',
    },
  ];

  return {
    detections: generateMockDetections(),
    healthScore: 72 + Math.floor(Math.random() * 26),
    motionLevel: Math.floor(Math.random() * 100),
    environmentRisk: {
      overall: Math.random() > 0.7 ? 'warning' : 'good',
      factors: [
        { name: '온도', value: `${15 + Math.floor(Math.random() * 5)}°C`, status: 'good' },
        { name: '습도', value: `${65 + Math.floor(Math.random() * 20)}%`, status: Math.random() > 0.6 ? 'good' : 'warning' },
        { name: '조도', value: `${40 + Math.floor(Math.random() * 30)}%`, status: 'good' },
        { name: 'EC', value: `${(1.0 + Math.random() * 0.5).toFixed(1)}`, status: Math.random() > 0.8 ? 'warning' : 'good' },
        { name: 'pH', value: `${(6.0 + Math.random() * 0.5).toFixed(1)}`, status: 'good' },
      ],
    },
    diseaseRisk: diseases,
    sizeEstimate: {
      width: `${10 + Math.floor(Math.random() * 8)}cm`,
      height: `${12 + Math.floor(Math.random() * 10)}cm`,
      area: `${80 + Math.floor(Math.random() * 60)}cm²`,
      growthRate: `+${(0.2 + Math.random() * 0.5).toFixed(1)}cm/일`,
    },
    timestamp: new Date().toISOString(),
  };
}

export default function CropAIOverlay({ videoRef, active, onCapture }: CropAIOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const frameRef = useRef(0);

  // 실시간 오버레이 그리기 (바운딩 박스 + 크기 라인)
  const drawOverlay = useCallback(() => {
    if (!active || !canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!analysis) return;

    // 바운딩 박스 그리기
    analysis.detections.forEach(det => {
      const x = det.bbox.x * canvas.width;
      const y = det.bbox.y * canvas.height;
      const w = det.bbox.w * canvas.width;
      const h = det.bbox.h * canvas.height;

      // 박스
      ctx.strokeStyle = det.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // 코너 강조
      const corner = 12;
      ctx.lineWidth = 3;
      ctx.strokeStyle = det.color;
      [[x, y, corner, 0, 0, corner], [x + w, y, -corner, 0, 0, corner],
       [x, y + h, corner, 0, 0, -corner], [x + w, y + h, -corner, 0, 0, -corner]
      ].forEach(([sx, sy, dx1, dy1, dx2, dy2]) => {
        ctx.beginPath();
        ctx.moveTo(sx as number + (dx1 as number), sy as number + (dy1 as number));
        ctx.lineTo(sx as number, sy as number);
        ctx.lineTo(sx as number + (dx2 as number), sy as number + (dy2 as number));
        ctx.stroke();
      });

      // 라벨
      const label = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 11px sans-serif';
      const metrics = ctx.measureText(label);
      const pad = 4;
      ctx.fillStyle = det.color;
      ctx.fillRect(x, y - 18, metrics.width + pad * 2, 18);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + pad, y - 5);

      // 크기 측정 라인 (하단)
      if (analysis.sizeEstimate) {
        ctx.strokeStyle = '#ffffff80';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        // 가로 치수선
        ctx.beginPath();
        ctx.moveTo(x, y + h + 10);
        ctx.lineTo(x + w, y + h + 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffffcc';
        ctx.font = '10px sans-serif';
        ctx.fillText(analysis.sizeEstimate.width, x + w / 2 - 12, y + h + 22);
      }
    });

    // 모션 인디케이터 (우측 상단)
    if (analysis.motionLevel > 20) {
      ctx.fillStyle = analysis.motionLevel > 60 ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(canvas.width - 20, 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('MOTION', canvas.width - 52, 24);
    }

    frameRef.current = requestAnimationFrame(drawOverlay);
  }, [active, analysis, videoRef]);

  // 2초마다 Mock AI 분석 갱신
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setAnalysis(generateMockAnalysis());
    }, 2500);
    setAnalysis(generateMockAnalysis());
    return () => clearInterval(interval);
  }, [active]);

  // 오버레이 루프
  useEffect(() => {
    if (active) {
      frameRef.current = requestAnimationFrame(drawOverlay);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, drawOverlay]);

  const handleCapture = () => {
    if (!videoRef.current || !analysis) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onCapture?.(imageData, analysis);
  };

  if (!active) return null;

  const statusColor = !analysis ? 'bg-gray-400' :
    analysis.healthScore >= 85 ? 'bg-emerald-500' :
    analysis.healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <>
      {/* 카메라 위 오버레이 캔버스 (바운딩 박스 + 크기 측정선) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ objectFit: 'cover' }}
      />

      {/* 상단 실시간 상태 바 */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2">
        <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-[10px] font-black text-white">AI 분석 중</span>
          {analysis && (
            <>
              <span className="text-[10px] text-white/60">·</span>
              <span className="text-[10px] font-black text-emerald-300" translate="no">
                건강도 {analysis.healthScore}%
              </span>
              <span className="text-[10px] text-white/60">·</span>
              <span className="text-[10px] text-white/80" translate="no">
                감지 {analysis.detections.length}개
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

      {/* 하단 분석 패널 (접이식) */}
      {showPanel && analysis && (
        <div className="absolute bottom-16 left-2 right-2 z-20 bg-black/70 backdrop-blur-xl rounded-2xl p-3 max-h-48 overflow-y-auto">
          {/* 환경 지표 */}
          <div className="flex gap-1.5 mb-2 overflow-x-auto">
            {analysis.environmentRisk.factors.map(f => (
              <div
                key={f.name}
                className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-black ${
                  f.status === 'good' ? 'bg-emerald-500/30 text-emerald-300' :
                  f.status === 'warning' ? 'bg-amber-500/30 text-amber-300' :
                  'bg-red-500/30 text-red-300'
                }`}
              >
                {f.name} {f.value}
              </div>
            ))}
          </div>

          {/* 크기 측정 */}
          {analysis.sizeEstimate && (
            <div className="flex gap-2 mb-2">
              <div className="flex-1 bg-white/10 rounded-lg px-2 py-1.5">
                <p className="text-[8px] text-white/50">크기</p>
                <p className="text-[10px] font-black text-cyan-300" translate="no">
                  {analysis.sizeEstimate.width} × {analysis.sizeEstimate.height}
                </p>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-2 py-1.5">
                <p className="text-[8px] text-white/50">면적</p>
                <p className="text-[10px] font-black text-cyan-300" translate="no">{analysis.sizeEstimate.area}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-2 py-1.5">
                <p className="text-[8px] text-white/50">성장속도</p>
                <p className="text-[10px] font-black text-emerald-300" translate="no">{analysis.sizeEstimate.growthRate}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-2 py-1.5">
                <p className="text-[8px] text-white/50">모션</p>
                <p className={`text-[10px] font-black ${analysis.motionLevel > 60 ? 'text-red-300' : analysis.motionLevel > 20 ? 'text-amber-300' : 'text-emerald-300'}`} translate="no">
                  {analysis.motionLevel}%
                </p>
              </div>
            </div>
          )}

          {/* 병해충 위험도 */}
          <div className="space-y-1">
            {analysis.diseaseRisk.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  d.severity === 'high' ? 'bg-red-400' : d.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className="text-[9px] text-white/80 flex-1 truncate">{d.name}</span>
                <span className={`text-[9px] font-black ${
                  d.probability > 0.2 ? 'text-amber-300' : 'text-emerald-300'
                }`} translate="no">
                  {(d.probability * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 촬영 버튼 (AI 스냅샷) */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center">
        <button
          type="button"
          onClick={handleCapture}
          className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-400 active:scale-90 transition-transform"
          aria-label="AI 분석 촬영"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <i className="ri-camera-ai-line text-2xl text-white" />
          </div>
        </button>
      </div>
    </>
  );
}
