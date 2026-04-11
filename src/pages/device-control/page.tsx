import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import {
  loadConnections,
  saveConnection,
  deleteConnection,
  getActiveConnectionId,
  setActiveConnectionId,
  parseConnectionString,
  testConnection,
  fetchDevices,
  sendCommand,
  type IotConnection,
  type DeviceStatus,
  type IotProtocol,
} from '@/lib/iotClient';
import {
  isQrScannerSupported,
  detectQrFromVideo,
  startCameraStream,
  stopCameraStream,
} from '@/lib/qrScanner';

const POLL_INTERVAL_MS = 5000;

type ModalMode = 'closed' | 'qr' | 'manual';

const CATEGORY_META: Record<DeviceStatus['category'], { icon: string; color: string; bg: string }> = {
  temperature: { icon: 'ri-temp-hot-line',        color: 'text-red-500',     bg: 'bg-red-50' },
  humidity:    { icon: 'ri-drop-line',            color: 'text-blue-500',    bg: 'bg-blue-50' },
  co2:         { icon: 'ri-cloud-line',           color: 'text-gray-500',    bg: 'bg-gray-50' },
  light:       { icon: 'ri-sun-line',             color: 'text-yellow-500',  bg: 'bg-yellow-50' },
  water:       { icon: 'ri-water-flash-line',     color: 'text-cyan-500',    bg: 'bg-cyan-50' },
  ec:          { icon: 'ri-flask-line',           color: 'text-purple-500',  bg: 'bg-purple-50' },
  ph:          { icon: 'ri-test-tube-line',       color: 'text-pink-500',    bg: 'bg-pink-50' },
  fan:         { icon: 'ri-windy-line',           color: 'text-teal-500',    bg: 'bg-teal-50' },
  pump:        { icon: 'ri-water-percent-line',   color: 'text-blue-600',    bg: 'bg-blue-50' },
  led:         { icon: 'ri-lightbulb-line',       color: 'text-amber-500',   bg: 'bg-amber-50' },
  heater:      { icon: 'ri-fire-line',            color: 'text-orange-500',  bg: 'bg-orange-50' },
  cooler:      { icon: 'ri-snowflake-line',       color: 'text-cyan-600',    bg: 'bg-cyan-50' },
};

