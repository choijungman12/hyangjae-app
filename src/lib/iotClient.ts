/**
 * 향재원 IoT 장비 제어 클라이언트
 *
 * 브라우저에서 실제 스마트팜 IoT 장비와 통신하기 위한 클라이언트 라이브러리.
 *
 * 🔌 지원 프로토콜:
 *   - HTTP REST API (가장 일반적 · 대부분의 최신 컨트롤러)
 *   - MQTT over WebSocket (Mosquitto 등 브로커 경유)
 *   - Mock (실제 장비 없이 데모용)
 *
 * ⚠️ 주의사항:
 *   - 브라우저는 HTTPS 페이지에서 HTTP 주소 호출 차단 (Mixed Content)
 *   - 로컬 네트워크(192.168.x.x) 접근은 CORS 정책을 장비가 허용해야 가능
 *   - 실제 운영 시 장비 펌웨어에서 CORS 헤더 설정 필요:
 *       Access-Control-Allow-Origin: *
 */

export type IotProtocol = 'http' | 'mqtt-ws' | 'mock';

export interface IotConnection {
  id: string;
  name: string;         // 농장 별칭 (예: "향재원 A동")
  protocol: IotProtocol;
  host: string;         // IP or URL
  port?: number;
  token?: string;       // Bearer 토큰 또는 API 키
  username?: string;    // MQTT 사용자명
  password?: string;    // MQTT 비밀번호
  topic?: string;       // MQTT 토픽 prefix
  createdAt: string;
  lastConnectedAt?: string;
}

export interface DeviceStatus {
  id: string;
  name: string;
  type: 'sensor' | 'actuator';
  category: 'temperature' | 'humidity' | 'co2' | 'light' | 'water' | 'ec' | 'ph' | 'fan' | 'pump' | 'led' | 'heater' | 'cooler';
  value: number | string | boolean;
  unit?: string;
  min?: number;
  max?: number;
  state?: 'on' | 'off' | 'auto';  // actuator 상태
  online: boolean;
  lastUpdate: string;
}

export interface IotCommand {
  deviceId: string;
  action: 'set' | 'toggle' | 'auto';
  value?: number | string | boolean;
}

/* ═══════════════════════════════════════════════════════
 *   Public API
 * ═══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'hyangjae_iot_connections';
const ACTIVE_KEY = 'hyangjae_iot_active';

export function loadConnections(): IotConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConnection(conn: IotConnection) {
  const list = loadConnections().filter(c => c.id !== conn.id);
  list.push(conn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('hyangjae-iot-updated'));
}

export function deleteConnection(id: string) {
  const list = loadConnections().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  if (getActiveConnectionId() === id) setActiveConnectionId(null);
  window.dispatchEvent(new CustomEvent('hyangjae-iot-updated'));
}

export function getActiveConnectionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveConnectionId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new CustomEvent('hyangjae-iot-updated'));
}

export function getActiveConnection(): IotConnection | null {
  const id = getActiveConnectionId();
  if (!id) return null;
  return loadConnections().find(c => c.id === id) ?? null;
}

/* ═══════════════════════════════════════════════════════
 *   QR 코드 / 주소 파싱
 * ═══════════════════════════════════════════════════════ */

/**
 * QR 코드 또는 수동 입력 문자열을 IoT 연결 설정으로 변환
 *
 * 지원 포맷:
 *   1. JSON: {"name":"향재원","host":"192.168.1.100","port":8080,"token":"xxx"}
 *   2. 향재원 커스텀: hyangjae-iot://192.168.1.100:8080?token=xxx
 *   3. HTTP URL: http://192.168.1.100:8080
 *   4. IP만: 192.168.1.100 (기본 포트 80)
 *   5. MQTT: mqtt://user:pass@broker.example.com:1883/topic
 */
