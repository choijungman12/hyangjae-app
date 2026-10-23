/**
 * 향재원 스마트팜 계측 모델
 *
 * 화면에 보이는 모든 수치는 **실제 재배에서 관리하는 항목**입니다.
 * 고추냉이 수경 온실과 유러피안 채소 재배동은 관리 지표가 다르므로
 * 구역(zone)별로 센서 구성과 적정 범위를 따로 정의합니다.
 *
 * ❗ 토경 재배가 아니므로 "토양 수분" 같은 지표는 쓰지 않습니다.
 *   수경 온실은 양액 수온·EC·pH·용존산소를, 재배동은 배지 함수율을 봅니다.
 */

/* ═══════════════════════════════════════════════════════════
 * 1. 재배 구역
 * ═══════════════════════════════════════════════════════════ */

export type ZoneId = 'greenhouse' | 'houses' | 'field';

export interface Zone {
  id: ZoneId;
  name: string;
  sub: string;
  icon: string;
  gradient: string;
  /** 이 구역에서 계측하는 센서 키 (표시 순서대로) */
  sensors: SensorKey[];
}

export const ZONES: Zone[] = [
  {
    id: 'greenhouse',
    name: '고추냉이 수경 온실',
    sub: '3단 다단 베드 · 총 연장 634.5m',
    icon: 'ri-plant-line',
    gradient: 'from-wasabi-500 to-emeraldgreen-700',
    sensors: ['waterTemp', 'airTemp', 'humidity', 'ec', 'ph', 'dissolvedOxygen', 'ppfd', 'co2', 'flowRate'],
  },
  {
    id: 'houses',
    name: '유러피안 재배동 8동',
    sub: '코코피트·펄라이트 유기질 배지',
    icon: 'ri-home-4-line',
    gradient: 'from-lime-500 to-wasabi-700',
    sensors: ['airTemp', 'humidity', 'substrateWC', 'ec', 'ph', 'ppfd', 'co2', 'vpd'],
  },
  {
    id: 'field',
    name: '노지 과수 · 조경수',
    sub: '블루베리 · 에메랄드골드 · 조경수',
    icon: 'ri-landscape-line',
    gradient: 'from-blueangel-500 to-soil-700',
    sensors: ['airTemp', 'humidity', 'soilTemp', 'soilWC', 'rainfall', 'windSpeed'],
  },
];

/* ═══════════════════════════════════════════════════════════
 * 2. 센서 규격 — 적정·허용 범위는 작물 생리 기준값입니다
 * ═══════════════════════════════════════════════════════════ */

export type SensorKey =
  | 'waterTemp' | 'airTemp' | 'humidity' | 'ec' | 'ph' | 'dissolvedOxygen'
  | 'ppfd' | 'co2' | 'flowRate' | 'substrateWC' | 'vpd'
  | 'soilTemp' | 'soilWC' | 'rainfall' | 'windSpeed';

export interface SensorSpec {
  key: SensorKey;
  label: string;
  /** 짧은 설명 — 왜 이 값을 보는가 */
  why: string;
  unit: string;
  icon: string;
  gradient: string;
  /** 소수점 자리수 */
  digits: number;
  /** 구역별 적정 범위 [min, max] */
  optimal: Partial<Record<ZoneId, [number, number]>>;
  /** 구역별 허용 범위 — 벗어나면 경고 */
  allowed: Partial<Record<ZoneId, [number, number]>>;
  /**
   * 주간에만 판정하는 지표.
   * 광량처럼 밤에 0 이 되는 것이 정상인 값은 야간 판정에서 제외합니다.
   */
  daytimeOnly?: boolean;
}

/** 일중 주간 구간 (10월 서울 기준 일출~일몰) */
export const DAYTIME_HOURS: [number, number] = [6, 18];

export function isDaytime(hour: number): boolean {
  const h = ((hour % 24) + 24) % 24;
  return h >= DAYTIME_HOURS[0] && h <= DAYTIME_HOURS[1];
}

