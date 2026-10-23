import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import {
  ZONES,
  SENSOR_SPECS,
  DIURNAL,
  CROP_STATUS,
  CONTROL_DEVICES,
  ALERT_RULES,
  RESOURCE_USAGE,
  judgeSensor,
  optimalLabel,
  STATUS_META,
  type ZoneId,
  type SensorKey,
} from '@/data/farmSensors';

type TabId = 'realtime' | 'history' | 'control';

/** 센서값 포맷 */
function fmtSensor(key: SensorKey, v: number): string {
  return v.toFixed(SENSOR_SPECS[key].digits);
}

export default function SmartFarmData() {
  const [tab, setTab] = useState<TabId>('realtime');
  const [zoneId, setZoneId] = useState<ZoneId>('greenhouse');
  const [hour, setHour] = useState(() => new Date().getHours());
  const [minute, setMinute] = useState(() => new Date().getMinutes());
  const [chartKey, setChartKey] = useState<SensorKey>('waterTemp');
  const [devices, setDevices] = useState(() =>
    Object.fromEntries(CONTROL_DEVICES.map(d => [d.id, { on: d.defaultOn, setpoint: d.setpoint?.value ?? 0 }])),
  );

  const zone = ZONES.find(z => z.id === zoneId)!;

  /* 1분마다 현재 시각 갱신 — 일중 곡선에서 현재 구간을 읽습니다 */
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setHour(now.getHours());
      setMinute(now.getMinutes());
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  /**
   * 현재 센서값 — 정시 값 사이를 분 단위로 보간해 자연스럽게 움직입니다.
   * (실제 센서가 연동되면 이 블록이 실측 스트림으로 대체됩니다.)
   */
  const readings = useMemo(() => {
    const out: Partial<Record<SensorKey, number>> = {};
    for (const key of zone.sensors) {
      const series = DIURNAL[zoneId]?.[key];
      if (!series) continue;
      const a = series[hour % 24];
      const b = series[(hour + 1) % 24];
      const v = a + (b - a) * (minute / 60);
      out[key] = Math.round(v * 1000) / 1000;
    }
    return out;
  }, [zoneId, zone.sensors, hour, minute]);

  /* 현재 차트 대상이 이 구역에 없으면 첫 센서로 되돌립니다 */
  useEffect(() => {
    if (!zone.sensors.includes(chartKey)) setChartKey(zone.sensors[0]);
  }, [zone, chartKey]);

  const zoneCrops = CROP_STATUS.filter(c => c.zone === zoneId);
  const zoneDevices = CONTROL_DEVICES.filter(d => d.zone === zoneId);
  const zoneAlerts = ALERT_RULES.filter(a => a.zone === zoneId);

  /* 경고 상태인 센서 모으기 — 광량처럼 야간 0 이 정상인 지표는 시각을 함께 넘깁니다 */
  const warnings = zone.sensors.filter(k => {
    const v = readings[k];
    return v !== undefined && judgeSensor(zoneId, k, v, hour) === 'warning';
  });

  const toggleDevice = (id: string) =>
    setDevices(p => ({ ...p, [id]: { ...p[id], on: !p[id].on } }));

  const setSetpoint = (id: string, value: number) =>
    setDevices(p => ({ ...p, [id]: { ...p[id], setpoint: value } }));

  const series = DIURNAL[zoneId]?.[chartKey] ?? [];
  const spec = SENSOR_SPECS[chartKey];
  const optRange = spec.optimal[zoneId];
  const sMin = Math.min(...series, optRange?.[0] ?? Infinity);
  const sMax = Math.max(...series, optRange?.[1] ?? -Infinity);
  const span = sMax - sMin || 1;

  return (
    <div className="min-h-screen mesh-bg pb-safe">
      {/* ══ 헤더 ══ */}
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-xl glass" aria-label="홈으로">
              <i className="ri-arrow-left-line text-xl text-gray-700 dark:text-gray-200" aria-hidden="true" />
            </Link>
            <div className="leading-none">
              <h1 className="text-[17px] font-black text-gray-900 dark:text-gray-50">스마트팜 데이터</h1>
              <p className="mt-1 text-[10.5px] font-bold text-wasabi-600 dark:text-wasabi-300">
                환경 계측 · 설비 제어
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5"
               title="IoT 게이트웨이 연결 전 — 모델링 값">
            <i className="ri-flask-line text-[11px] text-blue-600 dark:text-blue-300" aria-hidden="true" />
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-200">모델링</span>
            <span className="text-[10.5px] font-black text-blue-900 dark:text-blue-100" translate="no">
              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* ══ 구역 선택 ══ */}
      <section className="px-4 pt-4">
        <div className="snap-row pb-1">
          {ZONES.map(z => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZoneId(z.id)}
              aria-pressed={zoneId === z.id}
              className={`snap-item rounded-2xl px-3.5 py-2.5 text-left transition-all duration-300 ease-spring
                ${zoneId === z.id
                  ? `bg-gradient-to-br ${z.gradient} text-white shadow-depth-2 scale-[1.02]`
                  : 'glass text-gray-600 dark:text-gray-300'}`}
            >
              <span className="flex items-center gap-1.5">
                <i className={`${z.icon} text-sm`} aria-hidden="true" />
                <span className="text-[12px] font-black">{z.name}</span>
              </span>
              <span className={`block mt-0.5 text-[9.5px] font-bold ${zoneId === z.id ? 'text-white/75' : 'text-gray-400'}`}>
                {z.sub}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ══ 탭 ══ */}
      <div className="px-4 pt-3">
        <div className="glass rounded-2xl p-1 flex">
          {([
            { id: 'realtime' as const, label: '실시간', icon: 'ri-pulse-line' },
            { id: 'history'  as const, label: '일중 변화', icon: 'ri-line-chart-line' },
            { id: 'control'  as const, label: '설비 제어', icon: 'ri-settings-3-line' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black transition-all duration-300 ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-800 text-wasabi-600 dark:text-wasabi-300 shadow-depth-1'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <i className={t.icon} aria-hidden="true" />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ 경고 배너 ══ */}
      {warnings.length > 0 && (
        <section className="px-4 pt-4">
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50
                          p-3.5 flex items-start gap-2.5 animate-alert-breathe">
            <i className="ri-alarm-warning-line text-lg text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[12px] font-black text-red-800 dark:text-red-100">
                허용 범위를 벗어난 지표 {warnings.length}건
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-red-700 dark:text-red-200">
                {warnings.map(k => SENSOR_SPECS[k].label).join(' · ')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ══ 실시간 ══ */}
      {tab === 'realtime' && (
        <div className="px-4 pt-5 space-y-6">
          {/* 데이터 성격 고지 — 추정치를 실측처럼 보이게 하지 않습니다 */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40
                          p-3.5 flex items-start gap-2.5">
            <i className="ri-information-line text-lg text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[12px] font-black text-blue-900 dark:text-blue-100">
                IoT 게이트웨이 연결 전 — 현재 값은 모델링 값입니다
              </p>
              <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-blue-800/85 dark:text-blue-200/85">
                아래 수치는 10월 서울 기준 전형적인 하루를 모델링해 시각에 맞춰 보간한 값이며, 실측 센서값이 아닙니다.
                설비를 연결하면 같은 화면이 실측 스트림으로 대체됩니다.
              </p>
            </div>
          </div>

          {/* 센서 카드 */}
          <div className="grid grid-cols-2 gap-3">
            {zone.sensors.map((key, i) => {
              const v = readings[key];
              if (v === undefined) return null;
              const s = SENSOR_SPECS[key];
              const status = judgeSensor(zoneId, key, v, hour);
              const meta = STATUS_META[status];
              return (
                <div key={key} className={`glass-card p-4 relative overflow-hidden animate-rise-3d delay-step-${(i % 6) + 1}`}>
                  <span className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-2xl`}
                        aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-depth-1`}>
                        <i className={`${s.icon} text-base text-white`} aria-hidden="true" />
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-black ${meta.bg} ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className={`text-[26px] font-black leading-none ${meta.text}`} translate="no">
                      {fmtSensor(key, v)}
                      <span className="ml-1 text-[11px] font-bold text-gray-400">{s.unit}</span>
                    </p>
                    <p className="mt-1.5 text-[9.5px] font-bold text-gray-400" translate="no">
                      적정 {optimalLabel(zoneId, key)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 지표 해설 */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-black text-gray-900 dark:text-gray-50 mb-3">이 숫자를 왜 보나</p>
            <ul className="space-y-2.5">
              {zone.sensors.slice(0, 5).map(key => {
                const s = SENSOR_SPECS[key];
                return (
                  <li key={key} className="flex items-start gap-2.5">
                    <i className={`${s.icon} text-base text-wasabi-500 shrink-0 mt-0.5`} aria-hidden="true" />
                    <div>
                      <p className="text-[11.5px] font-black text-gray-800 dark:text-gray-100">{s.label}</p>
                      <p className="text-[11px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">{s.why}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 정식 준비 현황 — 1차 정식(2026.11) 전이라 생육 경과 대신 준비도를 봅니다 */}
          <div>
            <div className="flex items-end justify-between gap-2 mb-3">
              <h2 className="text-[17px] font-black text-gray-900 dark:text-gray-50">작물 정식 준비 현황</h2>
              <span className="chip !py-0.5 !text-[9.5px] shrink-0">
                <i className="ri-calendar-schedule-line" aria-hidden="true" />1차 정식 2026. 11
              </span>
            </div>
            <div className="space-y-2.5">
              {zoneCrops.map((c, i) => (
                <div key={`${c.crop}-${c.houseNo ?? 0}`} className={`glass-card p-4 animate-rise-3d delay-step-${(i % 6) + 1}`}>
                  <div className="flex items-start gap-3">
                    <span className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-wasabi-100 to-emeraldgreen-100
                                     dark:from-wasabi-900 dark:to-emeraldgreen-700/40 flex items-center justify-center text-2xl"
                          aria-hidden="true">
                      {c.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.houseNo && (
                          <span className="chip !py-0 !text-[9.5px]" translate="no">{c.houseNo}동</span>
                        )}
                        <p className="text-[13px] font-black text-gray-900 dark:text-gray-50">{c.crop}</p>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-black
                                         bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
                          {c.stage}
                        </span>
                      </div>

                      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px]">
                        <div className="flex gap-1.5">
                          <dt className="font-black text-gray-400 shrink-0">정식</dt>
                          <dd className="font-bold text-gray-600 dark:text-gray-300" translate="no">{c.plannedPlanting}</dd>
                        </div>
                        <div className="flex gap-1.5 min-w-0">
                          <dt className="font-black text-gray-400 shrink-0">첫 수확</dt>
                          <dd className="font-bold text-gray-600 dark:text-gray-300 truncate" translate="no">{c.plannedHarvest}</dd>
                        </div>
                      </dl>

                      {/* 준비도 */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-wasabi-400 to-emeraldgreen-600 transition-all duration-700 ease-smooth"
                            style={{ width: `${c.readiness}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-wasabi-600 dark:text-wasabi-300 shrink-0" translate="no">
                          준비 {c.readiness}%
                        </span>
                      </div>

                      <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{c.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 자원 사용량 */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-black text-gray-900 dark:text-gray-50 mb-3">자원 사용 현황</p>
            <div className="grid grid-cols-2 gap-2.5">
              {RESOURCE_USAGE.map(r => (
                <div key={r.label} className="rounded-2xl bg-wasabi-50 dark:bg-wasabi-900/40 p-3">
                  <i className={`${r.icon} text-base text-wasabi-600 dark:text-wasabi-300`} aria-hidden="true" />
                  <p className="mt-1 text-[16px] font-black text-gray-900 dark:text-gray-50 leading-none" translate="no">
                    {r.value}<span className="ml-0.5 text-[10px] font-bold text-gray-400">{r.unit}</span>
                  </p>
                  <p className="mt-1 text-[10px] font-black text-gray-600 dark:text-gray-300">{r.label}</p>
                  <p className="text-[9px] font-medium text-gray-400 leading-snug">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ 일중 변화 ══ */}
      {tab === 'history' && (
        <div className="px-4 pt-5 space-y-5">
          {/* 센서 선택 */}
          <div className="snap-row pb-1">
            {zone.sensors.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setChartKey(key)}
                aria-pressed={chartKey === key}
                className={`snap-item rounded-xl px-3 py-2 text-[11px] font-black transition-all duration-300
                  ${chartKey === key
                    ? 'bg-gradient-to-br from-wasabi-500 to-emeraldgreen-700 text-white shadow-depth-1'
                    : 'glass text-gray-600 dark:text-gray-300'}`}
              >
                {SENSOR_SPECS[key].label}
              </button>
            ))}
          </div>

          {/* 차트 */}
          <div className="glass-card p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-[14px] font-black text-gray-900 dark:text-gray-50">{spec.label} 일중 변화</p>
                <p className="text-[10.5px] font-bold text-gray-400" translate="no">
                  적정 {optimalLabel(zoneId, chartKey)}
                </p>
              </div>
              <span className="chip" translate="no">
                현재 {readings[chartKey] !== undefined ? fmtSensor(chartKey, readings[chartKey]!) : '—'} {spec.unit}
              </span>
            </div>

            <div className="relative h-44 mt-4">
              {/* 적정 구간 밴드 */}
              {optRange && (
                <div
                  className="absolute inset-x-0 bg-wasabi-100/70 dark:bg-wasabi-900/40 border-y border-dashed border-wasabi-300 dark:border-wasabi-700"
                  style={{
                    bottom: `${((optRange[0] - sMin) / span) * 100}%`,
                    height: `${((optRange[1] - optRange[0]) / span) * 100}%`,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* 막대 */}
              <div className="absolute inset-0 flex items-end gap-[2px]">
                {series.map((v, h) => {
                  const st = judgeSensor(zoneId, chartKey, v, h);
                  const isNow = h === hour;
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full rounded-t transition-all duration-500
                          ${st === 'warning' ? 'bg-red-400'
                          : st === 'optimal' ? 'bg-gradient-to-t from-wasabi-500 to-wasabi-300'
                          :                    'bg-gradient-to-t from-blue-500 to-blue-300'}
                          ${isNow ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-1 dark:ring-offset-gray-900' : ''}`}
                        style={{ height: `${Math.max(3, ((v - sMin) / span) * 100)}%` }}
                        title={`${String(h).padStart(2, '0')}시 · ${fmtSensor(chartKey, v)}${spec.unit}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 시간축 */}
            <div className="mt-1.5 flex justify-between text-[9px] font-bold text-gray-400" translate="no">
              {[0, 6, 12, 18, 23].map(h => <span key={h}>{String(h).padStart(2, '0')}시</span>)}
            </div>

            {/* 요약 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { k: '최저', v: Math.min(...series) },
                { k: '평균', v: series.reduce((a, b) => a + b, 0) / (series.length || 1) },
                { k: '최고', v: Math.max(...series) },
              ].map(r => (
                <div key={r.k} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                  <p className="text-[9.5px] font-black text-gray-400">{r.k}</p>
                  <p className="text-[14px] font-black text-gray-900 dark:text-gray-50" translate="no">
                    {fmtSensor(chartKey, r.v)}<span className="text-[9px] text-gray-400 ml-0.5">{spec.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10.5px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
              {spec.why}
            </p>
          </div>

          <p className="text-[10px] font-medium text-gray-400 leading-relaxed px-1">
            ※ 10월 서울 기준 전형적인 하루를 모델링한 값이며 실측 기록이 아닙니다.
            IoT 게이트웨이를 연결하면 실측 스트림으로 대체됩니다.
            광량은 야간 0 이 정상이므로 주간 구간(06~18시)만 적정 여부를 판정합니다.
          </p>
        </div>
      )}

      {/* ══ 설비 제어 ══ */}
      {tab === 'control' && (
        <div className="px-4 pt-5 space-y-5">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/50
                          p-3.5 flex items-start gap-2.5">
            <i className="ri-shield-flash-line text-lg text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] font-bold leading-relaxed text-amber-900 dark:text-amber-100">
              설비 조작은 작물에 바로 영향을 줍니다. 특히 <b>워터칠러와 순환 펌프</b>는 정지 시 고추냉이 근경이 수 시간 내에 손상될 수 있습니다.
            </p>
          </div>

          {zoneDevices.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <i className="ri-settings-3-line text-4xl text-gray-300" aria-hidden="true" />
              <p className="mt-3 text-[12px] font-bold text-gray-500">이 구역에는 원격 제어 설비가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {zoneDevices.map(d => {
                const st = devices[d.id];
                return (
                  <div key={d.id} className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center shadow-depth-1
                        ${st.on ? 'bg-gradient-to-br from-wasabi-400 to-emeraldgreen-700' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <i className={`${d.icon} text-lg ${st.on ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-gray-900 dark:text-gray-50">{d.name}</p>
                        <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400">{d.note}</p>
                        <p className="mt-0.5 text-[9.5px] font-bold text-wasabi-600 dark:text-wasabi-300">
                          제어 지표 · {SENSOR_SPECS[d.controls].label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDevice(d.id)}
                        aria-pressed={st.on}
                        aria-label={`${d.name} ${st.on ? '끄기' : '켜기'}`}
                        className={`w-12 h-7 shrink-0 rounded-full transition-all duration-300 relative
                          ${st.on ? 'bg-wasabi-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300
                          ${st.on ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {d.setpoint && st.on && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-gray-500 dark:text-gray-400">설정값</span>
                          <span className="font-black text-wasabi-600 dark:text-wasabi-300" translate="no">
                            {st.setpoint}{d.setpoint.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={d.setpoint.min}
                          max={d.setpoint.max}
                          step={d.setpoint.step}
                          value={st.setpoint}
                          onChange={e => setSetpoint(d.id, Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-wasabi-500"
                          aria-label={`${d.name} 설정값`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 알림 규칙 */}
          <div>
            <h2 className="text-[17px] font-black text-gray-900 dark:text-gray-50 mb-3">자동 알림 규칙</h2>
            <div className="space-y-2.5">
              {zoneAlerts.map(a => (
                <div key={a.id} className="glass-card p-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full
                      ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <p className="text-[12px] font-black text-gray-900 dark:text-gray-50">
                      {SENSOR_SPECS[a.sensor].label}
                    </p>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-black
                      ${a.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200'
                      : a.severity === 'warning'  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200'
                      :                             'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200'}`}>
                      {a.severity === 'critical' ? '긴급' : a.severity === 'warning' ? '주의' : '안내'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] font-bold text-gray-700 dark:text-gray-200">{a.condition}</p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                    <i className="ri-arrow-right-line mr-1" aria-hidden="true" />{a.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link to="/device-control" className="btn-ghost w-full">
            <i className="ri-remote-control-line" aria-hidden="true" />
            장비 직접 연결 (QR · IP)
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