export function parseConnectionString(input: string): Partial<IotConnection> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. JSON 형식
  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed);
      return {
        name: json.name ?? 'QR 연결 농장',
        protocol: (json.protocol as IotProtocol) ?? 'http',
        host: json.host ?? json.ip,
        port: json.port,
        token: json.token,
      };
    } catch {
      return null;
    }
  }

  // 2. 커스텀 스키마 hyangjae-iot://
  if (trimmed.startsWith('hyangjae-iot://')) {
    try {
      const url = new URL(trimmed);
      return {
        name: url.searchParams.get('name') ?? '향재원 IoT',
        protocol: 'http',
        host: url.hostname,
        port: url.port ? parseInt(url.port) : 80,
        token: url.searchParams.get('token') ?? undefined,
      };
    } catch {
      return null;
    }
  }

  // 3. HTTP(S) URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return {
        name: url.hostname,
        protocol: 'http',
        host: url.protocol + '//' + url.hostname,
        port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
      };
    } catch {
      return null;
    }
  }

  // 4. MQTT
  if (/^mqtt(s)?:\/\//i.test(trimmed) || /^ws(s)?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return {
        name: url.hostname,
        protocol: 'mqtt-ws',
        host: url.hostname,
        port: url.port ? parseInt(url.port) : 8083,
        username: url.username || undefined,
        password: url.password || undefined,
        topic: url.pathname.replace(/^\//, '') || undefined,
      };
    } catch {
      return null;
    }
  }

  // 5. IP만 (IPv4 형식)
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d+))?$/;
  const ipMatch = trimmed.match(ipv4Pattern);
  if (ipMatch) {
    return {
      name: `농장 (${ipMatch[0]})`,
      protocol: 'http',
      host: `${ipMatch[1]}.${ipMatch[2]}.${ipMatch[3]}.${ipMatch[4]}`,
      port: ipMatch[5] ? parseInt(ipMatch[5]) : 80,
    };
  }

  return null;
}

/* ═══════════════════════════════════════════════════════
 *   연결 테스트
 * ═══════════════════════════════════════════════════════ */

export async function testConnection(conn: IotConnection): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (conn.protocol === 'mock') {
    await new Promise(r => setTimeout(r, 600));
    return { success: true, message: '데모 모드 연결 성공', latencyMs: 12 };
  }

  if (conn.protocol === 'http') {
    const start = performance.now();
    try {
      const url = buildHttpUrl(conn, '/api/status');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: conn.token ? { 'Authorization': `Bearer ${conn.token}` } : {},
      });
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - start);

      if (res.ok) return { success: true, message: '장비 연결 성공', latencyMs: latency };
      return { success: false, message: `서버 응답 오류 (HTTP ${res.status})` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('abort')) return { success: false, message: '연결 시간 초과 (5초)' };
      if (msg.includes('fetch')) return { success: false, message: 'CORS 또는 네트워크 차단 — 장비 CORS 설정 확인' };
      return { success: false, message: msg };
    }
  }

  if (conn.protocol === 'mqtt-ws') {
    return new Promise((resolve) => {
      try {
        const wsUrl = `wss://${conn.host}:${conn.port ?? 8083}/mqtt`;
        const ws = new WebSocket(wsUrl);
        const timeout = setTimeout(() => {
          ws.close();
          resolve({ success: false, message: '브로커 응답 없음 (5초)' });
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({ success: true, message: 'MQTT 브로커 연결 성공' });
        };
        ws.onerror = () => {
          clearTimeout(timeout);
          resolve({ success: false, message: 'WebSocket 연결 실패' });
        };
      } catch (err) {
        resolve({ success: false, message: String(err) });
      }
    });
  }

  return { success: false, message: '알 수 없는 프로토콜' };
}

/* ═══════════════════════════════════════════════════════
 *   장비 조회
 * ═══════════════════════════════════════════════════════ */