export const SENSOR_SPECS: Record<SensorKey, SensorSpec> = {
  waterTemp: {
    key: 'waterTemp',
    label: '양액 수온',
    why: '고추냉이 재배의 1순위 지표. 15℃를 넘기면 근경이 무르고 뿌리 활력이 급격히 떨어집니다.',
    unit: '℃',
    icon: 'ri-temp-cold-line',
    gradient: 'from-cyan-400 to-blue-600',
    digits: 1,
    optimal: { greenhouse: [12.0, 14.0] },
    allowed: { greenhouse: [10.0, 15.5] },
  },
  airTemp: {
    key: 'airTemp',
    label: '기온',
    why: '주간 15~18℃ / 야간 10~13℃. 고온이 이어지면 잎이 웃자라고 병 발생이 늘어납니다.',
    unit: '℃',
    icon: 'ri-temp-hot-line',
    gradient: 'from-orange-400 to-red-500',
    digits: 1,
    optimal: { greenhouse: [10, 18], houses: [15, 24], field: [5, 28] },
    allowed: { greenhouse: [6, 22], houses: [8, 30], field: [-10, 36] },
  },
  humidity: {
    key: 'humidity',
    label: '상대습도',
    why: '고추냉이는 높은 습도를 좋아하지만, 채소 재배동에서 80%를 넘으면 잿빛곰팡이 위험이 커집니다.',
    unit: '%',
    icon: 'ri-water-percent-line',
    gradient: 'from-sky-400 to-cyan-600',
    digits: 0,
    optimal: { greenhouse: [80, 90], houses: [60, 75], field: [40, 80] },
    allowed: { greenhouse: [70, 95], houses: [50, 82], field: [20, 95] },
  },
  ec: {
    key: 'ec',
    label: '양액 EC',
    why: '양분 농도. 높으면 삼투압으로 뿌리가 상하고, 낮으면 생육이 멎습니다.',
    unit: 'dS/m',
    icon: 'ri-flask-line',
    gradient: 'from-emeraldgreen-400 to-teal-700',
    digits: 2,
    optimal: { greenhouse: [1.0, 1.5], houses: [1.8, 2.2] },
    allowed: { greenhouse: [0.8, 1.8], houses: [1.4, 2.6] },
  },
  ph: {
    key: 'ph',
    label: '양액 pH',
    why: '범위를 벗어나면 양분이 녹아 있어도 뿌리가 흡수하지 못합니다(양분 결핍 유발).',
    unit: '',
    icon: 'ri-test-tube-line',
    gradient: 'from-violet-400 to-purple-700',
    digits: 2,
    optimal: { greenhouse: [6.0, 7.0], houses: [5.8, 6.3] },
    allowed: { greenhouse: [5.5, 7.5], houses: [5.4, 6.8] },
  },
  dissolvedOxygen: {
    key: 'dissolvedOxygen',
    label: '용존산소',
    why: '뿌리도 숨을 쉽니다. 수경에서 DO가 떨어지면 뿌리 썩음이 바로 옵니다.',
    unit: 'mg/L',
    icon: 'ri-bubble-chart-line',
    gradient: 'from-blue-400 to-indigo-700',
    digits: 1,
    optimal: { greenhouse: [7.0, 9.5] },
    allowed: { greenhouse: [5.5, 11.0] },
  },
  ppfd: {
    key: 'ppfd',
    label: '광량 (PPFD)',
    why: '광합성에 실제로 쓰이는 광자량. 고추냉이는 직사광을 싫어해 차광 75%를 깔고 관리합니다. 적정 범위는 주간 기준이며, 야간 0 은 정상입니다.',
    unit: 'µmol/m²s',
    icon: 'ri-sun-line',
    gradient: 'from-amber-400 to-orange-600',
    digits: 0,
    /** 해가 떠 있는 동안에만 판정합니다 (야간 0 은 경고가 아닙니다) */
    daytimeOnly: true,
    optimal: { greenhouse: [80, 220], houses: [250, 450] },
    allowed: { greenhouse: [30, 320], houses: [120, 650] },
  },
  co2: {
    key: 'co2',
    label: 'CO₂ 농도',
    why: '주간에 떨어지면 광합성이 제한됩니다. 야간 상승은 작물 호흡의 정상 신호입니다.',
    unit: 'ppm',
    icon: 'ri-cloud-line',
    gradient: 'from-slate-400 to-gray-700',
    digits: 0,
    optimal: { greenhouse: [400, 800], houses: [600, 1000] },
    allowed: { greenhouse: [350, 1200], houses: [400, 1400] },
  },
  flowRate: {
    key: 'flowRate',
    label: '양액 순환 유량',
    why: '베드 끝까지 양액이 도달하는지 보는 값. 떨어지면 배관 막힘이나 펌프 이상입니다.',
    unit: 'L/min',
    icon: 'ri-loop-right-line',
    gradient: 'from-teal-400 to-cyan-700',
    digits: 0,
    optimal: { greenhouse: [55, 75] },
    allowed: { greenhouse: [40, 90] },
  },
  substrateWC: {
    key: 'substrateWC',
    label: '배지 함수율',
    why: '코코피트·펄라이트 배지의 수분 비율. 과습하면 뿌리가 산소 부족에 빠집니다.',
    unit: '%',
    icon: 'ri-drop-line',
    gradient: 'from-emerald-400 to-green-700',
    digits: 0,
    optimal: { houses: [60, 72] },
    allowed: { houses: [50, 80] },
  },
  vpd: {
    key: 'vpd',
    label: '수분부족분 (VPD)',
    why: '기온·습도를 한 숫자로 묶은 증산 지표. 0.4 미만이면 증산이 멎고, 1.2 초과면 잎이 마릅니다.',
    unit: 'kPa',
    icon: 'ri-contrast-drop-line',
    gradient: 'from-indigo-400 to-blue-700',
    digits: 2,
    optimal: { houses: [0.5, 1.0] },
    allowed: { houses: [0.3, 1.4] },
  },
  soilTemp: {
    key: 'soilTemp',
    label: '지온',
    why: '노지 조경수·블루베리의 뿌리 활동 시작 시점을 판단합니다.',
    unit: '℃',
    icon: 'ri-thermometer-line',
    gradient: 'from-soil-300 to-soil-700',
    digits: 1,
    optimal: { field: [10, 24] },
    allowed: { field: [-2, 30] },
  },
  soilWC: {
    key: 'soilWC',
    label: '토양 수분',
    why: '블루베리는 과습에 약합니다. 배수가 되는지 함께 봐야 합니다.',
    unit: '%',
    icon: 'ri-water-flash-line',
    gradient: 'from-blue-400 to-teal-700',
    digits: 0,
    optimal: { field: [25, 40] },
    allowed: { field: [15, 55] },
  },
  rainfall: {
    key: 'rainfall',
    label: '강우량 (24h)',
    why: '관수 여부 판단과 방제 일정 조정에 씁니다.',
    unit: 'mm',
    icon: 'ri-rainy-line',
    gradient: 'from-sky-400 to-blue-700',
    digits: 1,
    optimal: { field: [0, 20] },
    allowed: { field: [0, 60] },
  },
  windSpeed: {
    key: 'windSpeed',
    label: '풍속',
    why: '8m/s를 넘으면 방제를 중단하고, 묘목 지주를 점검합니다.',
    unit: 'm/s',
    icon: 'ri-windy-line',
    gradient: 'from-gray-400 to-slate-700',
    digits: 1,
    optimal: { field: [0, 4] },
    allowed: { field: [0, 8] },
  },
};