export default function DeviceControl() {
  const scrollY = useScrollY();
  const [connections, setConnections] = useState<IotConnection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [modal, setModal] = useState<ModalMode>('closed');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshConnections = useCallback(() => {
    setConnections(loadConnections());
    setActiveId(getActiveConnectionId());
  }, []);

  const loadDevices = useCallback(async () => {
    const id = getActiveConnectionId();
    if (!id) { setDevices([]); return; }
    const conn = loadConnections().find(c => c.id === id);
    if (!conn) return;
    setLoading(true);
    try {
      const list = await fetchDevices(conn);
      setDevices(list);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConnections();
    loadDevices();
    const handler = () => {
      refreshConnections();
      loadDevices();
    };
    window.addEventListener('hyangjae-iot-updated', handler);
    return () => window.removeEventListener('hyangjae-iot-updated', handler);
  }, [refreshConnections, loadDevices]);

  // 자동 갱신
  useEffect(() => {
    if (!autoRefresh || !activeId) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }
    pollTimerRef.current = setInterval(() => loadDevices(), POLL_INTERVAL_MS);
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [autoRefresh, activeId, loadDevices]);

  const handleSwitchConnection = (id: string) => {
    setActiveConnectionId(id);
    loadDevices();
  };

  const handleDeleteConnection = (id: string) => {
    if (!confirm('이 연결을 삭제하시겠습니까?')) return;
    deleteConnection(id);
  };

  const handleToggleActuator = async (device: DeviceStatus) => {
    const id = getActiveConnectionId();
    if (!id) return;
    const conn = loadConnections().find(c => c.id === id);
    if (!conn) return;

    const nextState = device.state === 'on' ? 'off' : device.state === 'off' ? 'auto' : 'on';
    // 낙관적 업데이트
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, state: nextState, value: nextState } : d));
    const ok = await sendCommand(conn, { deviceId: device.id, action: 'set', value: nextState });
    if (!ok) {
      // 실패 시 롤백
      loadDevices();
    }
  };

  const activeConn = connections.find(c => c.id === activeId);
  const sensors = devices.filter(d => d.type === 'sensor');
  const actuators = devices.filter(d => d.type === 'actuator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-24 overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${-scrollY * 0.2}px)` }} />
      </div>

      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl transition-all">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1">장비 제어</h1>
          <button
            onClick={() => loadDevices()}
            disabled={!activeId || loading}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg disabled:opacity-40 transition-all"
          >
            <i className={`ri-refresh-line text-xl text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 연결된 농장 선택 */}
      <section className="px-4 pt-5 pb-3 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <i className="ri-router-line text-blue-500" />연결된 농장 ({connections.length})
          </h2>
          <button
            onClick={() => setModal('qr')}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            <i className="ri-add-line" />
            새 연결
          </button>
        </div>

        {connections.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
            <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <i className="ri-wifi-off-line text-3xl text-gray-400" />
            </div>
            <p className="text-sm font-black text-gray-700 mb-1">연결된 장비가 없습니다</p>
            <p className="text-xs text-gray-500 mb-4">QR 코드 또는 IP 주소로 연결해 주세요</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setModal('qr')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-xs font-black shadow-md"
              >
                <i className="ri-qr-code-line mr-1" />QR 스캔
              </button>
              <button
                onClick={() => setModal('manual')}
                className="px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-xl text-xs font-black"
              >
                <i className="ri-keyboard-line mr-1" />수동 입력
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map(conn => (
              <div
                key={conn.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  activeId === conn.id
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <button
                  onClick={() => handleSwitchConnection(conn.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    conn.protocol === 'mock' ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
                    <i className={`${conn.protocol === 'mqtt-ws' ? 'ri-broadcast-line' : conn.protocol === 'mock' ? 'ri-test-tube-line' : 'ri-server-line'} text-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-gray-900 truncate">{conn.name}</p>
                      {activeId === conn.id && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          연결됨
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate">
                      {conn.protocol.toUpperCase()} · {conn.host}{conn.port ? `:${conn.port}` : ''}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                >
                  <i className="ri-delete-bin-line text-red-500 text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 활성 연결 상태 */}
      {activeConn && (
        <>
          <section className="px-4 pt-2 pb-4 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/70 font-bold">현재 제어 중</p>
                  <p className="text-lg font-black">{activeConn.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                      {activeConn.protocol.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-white/80">
                      {sensors.length}개 센서 · {actuators.length}개 제어기
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md border border-white/30 transition-all ${
                    autoRefresh ? 'bg-emerald-500/40' : 'bg-white/10'
                  }`}
                >
                  <i className={`${autoRefresh ? 'ri-refresh-line animate-spin' : 'ri-pause-line'} text-xl`} style={{ animationDuration: '3s' }} />
                  <span className="text-[9px] font-bold mt-0.5">{autoRefresh ? 'AUTO' : 'OFF'}</span>
                </button>
              </div>
              {lastRefresh && (
                <p className="text-[10px] text-white/60 mt-3">
                  마지막 갱신: {lastRefresh.toLocaleTimeString('ko-KR')} {autoRefresh && '· 5초마다 자동'}
                </p>
              )}
            </div>
          </section>

          {/* 센서 그리드 */}
          <section className="px-4 pb-4 relative z-10">
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-sensor-line text-blue-500" />실시간 센서 ({sensors.length})
            </h3>
            {sensors.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-400 font-bold">센서 데이터 없음</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sensors.map(d => {
                  const meta = CATEGORY_META[d.category];
                  const numValue = typeof d.value === 'number' ? d.value : parseFloat(String(d.value));
                  const inRange = d.min !== undefined && d.max !== undefined && numValue >= d.min && numValue <= d.max;
                  return (
                    <div key={d.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
                          <i className={`${meta.icon} ${meta.color} text-lg`} />
                        </div>
                        <div className={`w-2 h-2 rounded-full ${d.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 mb-0.5">{d.name}</p>
                      <div className="flex items-baseline gap-1">
                        <p className={`text-xl font-black ${inRange ? 'text-gray-900' : 'text-amber-600'}`}>
                          {typeof d.value === 'number' ? d.value : String(d.value)}
                        </p>
                        {d.unit && <p className="text-[10px] font-bold text-gray-400">{d.unit}</p>}
                      </div>
                      {d.min !== undefined && d.max !== undefined && (
                        <div className="mt-2">
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${inRange ? 'bg-emerald-400' : 'bg-amber-400'}`}
                              style={{
                                width: `${Math.min(100, Math.max(0, ((numValue - d.min) / (d.max - d.min)) * 100))}%`,
                              }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-400 mt-0.5">정상 범위: {d.min}~{d.max}{d.unit}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 제어기 */}
          <section className="px-4 pb-6 relative z-10">
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-remote-control-line text-indigo-500" />장비 제어 ({actuators.length})
            </h3>
            {actuators.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-400 font-bold">제어 가능한 장비 없음</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actuators.map(d => {
                  const meta = CATEGORY_META[d.category];
                  const stateLabel = d.state === 'on' ? 'ON' : d.state === 'off' ? 'OFF' : 'AUTO';
                  const stateColor = d.state === 'on' ? 'bg-emerald-500' : d.state === 'off' ? 'bg-gray-400' : 'bg-blue-500';
                  return (
                    <div key={d.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <i className={`${meta.icon} ${meta.color} text-xl`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{d.name}</p>
                        <p className="text-[10px] text-gray-500">상태: {stateLabel}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActuator(d)}
                        className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-all ${stateColor}`}
                      >
                        {stateLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* 모달 */}
      {modal !== 'closed' && (
        <ConnectModal mode={modal} onClose={() => setModal('closed')} onSaved={(conn) => {
          saveConnection(conn);
          setActiveConnectionId(conn.id);
          setModal('closed');
          refreshConnections();
          loadDevices();
        }} />
      )}

      <BottomNav />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
 *   연결 모달 (QR 스캔 / 수동 입력)
 * ═══════════════════════════════════════════════════════ */

interface ConnectModalProps {
  mode: ModalMode;
  onClose: () => void;
  onSaved: (conn: IotConnection) => void;
}

function ConnectModal({ mode: initialMode, onClose, onSaved }: ConnectModalProps) {
  const [mode, setMode] = useState<'qr' | 'manual'>(initialMode === 'qr' ? 'qr' : 'manual');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [parsedConn, setParsedConn] = useState<Partial<IotConnection> | null>(null);

  // 수동 입력 필드
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<IotProtocol>('http');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const handleParsedPrefill = useCallback((parsed: Partial<IotConnection>) => {
    if (parsed.name) setName(parsed.name);
    if (parsed.protocol) setProtocol(parsed.protocol);
    if (parsed.host) setHost(parsed.host);
    if (parsed.port) setPort(String(parsed.port));
    if (parsed.token) setToken(parsed.token);
  }, []);

  /* QR 스캔 시작 */
  useEffect(() => {
    if (mode !== 'qr') return;
    if (!videoRef.current) return;

    setCameraError(null);
    setScanning(true);

    startCameraStream(videoRef.current)
      .then((stream) => {
        streamRef.current = stream;
        // 반복 감지
        scanLoopRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          const code = await detectQrFromVideo(videoRef.current);
          if (code) {
            const parsed = parseConnectionString(code);
            if (parsed) {
              setParsedConn(parsed);
              handleParsedPrefill(parsed);
              setScanning(false);
              if (scanLoopRef.current) clearInterval(scanLoopRef.current);
              stopCameraStream(streamRef.current);
              streamRef.current = null;
              setMode('manual');
            } else {
              setCameraError('QR 코드를 인식했지만 형식이 올바르지 않습니다.');
            }
          }
        }, 500);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setCameraError('카메라 권한이 거부되었습니다.');
        } else if (msg.includes('NotFound')) {
          setCameraError('카메라를 찾을 수 없습니다.');
        } else if (!isQrScannerSupported()) {
          setCameraError('이 브라우저는 QR 스캔을 지원하지 않습니다. 수동 입력을 사용해 주세요.');
        } else {
          setCameraError(msg);
        }
      });

    return () => {
      if (scanLoopRef.current) clearInterval(scanLoopRef.current);
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    };
  }, [mode, handleParsedPrefill]);

  const handleTest = async () => {
    setError(null);
    setTestResult(null);
    if (protocol !== 'mock' && !host.trim()) {
      setError('호스트(IP/URL) 를 입력해 주세요.');
      return;
    }
    setTesting(true);
    try {
      const conn: IotConnection = {
        id: 'temp',
        name: name || 'Test',
        protocol,
        host: host.trim(),
        port: port ? parseInt(port) : undefined,
        token: token || undefined,
        createdAt: new Date().toISOString(),
      };
      const result = await testConnection(conn);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setError(null);
    if (!name.trim()) { setError('농장 이름을 입력해 주세요.'); return; }
    if (protocol !== 'mock' && !host.trim()) { setError('호스트를 입력해 주세요.'); return; }

    const conn: IotConnection = {
      id: `conn_${Date.now()}`,
      name: name.trim(),
      protocol,
      host: host.trim() || 'mock.local',
      port: port ? parseInt(port) : undefined,
      token: token || undefined,
      createdAt: new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
    };
    onSaved(conn);
  };

  const fillMock = () => {
    setName('향재원 데모 농장');
    setProtocol('mock');
    setHost('demo.local');
    setPort('');
    setToken('');
    setParsedConn(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-base font-black text-gray-900">IoT 장비 연결</p>
            <p className="text-[11px] text-gray-500">QR 코드 또는 수동 입력</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <i className="ri-close-line text-gray-600" />
          </button>
        </div>

        {/* 탭 */}
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setMode('qr')}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'qr' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              <i className="ri-qr-scan-line mr-1" />QR 스캔
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              <i className="ri-keyboard-line mr-1" />수동 입력
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === 'qr' ? (
            <div>
              {cameraError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                  <i className="ri-camera-off-line text-4xl text-red-400 mb-2 block" />
                  <p className="text-xs font-black text-red-700 mb-1">카메라 오류</p>
                  <p className="text-[11px] text-red-600 leading-relaxed">{cameraError}</p>
                  <button
                    onClick={() => setMode('manual')}
                    className="mt-3 px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl"
                  >
                    수동 입력으로 전환
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* 스캔 가이드 프레임 */}
                  <div className="absolute inset-8 pointer-events-none">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />
                    {/* 스캔 라인 */}
                    {scanning && (
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 animate-[scan_2s_ease-in-out_infinite]" style={{
                        animation: 'scan 2s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <p className="text-[10px] text-white font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      QR 코드를 프레임 안에 비춰주세요
                    </p>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                지원 형식: JSON · hyangjae-iot:// · HTTP URL · IP 주소
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {parsedConn && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <i className="ri-check-line text-emerald-500" />
                  <p className="text-[11px] font-bold text-emerald-700">QR 코드에서 정보를 자동 입력했습니다</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-600 mb-1">농장 이름 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="예: 향재원 A동"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-600 mb-1">프로토콜</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['http', 'mqtt-ws', 'mock'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`py-2.5 rounded-xl text-[10px] font-black transition-all border-2 ${
                        protocol === p
                          ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {p === 'http' ? 'HTTP REST' : p === 'mqtt-ws' ? 'MQTT-WS' : '데모'}
                    </button>
                  ))}
                </div>
              </div>

              {protocol !== 'mock' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-600 mb-1">
                      호스트 (IP 또는 URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={e => setHost(e.target.value)}
                      placeholder={protocol === 'http' ? '192.168.1.100 또는 http://farm.local' : 'broker.example.com'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-gray-600 mb-1">포트</label>
                      <input
                        type="number"
                        value={port}
                        onChange={e => setPort(e.target.value)}
                        placeholder={protocol === 'http' ? '80' : '8083'}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-600 mb-1">토큰 (선택)</label>
                      <input
                        type="password"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="API Key"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={fillMock}
                className="w-full py-2.5 bg-gray-100 rounded-xl text-[11px] font-black text-gray-600 hover:bg-gray-200 transition-all"
              >
                <i className="ri-test-tube-line mr-1" />데모 농장 자동 입력
              </button>

              {/* 테스트 */}
              <button
                onClick={handleTest}
                disabled={testing}
                className="w-full py-3 bg-white border-2 border-blue-400 text-blue-600 rounded-xl text-xs font-black disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    연결 테스트 중...
                  </>
                ) : (
                  <>
                    <i className="ri-radar-line" />
                    연결 테스트
                  </>
                )}
              </button>

              {testResult && (
                <div className={`rounded-xl px-3 py-2.5 flex items-start gap-2 ${testResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <i className={`${testResult.success ? 'ri-checkbox-circle-line text-emerald-500' : 'ri-error-warning-line text-red-500'} mt-0.5`} />
                  <div className="flex-1">
                    <p className={`text-[11px] font-black ${testResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                    {testResult.latencyMs !== undefined && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">응답 시간: {testResult.latencyMs}ms</p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <i className="ri-error-warning-line text-red-500" />
                  <p className="text-[11px] font-bold text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 저장 버튼 */}
        {mode === 'manual' && (
          <div className="p-4 border-t border-gray-100 flex-shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
            >
              연결 저장
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
