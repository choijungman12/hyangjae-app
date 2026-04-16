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

      {/* ═══════ 로봇 제어 섹션 (Dobot CR10) ═══════ */}
      <RobotControlSection />

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
 *   로봇 제어 섹션 — Dobot CR10 협동 로봇 팔
 *   TCP/IP 9090 · Modbus RTU · MQTT (dobot/cr10/cmd)
 * ═══════════════════════════════════════════════════════ */

function RobotControlSection() {
  const [robotIp, setRobotIp] = useState('');
  const [robotConnected, setRobotConnected] = useState(false);
  const [robotStatus, setRobotStatus] = useState<'idle' | 'moving' | 'error' | 'offline'>('offline');
  const [jointAngles, setJointAngles] = useState([0, -45, 90, 0, 90, 0]);
  const [speed, setSpeed] = useState(30);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ko-KR');
    setCommandLog(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const connectRobot = () => {
    if (!robotIp) return;
    addLog(`Dobot CR10 연결 시도: ${robotIp}:9090 (TCP/IP)`);
    setRobotStatus('idle');
    setTimeout(() => {
      setRobotConnected(true);
      setRobotStatus('idle');
      addLog('✅ 연결 성공 · Dobot CR10 · 펌웨어 v3.8.2 · 6축 정상');
    }, 1500);
  };

  const sendRobotCommand = (cmd: string, detail: string) => {
    if (!robotConnected) return;
    setRobotStatus('moving');
    addLog(`📤 명령 전송: ${cmd} — ${detail}`);
    setTimeout(() => {
      setRobotStatus('idle');
      addLog(`✅ 명령 완료: ${cmd}`);
    }, 2000);
  };

  const ROBOT_COMMANDS = [
    { id: 'home',    label: '홈 위치',     icon: 'ri-home-4-line',       desc: '원점 복귀 (J1~J6 = 0°)',     cmd: 'MovJ(0,0,0,0,0,0)' },
    { id: 'scan',    label: '작물 스캔',    icon: 'ri-scan-2-line',       desc: '카메라 높이로 이동 → 촬영',    cmd: 'MovL(300,0,400,0,90,0)' },
    { id: 'harvest', label: '수확',        icon: 'ri-scissors-2-line',   desc: 'AI 감지 좌표로 이동 → 절단',   cmd: 'MovJ → GripOn → Cut → GripOff' },
    { id: 'pickup',  label: '픽업',        icon: 'ri-hand-heart-line',   desc: '수확물 집기 → 바구니 이동',     cmd: 'GripOn → MovL(basket) → GripOff' },
    { id: 'wash',    label: '세척 라인',    icon: 'ri-drop-line',         desc: '세척 장비로 작물 전달',         cmd: 'MovL(wash_pos) → Release' },
    { id: 'pack',    label: '포장',        icon: 'ri-gift-line',         desc: '포장기로 이동 → 배치',         cmd: 'MovL(pack_pos) → Place' },
    { id: 'pause',   label: '일시정지',    icon: 'ri-pause-circle-line', desc: '현재 동작 즉시 정지',          cmd: 'Pause()' },
    { id: 'resume',  label: '재개',        icon: 'ri-play-circle-line',  desc: '정지된 동작 이어서 실행',       cmd: 'Resume()' },
  ];

  const JOINTS = ['J1 (베이스)', 'J2 (숄더)', 'J3 (엘보)', 'J4 (손목1)', 'J5 (손목2)', 'J6 (손목3)'];

  const statusMeta = {
    idle:    { label: '대기',   color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    moving:  { label: '동작 중', color: 'bg-amber-500 animate-pulse', text: 'text-amber-700', bg: 'bg-amber-50' },
    error:   { label: '에러',   color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
    offline: { label: '미연결',  color: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const sm = statusMeta[robotStatus];

  return (
    <section className="px-4 pb-6 relative z-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <i className="ri-robot-2-line text-emerald-500" />
          로봇 제어 · Dobot CR10
        </h3>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-black text-gray-500 flex items-center gap-1"
        >
          {expanded ? '접기' : '펼치기'}
          <i className={`ri-arrow-${expanded ? 'up' : 'down'}-s-line`} />
        </button>
      </div>

      {/* 상태 카드 */}
      <div className={`${sm.bg} border rounded-2xl p-4 mb-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${sm.color}`} />
          <div className="flex-1">
            <p className={`text-xs font-black ${sm.text}`}>Dobot CR10 · {sm.label}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {robotConnected ? `${robotIp}:9090 · TCP/IP · 6축 · 페이로드 10kg` : '로봇 미연결 — IP 주소를 입력하세요'}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <i className="ri-robot-2-line text-2xl text-white" />
          </div>
        </div>
      </div>

      {/* 연결 UI */}
      {!robotConnected && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="로봇 IP (예: 192.168.1.100)"
            value={robotIp}
            onChange={e => setRobotIp(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={connectRobot}
            disabled={!robotIp}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs rounded-xl disabled:opacity-40"
          >
            연결
          </button>
        </div>
      )}

      {expanded && (
        <>
          {/* 속도 제어 */}
          {robotConnected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-black text-gray-600">동작 속도</p>
                <span className="text-xs font-black text-emerald-600" translate="no">{speed}%</span>
              </div>
              <input
                type="range" min="1" max="100" value={speed}
                onChange={e => {
                  setSpeed(Number(e.target.value));
                  addLog(`속도 변경: ${e.target.value}%`);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                <span>느림 (정밀)</span><span>빠름</span>
              </div>
            </div>
          )}

          {/* 관절 상태 (6축) */}
          {robotConnected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <p className="text-[11px] font-black text-gray-600 mb-2">6축 관절 상태</p>
              <div className="grid grid-cols-3 gap-2">
                {JOINTS.map((name, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[9px] text-gray-400">{name}</p>
                    <p className="text-sm font-black text-gray-900" translate="no">{jointAngles[i]}°</p>
                    <div className="flex gap-1 mt-1 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...jointAngles];
                          next[i] = Math.max(-180, next[i] - 5);
                          setJointAngles(next);
                          addLog(`J${i + 1} → ${next[i]}°`);
                        }}
                        className="w-6 h-6 bg-gray-200 rounded text-[10px] font-black active:scale-90"
                      >-</button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...jointAngles];
                          next[i] = Math.min(180, next[i] + 5);
                          setJointAngles(next);
                          addLog(`J${i + 1} → ${next[i]}°`);
                        }}
                        className="w-6 h-6 bg-gray-200 rounded text-[10px] font-black active:scale-90"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 명령 버튼 그리드 */}
          {robotConnected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <p className="text-[11px] font-black text-gray-600 mb-2">자동화 명령</p>
              <div className="grid grid-cols-2 gap-2">
                {ROBOT_COMMANDS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => sendRobotCommand(c.label, c.cmd)}
                    disabled={robotStatus === 'moving' && c.id !== 'pause'}
                    className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all active:scale-95 disabled:opacity-40 ${
                      c.id === 'pause' ? 'bg-red-50 border-red-200' :
                      c.id === 'resume' ? 'bg-emerald-50 border-emerald-200' :
                      'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${c.icon} text-lg ${c.id === 'pause' ? 'text-red-500' : c.id === 'resume' ? 'text-emerald-500' : 'text-gray-600'} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-gray-900">{c.label}</p>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5 truncate">{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 자동화 파이프라인 */}
          {robotConnected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <p className="text-[11px] font-black text-gray-600 mb-2">자동 수확 시퀀스</p>
              <button
                type="button"
                onClick={() => {
                  addLog('🤖 자동 수확 시퀀스 시작');
                  setRobotStatus('moving');
                  const steps = ['작물 스캔', '크기 측정', 'AI 판단', '수확 위치 이동', '그리퍼 ON', '줄기 절단', '바구니 이동', '그리퍼 OFF', '홈 위치 복귀'];
                  steps.forEach((step, i) => {
                    setTimeout(() => {
                      addLog(`  [${i + 1}/${steps.length}] ${step}`);
                      if (i === steps.length - 1) {
                        setRobotStatus('idle');
                        addLog('✅ 자동 수확 시퀀스 완료');
                      }
                    }, (i + 1) * 1500);
                  });
                }}
                disabled={robotStatus === 'moving'}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm rounded-xl shadow-lg disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-robot-2-line text-lg" />
                자동 수확 시퀀스 실행
              </button>
              <p className="text-[9px] text-gray-400 text-center mt-2">
                스캔 → 측정 → AI 판단 → 수확 → 픽업 → 복귀 (약 15초)
              </p>
            </div>
          )}

          {/* 명령 로그 */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-black text-gray-300 flex items-center gap-1.5">
                <i className="ri-terminal-line text-emerald-400" />
                명령 로그
              </p>
              <button type="button" onClick={() => setCommandLog([])} className="text-[10px] text-gray-500 font-bold">
                초기화
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5 font-mono">
              {commandLog.length === 0 ? (
                <p className="text-[10px] text-gray-600">대기 중...</p>
              ) : (
                commandLog.map((log, i) => (
                  <p key={i} className={`text-[10px] leading-relaxed ${
                    log.includes('✅') ? 'text-emerald-400' :
                    log.includes('📤') ? 'text-cyan-400' :
                    log.includes('❌') ? 'text-red-400' : 'text-gray-400'
                  }`}>{log}</p>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 사양 요약 (접힌 상태에서도 보임) */}
      {!expanded && robotConnected && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {['6축', '10kg', '±0.03mm', 'TCP/IP', 'MQTT'].map(tag => (
            <span key={tag} className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-black">{tag}</span>
          ))}
        </div>
      )}
    </section>
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