/* ═══════════════════════════════════════════════════════════
 * 3. 일중 변화 곡선 (24시간)
 *
 *   10월 서울 기준의 전형적인 하루를 모델링한 값입니다.
 *   실제 센서가 연동되면 이 배열이 실측값으로 대체됩니다.
 * ═══════════════════════════════════════════════════════════ */

type Hourly = number[]; // 길이 24, index = 시(0~23)

export const DIURNAL: Record<ZoneId, Partial<Record<SensorKey, Hourly>>> = {
  greenhouse: {
    // 워터칠러가 잡아 주므로 하루 종일 13℃ 부근에서 미세하게 움직입니다
    waterTemp: [12.9, 12.8, 12.8, 12.8, 12.9, 12.9, 13.0, 13.0, 13.1, 13.2, 13.3, 13.4,
                13.4, 13.5, 13.4, 13.3, 13.2, 13.1, 13.1, 13.0, 13.0, 12.9, 12.9, 12.9],
    airTemp:   [11.4, 11.1, 10.9, 10.7, 10.6, 10.8, 11.4, 12.3, 13.6, 14.9, 16.0, 16.9,
                17.5, 17.8, 17.6, 17.0, 16.1, 15.0, 14.0, 13.2, 12.6, 12.2, 11.9, 11.6],
    humidity:  [89, 90, 90, 90, 90, 89, 88, 86, 84, 82, 80, 79,
                78, 78, 79, 80, 82, 84, 86, 87, 88, 88, 89, 89],
    ec:        [1.18, 1.18, 1.19, 1.19, 1.20, 1.20, 1.21, 1.23, 1.26, 1.29, 1.32, 1.34,
                1.35, 1.34, 1.32, 1.30, 1.27, 1.25, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18],
    ph:        [6.42, 6.43, 6.44, 6.45, 6.45, 6.46, 6.46, 6.48, 6.52, 6.56, 6.60, 6.63,
                6.64, 6.63, 6.61, 6.58, 6.55, 6.52, 6.49, 6.47, 6.46, 6.45, 6.44, 6.43],
    dissolvedOxygen: [8.7, 8.7, 8.8, 8.8, 8.8, 8.7, 8.7, 8.6, 8.4, 8.2, 8.0, 7.9,
                      7.8, 7.7, 7.8, 7.9, 8.1, 8.3, 8.4, 8.5, 8.6, 8.6, 8.7, 8.7],
    // 차광 75% + 보광 LED (06~09, 16~19 보광)
    ppfd:      [0, 0, 0, 0, 0, 6, 55, 95, 120, 150, 180, 205,
                215, 210, 190, 160, 125, 95, 60, 20, 0, 0, 0, 0],
    co2:       [780, 790, 795, 800, 795, 780, 740, 680, 610, 545, 495, 460,
                435, 428, 445, 480, 530, 595, 660, 710, 745, 760, 770, 775],
    flowRate:  [62, 62, 62, 62, 62, 62, 66, 68, 68, 68, 68, 68,
                68, 68, 68, 68, 68, 66, 64, 62, 62, 62, 62, 62],
  },
  houses: {
    airTemp:   [13.2, 12.9, 12.7, 12.5, 12.4, 12.6, 13.5, 15.2, 17.4, 19.3, 21.0, 22.2,
                23.1, 23.5, 23.2, 22.3, 20.8, 19.0, 17.4, 16.2, 15.3, 14.6, 14.0, 13.6],
    humidity:  [76, 77, 78, 78, 78, 77, 75, 72, 69, 66, 64, 62,
                61, 61, 62, 64, 66, 69, 71, 73, 74, 75, 75, 76],
    substrateWC: [66, 66, 65, 65, 65, 64, 64, 70, 69, 68, 67, 66,
                  66, 71, 70, 69, 68, 67, 67, 66, 66, 66, 66, 66],
    ec:        [1.95, 1.96, 1.97, 1.98, 1.99, 2.00, 2.01, 1.88, 1.90, 1.93, 1.96, 1.99,
                2.02, 1.90, 1.92, 1.95, 1.97, 1.99, 2.00, 1.99, 1.98, 1.97, 1.96, 1.95],
    ph:        [6.05, 6.05, 6.06, 6.06, 6.07, 6.07, 6.08, 6.02, 6.03, 6.05, 6.07, 6.09,
                6.10, 6.04, 6.05, 6.06, 6.07, 6.08, 6.08, 6.07, 6.07, 6.06, 6.06, 6.05],
    ppfd:      [0, 0, 0, 0, 0, 12, 95, 180, 265, 330, 385, 420,
                435, 428, 400, 350, 285, 200, 110, 30, 0, 0, 0, 0],
    co2:       [980, 990, 1000, 1005, 1000, 985, 940, 880, 810, 750, 700, 665,
                640, 632, 650, 690, 745, 810, 875, 920, 950, 965, 972, 978],
    vpd:       [0.36, 0.34, 0.33, 0.32, 0.32, 0.34, 0.39, 0.49, 0.62, 0.76, 0.88, 0.98,
                1.05, 1.08, 1.04, 0.94, 0.81, 0.68, 0.57, 0.50, 0.45, 0.42, 0.39, 0.37],
  },
  field: {
    airTemp:   [8.2, 7.6, 7.1, 6.8, 6.6, 6.9, 8.1, 10.4, 13.1, 15.5, 17.4, 18.7,
                19.5, 19.8, 19.4, 18.4, 16.8, 14.8, 12.9, 11.5, 10.5, 9.7, 9.1, 8.6],
    humidity:  [82, 84, 85, 86, 87, 86, 83, 76, 68, 61, 55, 51,
                49, 48, 50, 54, 60, 67, 73, 77, 79, 80, 81, 82],
    soilTemp:  [13.1, 13.0, 12.9, 12.8, 12.7, 12.7, 12.7, 12.8, 13.0, 13.3, 13.7, 14.1,
                14.4, 14.6, 14.7, 14.6, 14.4, 14.1, 13.8, 13.6, 13.4, 13.3, 13.2, 13.1],
    soilWC:    [32, 32, 32, 32, 31, 31, 31, 31, 31, 30, 30, 30,
                29, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32],
    rainfall:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    windSpeed: [1.2, 1.1, 1.0, 1.0, 1.1, 1.3, 1.8, 2.4, 3.0, 3.5, 3.9, 4.2,
                4.4, 4.5, 4.3, 3.9, 3.3, 2.7, 2.2, 1.8, 1.6, 1.4, 1.3, 1.2],
  },
};