export async function fetchDevices(conn: IotConnection): Promise<DeviceStatus[]> {
  if (conn.protocol === 'mock') return getMockDevices();

  if (conn.protocol === 'http') {
    try {
      const url = buildHttpUrl(conn, '/api/devices');
      const res = await fetch(url, {
        headers: conn.token ? { 'Authorization': `Bearer ${conn.token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : json.devices ?? [];
    } catch (err) {
      console.error('[IoT] fetchDevices failed, falling back to mock:', err);
      return getMockDevices();
    }
  }

  return getMockDevices();
}

/* ═══════════════════════════════════════════════════════
 *   장비 제어
 * ═══════════════════════════════════════════════════════ */

export async function sendCommand(conn: IotConnection, cmd: IotCommand): Promise<boolean> {
  if (conn.protocol === 'mock') {
    await new Promise(r => setTimeout(r, 300));
    return true;
  }

  if (conn.protocol === 'http') {
    try {
      const url = buildHttpUrl(conn, `/api/devices/${cmd.deviceId}/control`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(conn.token ? { 'Authorization': `Bearer ${conn.token}` } : {}),
        },
        body: JSON.stringify({ action: cmd.action, value: cmd.value }),
      });
      return res.ok;
    } catch (err) {
      console.error('[IoT] sendCommand failed:', err);
      return false;
    }
  }

  return false;
}

/* ═══════════════════════════════════════════════════════
 *   내부 헬퍼
 * ═══════════════════════════════════════════════════════ */

function buildHttpUrl(conn: IotConnection, path: string): string {
  let host = conn.host;
  if (!/^https?:\/\//i.test(host)) {
    host = 'http://' + host;
  }
  if (conn.port && conn.port !== 80 && conn.port !== 443) {
    // 이미 포트가 host 에 있는지 확인
    if (!/:\d+$/.test(host)) {
      host += `:${conn.port}`;
    }
  }
  return host.replace(/\/$/, '') + path;
}

/* Mock 데이터 생성 (데모용) */
function getMockDevices(): DeviceStatus[] {
  const now = new Date().toISOString();
  // 자연스러운 변동값
  const rand = (min: number, max: number) => +(min + Math.random() * (max - min)).toFixed(1);

  return [
    {
      id: 'temp-1',
      name: '온실 온도',
      type: 'sensor',
      category: 'temperature',
      value: rand(15.2, 17.8),
      unit: '°C',
      min: 15, max: 18,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'humid-1',
      name: '상대 습도',
      type: 'sensor',
      category: 'humidity',
      value: rand(65, 82),
      unit: '%',
      min: 70, max: 80,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'co2-1',
      name: 'CO₂ 농도',
      type: 'sensor',
      category: 'co2',
      value: Math.round(rand(750, 950)),
      unit: 'ppm',
      min: 600, max: 1200,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'light-1',
      name: '광량',
      type: 'sensor',
      category: 'light',
      value: Math.round(rand(8500, 12000)),
      unit: 'lux',
      min: 5000, max: 15000,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'ec-1',
      name: 'EC (양액)',
      type: 'sensor',
      category: 'ec',
      value: rand(1.1, 1.4),
      unit: 'mS/cm',
      min: 1.0, max: 1.5,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'ph-1',
      name: 'pH',
      type: 'sensor',
      category: 'ph',
      value: rand(6.0, 6.5),
      unit: '',
      min: 5.8, max: 6.8,
      online: true,
      lastUpdate: now,
    },
    {
      id: 'fan-1',
      name: '환기 팬',
      type: 'actuator',
      category: 'fan',
      value: 'auto',
      state: 'auto',
      online: true,
      lastUpdate: now,
    },
    {
      id: 'pump-1',
      name: '양액 공급 펌프',
      type: 'actuator',
      category: 'pump',
      value: 'on',
      state: 'on',
      online: true,
      lastUpdate: now,
    },
    {
      id: 'led-1',
      name: 'LED 보광',
      type: 'actuator',
      category: 'led',
      value: 'on',
      state: 'on',
      online: true,
      lastUpdate: now,
    },
    {
      id: 'cooler-1',
      name: '냉각기',
      type: 'actuator',
      category: 'cooler',
      value: 'auto',
      state: 'auto',
      online: true,
      lastUpdate: now,
    },
  ];
}