/** 특정 구역·센서의 현재 시각 값 */
export function readSensor(zone: ZoneId, key: SensorKey, hour: number): number | null {
  const series = DIURNAL[zone]?.[key];
  if (!series) return null;
  return series[((hour % 24) + 24) % 24];
}

/** 적정/주의/경고 판정 */
export type SensorStatus = 'optimal' | 'normal' | 'warning';

/**
 * 적정/허용/경고 판정.
 *
 * @param hour 측정 시각(0~23). 주면 광량처럼 야간에 0 이 정상인 지표를
 *             야간 판정에서 제외합니다. 생략하면 시각과 무관하게 판정합니다.
 */
export function judgeSensor(zone: ZoneId, key: SensorKey, value: number, hour?: number): SensorStatus {
  const spec = SENSOR_SPECS[key];

  // 야간의 광량 0 은 경고가 아니라 정상입니다
  if (spec.daytimeOnly && hour !== undefined && !isDaytime(hour)) return 'normal';

  const opt = spec.optimal[zone];
  const allow = spec.allowed[zone];
  if (opt && value >= opt[0] && value <= opt[1]) return 'optimal';
  if (allow && value >= allow[0] && value <= allow[1]) return 'normal';
  return 'warning';
}

export const STATUS_META: Record<SensorStatus, { label: string; text: string; bg: string; dot: string }> = {
  optimal: { label: '적정', text: 'text-wasabi-600 dark:text-wasabi-300', bg: 'bg-wasabi-50 dark:bg-wasabi-900/40', dot: 'bg-wasabi-500' },
  normal:  { label: '허용', text: 'text-blue-600 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-950/40',     dot: 'bg-blue-500' },
  warning: { label: '경고', text: 'text-red-600 dark:text-red-300',       bg: 'bg-red-50 dark:bg-red-950/40',       dot: 'bg-red-500' },
};

/** 적정 범위 문자열 */
export function optimalLabel(zone: ZoneId, key: SensorKey): string {
  const spec = SENSOR_SPECS[key];
  const opt = spec.optimal[zone];
  if (!opt) return '—';
  const d = spec.digits;
  const range = `${opt[0].toFixed(d)} ~ ${opt[1].toFixed(d)}${spec.unit ? ' ' + spec.unit : ''}`;
  return spec.daytimeOnly ? `${range} (주간)` : range;
}

/* ═══════════════════════════════════════════════════════════
 * 4. 환경 제어 장비
 * ═══════════════════════════════════════════════════════════ */

export interface ControlDevice {
  id: string;
  name: string;
  /** 어떤 센서를 잡기 위한 장비인가 */
  controls: SensorKey;
  zone: ZoneId;
  icon: string;
  defaultOn: boolean;
  /** 설정값이 있는 장비 */
  setpoint?: { value: number; unit: string; min: number; max: number; step: number };
  note: string;
}

export const CONTROL_DEVICES: ControlDevice[] = [
  { id: 'chiller',   name: '워터칠러',       controls: 'waterTemp',       zone: 'greenhouse', icon: 'ri-snowflake-line',   defaultOn: true,
    setpoint: { value: 13.0, unit: '℃', min: 10, max: 16, step: 0.5 }, note: '양액 수온을 13℃로 유지' },
  { id: 'circ-pump', name: '양액 순환 펌프', controls: 'flowRate',        zone: 'greenhouse', icon: 'ri-loop-right-line',  defaultOn: true,
    setpoint: { value: 68, unit: 'L/min', min: 40, max: 90, step: 2 }, note: '3단 베드 전 구간 순환' },
  { id: 'aerator',   name: '산소 용존기',    controls: 'dissolvedOxygen', zone: 'greenhouse', icon: 'ri-bubble-chart-line', defaultOn: true,
    note: '뿌리 호흡용 용존산소 공급' },
  { id: 'shade',     name: '차광 스크린',    controls: 'ppfd',            zone: 'greenhouse', icon: 'ri-contrast-2-line',  defaultOn: true,
    setpoint: { value: 75, unit: '%', min: 0, max: 90, step: 5 }, note: '2중 산광 + 알루미늄 75%' },
  { id: 'led',       name: '보광 LED',       controls: 'ppfd',            zone: 'greenhouse', icon: 'ri-lightbulb-flash-line', defaultOn: false,
    setpoint: { value: 60, unit: '%', min: 0, max: 100, step: 10 }, note: '흐린 날·새벽 보광' },
  { id: 'dosing',    name: '양액 혼합기',    controls: 'ec',              zone: 'greenhouse', icon: 'ri-flask-line',       defaultOn: true,
    setpoint: { value: 1.2, unit: 'dS/m', min: 0.8, max: 2.6, step: 0.1 }, note: 'EC·pH 자동 보정' },
  { id: 'fan-house', name: '환기팬 (재배동)', controls: 'humidity',       zone: 'houses',     icon: 'ri-windy-line',       defaultOn: true,
    setpoint: { value: 75, unit: '%', min: 50, max: 90, step: 5 }, note: '습도 상한 도달 시 가동' },
  { id: 'heater',    name: '난방기 (재배동)', controls: 'airTemp',        zone: 'houses',     icon: 'ri-fire-line',        defaultOn: false,
    setpoint: { value: 13, unit: '℃', min: 5, max: 20, step: 1 }, note: '야간 최저온 방어' },
  { id: 'irrigation', name: '점적 관수',     controls: 'substrateWC',     zone: 'houses',     icon: 'ri-drop-line',        defaultOn: true,
    setpoint: { value: 66, unit: '%', min: 50, max: 80, step: 2 }, note: '배지 함수율 기준 자동 관수' },
  { id: 'field-irr', name: '노지 관수',      controls: 'soilWC',          zone: 'field',      icon: 'ri-water-flash-line', defaultOn: false,
    setpoint: { value: 30, unit: '%', min: 15, max: 50, step: 5 }, note: '블루베리 과습 주의' },
];

/* ═══════════════════════════════════════════════════════════
 * 5. 구역별 작물 생육 현황
 * ═══════════════════════════════════════════════════════════ */

export interface CropStatusRow {
  zone: ZoneId;
  /** 재배동 번호 (재배동만) */
  houseNo?: number;
  crop: string;
  emoji: string;
  /** 현재 단계 — 정식 전에는 '정식 준비' */
  stage: string;
  /** 정식 예정 시기 (아직 정식하지 않은 작물) */
  plannedPlanting: string;
  /** 첫 수확 예정 시기 */
  plannedHarvest: string;
  /** 정식 준비 진행도 (0~100) — 정식 전 단계에서 쓰는 지표 */
  readiness: number;
  /** 현장 메모 */
  note: string;
}

/* 🟢 EDIT:CROP_STATUS ─ 정식 완료 후 실제 생육 현황으로 갱신
 *
 * ❗ 2026-10 현재 1차 정식 전입니다(정식 2026.11).
 *   아직 심지도 않은 작물을 "정식 N일차 · 수확 중"으로 표기하면 사실과 다릅니다.
 *   정식이 끝나면 이 구조를 생육 경과(daysAfterPlanting / daysToHarvest)로 바꾸세요.
 */
export const CROP_STATUS: CropStatusRow[] = [
  { zone: 'greenhouse', crop: '고추냉이 (잎·줄기)', emoji: '🌿', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '2027. 3~ (정식 후 약 4개월)', readiness: 85,
    note: '모주에서 런너를 받아 삽목 중. 다단 베드 양액 순환·수온 제어는 가동 상태입니다.' },
  { zone: 'greenhouse', crop: '고추냉이 (근경)', emoji: '🌱', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '2028 상반기 (정식 후 약 18개월)', readiness: 85,
    note: '같은 묘에서 잎을 먼저 수확하고, 근경은 18개월을 기다립니다.' },
  { zone: 'houses', houseNo: 1, crop: '루꼴라', emoji: '🌿', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 30~40일', readiness: 70,
    note: '생육이 빨라 연 6~8회전. 첫 작기 배지 충전 준비 중.' },
  { zone: 'houses', houseNo: 2, crop: '바질 (제노베제)', emoji: '🌱', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 45~60일', readiness: 65,
    note: '저온에 약해 야간 최저온 13℃ 확보가 선행 조건입니다.' },
  { zone: 'houses', houseNo: 3, crop: '버터헤드 · 로메인', emoji: '🥬', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 45~60일', readiness: 70,
    note: '샐러드 기본 품목. 연 5~6회전 계획.' },
  { zone: 'houses', houseNo: 4, crop: '라디키오 (트레비소)', emoji: '🍷', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 70~90일', readiness: 60,
    note: '저온 단일 조건에서 적색이 발현됩니다. 겨울 작기로 배정.' },
  { zone: 'houses', houseNo: 5, crop: '카볼로 네로', emoji: '🥬', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 60일부터 장기 수확', readiness: 60,
    note: '아래 잎부터 순차 수확해 한 번 정식으로 길게 갑니다.' },
  { zone: 'houses', houseNo: 6, crop: '스위스 차드', emoji: '🌈', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 50~60일', readiness: 65,
    note: '잎자루 색이 상품성을 좌우합니다. 베이비리프 병행 계획.' },
  { zone: 'houses', houseNo: 7, crop: '펜넬', emoji: '🌾', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 80~100일', readiness: 55,
    note: '구근 비대에 서늘한 기온이 필요해 겨울 작기로 배정했습니다.' },
  { zone: 'houses', houseNo: 8, crop: '비트', emoji: '🫐', stage: '정식 준비',
    plannedPlanting: '2026. 11', plannedHarvest: '파종 후 60~70일', readiness: 60,
    note: '잎과 뿌리를 모두 출하합니다.' },
  { zone: 'field', crop: '블루베리', emoji: '🫐', stage: '식재 준비',
    plannedPlanting: '2026. 11 (월동 전)', plannedHarvest: '2027. 6~8월', readiness: 50,
    note: '재배동 앞 쇄석 제거 구역에 식재합니다. 산성 토양(pH 4.5~5.5) 조성이 선행 작업입니다.' },
  { zone: 'field', crop: '에메랄드골드 · 조경수', emoji: '🌲', stage: '식재 준비',
    plannedPlanting: '2026. 11 (가을 식재 적기)', plannedHarvest: '출하 성수기 3~5월 · 9~11월', readiness: 50,
    note: '가을 식재 후 활착기를 거쳐 규격이 차면 출하합니다.' },
];

/* ═══════════════════════════════════════════════════════════
 * 6. 알림 규칙 — 어떤 값이 어떻게 벗어나면 무엇을 해야 하는가
 * ═══════════════════════════════════════════════════════════ */

export interface AlertRule {
  id: string;
  zone: ZoneId;
  sensor: SensorKey;
  condition: string;
  severity: 'critical' | 'warning' | 'info';
  action: string;
}

export const ALERT_RULES: AlertRule[] = [
  { id: 'wt-high', zone: 'greenhouse', sensor: 'waterTemp', condition: '수온 15℃ 초과가 30분 지속', severity: 'critical',
    action: '워터칠러 출력 최대 · 순환 유량 상향 · 차광 스크린 전개' },
  { id: 'do-low', zone: 'greenhouse', sensor: 'dissolvedOxygen', condition: 'DO 5.5mg/L 미만', severity: 'critical',
    action: '산소 용존기 추가 가동 · 배관 막힘 점검' },
  { id: 'flow-low', zone: 'greenhouse', sensor: 'flowRate', condition: '유량 40L/min 미만', severity: 'critical',
    action: '펌프·필터 즉시 점검 (베드 말단 건조 위험)' },
  { id: 'ph-drift', zone: 'greenhouse', sensor: 'ph', condition: 'pH 5.5 미만 또는 7.5 초과', severity: 'warning',
    action: '양액 혼합기 교정 · 원수 알칼리도 재측정' },
  { id: 'ec-high', zone: 'houses', sensor: 'ec', condition: 'EC 2.6dS/m 초과', severity: 'warning',
    action: '관수량 증량으로 배지 염류 세척' },
  { id: 'hum-high', zone: 'houses', sensor: 'humidity', condition: '습도 82% 초과가 2시간 지속', severity: 'warning',
    action: '환기팬 가동 · 잿빛곰팡이 예찰 강화' },
  { id: 'temp-low', zone: 'houses', sensor: 'airTemp', condition: '야간 기온 8℃ 미만', severity: 'warning',
    action: '난방기 가동 (바질 저온 장해 한계)' },
  { id: 'wind-high', zone: 'field', sensor: 'windSpeed', condition: '풍속 8m/s 초과', severity: 'info',
    action: '방제 작업 중단 · 묘목 지주 점검' },
];

/* ═══════════════════════════════════════════════════════════
 * 7. 자원 사용량 — 순환식 운영의 근거 수치
 * ═══════════════════════════════════════════════════════════ */

export const RESOURCE_USAGE = [
  { label: '농업용수 취수',   value: '28',   unit: '㎥/일', icon: 'ri-water-flash-line', note: '허가 수량 (지하수 준공확인)' },
  { label: '양액 외부 배출',  value: '0',    unit: 'L',     icon: 'ri-recycle-line',     note: '순환식 — 배출 없음' },
  { label: '화학 농약 사용',  value: '0',    unit: '회',    icon: 'ri-leaf-line',        note: '물리적 방제만 운영' },
  { label: '재사용 양액 비율', value: '92',  unit: '%',     icon: 'ri-loop-left-line',   note: '설계 목표치 — 증발·작물 흡수분만 보충' },
];
