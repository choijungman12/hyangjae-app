import { Link } from 'react-router-dom';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import WasabiMark from '@/components/WasabiMark';
import Tilt3D from '@/components/Tilt3D';
import HydroponicBedArt from '@/components/HydroponicBedArt';
import UploadedHeroPhoto from '@/components/UploadedHeroPhoto';
import { FARM_PROFILE, WASABI } from '@/data/farmStory';

export default function WasabiPage() {
  const [stage, setStage] = useState(0);

  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title="고추냉이" subtitle="유기농 수경재배 · 무농약" />

      {/* ══ 히어로 ══ */}
      <section className="px-4 pt-5 pb-6">
        <div className="relative rounded-5xl overflow-hidden shadow-depth-4 grain
                        bg-gradient-to-br from-wasabi-900 via-emeraldgreen-700 to-wasabi-950 p-6">
          <span className="orb -top-14 -right-10 w-64 h-64 bg-wasabi-400/50" aria-hidden="true" />
          <span className="orb -bottom-16 -left-10 w-56 h-56 bg-emeraldgreen-300/40" aria-hidden="true" />

          <div className="relative z-10">
            <WasabiMark className="w-16 h-16 drop-shadow-2xl" animated />
            <h1 className="mt-4 text-[30px] leading-tight font-black text-white">
              {WASABI.name}
              <span className="ml-2 text-base font-bold text-wasabi-200" translate="no">{WASABI.alias}</span>
            </h1>
            <p className="mt-1 text-[12px] font-bold italic text-white/70" translate="no">
              {WASABI.scientific} · {WASABI.family}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="chip !bg-white/15 !text-white !border-white/25">
                <i className="ri-leaf-line" aria-hidden="true" />무농약 재배
              </span>
              <span className="chip !bg-white/15 !text-white !border-white/25">
                <i className="ri-water-flash-line" aria-hidden="true" />흙 없는 수경
              </span>
              <span className="chip !bg-white/15 !text-white !border-white/25">
                <i className="ri-flag-line" aria-hidden="true" />{FARM_PROFILE.origin}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 왜 이 작물인가 ══ */}
      <section className="px-4 pb-8 space-y-3">
        <div className="glass-card p-5">
          <span className="eyebrow"><i className="ri-question-line" aria-hidden="true" />THE PROBLEM</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">국내에서 가장 기르기 어려운 작물</h2>
          <p className="mt-2 text-[13px] leading-relaxed font-medium text-gray-600 dark:text-gray-400">
            {WASABI.whyHard}
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 !border-l-wasabi-500">
          <span className="eyebrow"><i className="ri-lightbulb-flash-line" aria-hidden="true" />THE ANSWER</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">흙 없이, 농약 없이</h2>
          <p className="mt-2 text-[13px] leading-relaxed font-medium text-gray-600 dark:text-gray-400">
            {WASABI.whySmartFarm}
          </p>
        </div>
      </section>

      {/* ══ 시장에서의 위치 ══ */}
      <section className="px-4 pb-8">
        <span className="eyebrow"><i className="ri-bar-chart-box-line" aria-hidden="true" />MARKET</span>
        <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50 mb-4">왜 고추냉이인가</h2>
        <div className="space-y-2.5">
          {WASABI.market.map((m, i) => (
            <div key={m.title} className={`glass-card p-4 flex items-start gap-3 animate-rise-3d delay-step-${i + 1}`}>
              <span className="mt-0.5 w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-br from-wasabi-400 to-emeraldgreen-700
                               flex items-center justify-center shadow-depth-2">
                <i className={`${m.icon} text-base text-white`} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-black text-gray-900 dark:text-gray-50 leading-snug">{m.title}</p>
                <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 재배 설비 — 평면 단면 일러스트 ══ */}
      <section className="px-4 pb-8">
        <span className="eyebrow"><i className="ri-stack-line" aria-hidden="true" />SYSTEM</span>
        <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50 mb-1">3단 다단 베드 · 총 연장 634.5m</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          양액이 순환하며 수온 13℃와 높은 용존산소를 유지합니다. 흙이 없으니 토양 병해충이 들어올 길이 없습니다.
        </p>

        <Tilt3D className="rounded-4xl" max={5}>
          <div className="rounded-4xl overflow-hidden shadow-depth-3 border border-white/60 dark:border-gray-700/60">
            <UploadedHeroPhoto
              imageKey="facility-greenhouse-thumb"
              alt="고추냉이 수경 온실 내부 — 3단 다단 베드"
              className="w-full h-56"
              fallback={
                <HydroponicBedArt
                  className="w-full h-56 bg-wasabi-50 dark:bg-wasabi-950"
                  title="고추냉이 3단 다단 수경 베드 단면도"
                />
              }
            />
          </div>
        </Tilt3D>

        <div className="mt-4 space-y-2.5">
          {WASABI.system.map((s, i) => (
            <div key={s.key} className={`glass-card p-4 animate-rise-3d delay-step-${(i % 6) + 1}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-br from-emeraldgreen-400 to-blueangel-700
                                 flex items-center justify-center shadow-depth-2">
                  <i className={`${s.icon} text-base text-white`} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-black tracking-wider text-gray-400">{s.label}</p>
                  <p className="text-[13px] font-black text-gray-900 dark:text-gray-50 leading-snug">{s.value}</p>
                  <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{s.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 환경 제어 기준값 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">재배 환경 기준값</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          IoT 센서가 수온 · EC · pH · 용존산소 · 광량을 실시간으로 기록하고 원격으로 제어합니다.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {WASABI.environment.map((e, i) => (
            <Tilt3D key={e.key} className={`rounded-3xl animate-rise-3d delay-step-${(i % 6) + 1}`} max={7}>
              <div className="glass-card p-4 h-full">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-wasabi-400 to-emeraldgreen-700
                                flex items-center justify-center shadow-depth-2">
                  <i className={`${e.icon} text-lg text-white`} aria-hidden="true" />
                </div>
                <p className="mt-3 text-[11px] font-bold text-gray-500 dark:text-gray-400">{e.label}</p>
                <p className="text-[17px] font-black text-gray-900 dark:text-gray-50 leading-tight" translate="no">
                  {e.value}
                  {e.unit && <span className="ml-1 text-[11px] font-bold text-wasabi-600 dark:text-wasabi-300">{e.unit}</span>}
                </p>
              </div>
            </Tilt3D>
          ))}
        </div>

        <Link to="/smart-farm-data" className="btn-primary w-full mt-4">
          <i className="ri-dashboard-3-line" aria-hidden="true" />
          실시간 환경 데이터 보기
        </Link>
      </section>

      {/* ══ 생육 단계 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">정식부터 근경 수확까지 18개월</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          잎과 줄기는 정식 4개월째부터 나오지만, 근경은 18개월을 기다려야 상품이 됩니다.
        </p>

        <div className="snap-row pb-2 -mx-1 px-1">
          {WASABI.stages.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStage(i)}
              className={`snap-item rounded-2xl px-3.5 py-2 text-[11px] font-black transition-all duration-300 ease-spring
                ${i === stage
                  ? 'bg-gradient-to-br from-wasabi-500 to-emeraldgreen-700 text-white shadow-glow-wasabi scale-105'
                  : 'glass text-gray-600 dark:text-gray-300'}`}
              aria-pressed={i === stage}
            >
              <span translate="no">{s.month}개월</span> · {s.label}
            </button>
          ))}
        </div>

        <div className="mt-3 glass-card p-5">
          <p className="text-[10px] font-black tracking-[0.16em] text-wasabi-600 dark:text-wasabi-300" translate="no">
            STAGE {stage + 1} / {WASABI.stages.length}
          </p>
          <p className="mt-1 text-xl font-black text-gray-900 dark:text-gray-50">{WASABI.stages[stage].label}</p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
            {WASABI.stages[stage].desc}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-wasabi-400 to-emeraldgreen-600 transition-all duration-700 ease-smooth"
              style={{ width: `${((stage + 1) / WASABI.stages.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* ══ 생산 계획 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">생산 계획</h2>
        <ol className="relative pl-7">
          <span className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-wasabi-400 to-gray-200 dark:to-gray-700"
                aria-hidden="true" />
          {WASABI.plan.map((p, i) => (
            <li key={p.when} className={`relative pb-4 last:pb-0 animate-rise-3d delay-step-${i + 1}`}>
              <span className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
                ${p.status === 'doing'
                  ? 'bg-amber-400 text-amber-950 animate-harvest-glow'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {i + 1}
              </span>
              <p className="text-[10px] font-black tracking-wider text-wasabi-600 dark:text-wasabi-300" translate="no">{p.when}</p>
              <p className="text-[13.5px] font-black text-gray-900 dark:text-gray-50 leading-snug">{p.what}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══ 부위별 활용 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">버릴 것이 없는 작물</h2>
        <div className="grid grid-cols-2 gap-3">
          {WASABI.parts.map((p, i) => (
            <div key={p.part} className={`glass-card p-4 animate-rise-3d delay-step-${i + 1}`}>
              <i className={`${p.icon} text-xl text-wasabi-500 dark:text-wasabi-300`} aria-hidden="true" />
              <p className="mt-2 text-[14px] font-black text-gray-900 dark:text-gray-50">{p.part}</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{p.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 기능성 연구 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">알려진 기능성</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          아래는 보고된 연구 결과이며, 특정 질병의 예방·치료 효과를 보장하지 않습니다.
        </p>
        <div className="space-y-2.5">
          {WASABI.health.map((h, i) => (
            <div key={h.title} className={`glass-card p-4 flex items-start gap-3 animate-rise-3d delay-step-${i + 1}`}>
              <span className="mt-0.5 w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-700
                               flex items-center justify-center shadow-depth-2">
                <i className={`${h.icon} text-base text-white`} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-black text-gray-900 dark:text-gray-50">{h.title}</p>
                <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{h.desc}</p>
                {'note' in h && h.note && (
                  <p className="mt-1.5 text-[11px] font-bold text-wasabi-600 dark:text-wasabi-300">{h.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 판로 ══ */}
      <section className="px-4 pb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">판로</h2>
        <div className="grid grid-cols-2 gap-3">
          {WASABI.channels.map((c, i) => (
            <div key={c.title} className={`glass-card p-4 animate-rise-3d delay-step-${i + 1}`}>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-wasabi-100 to-emeraldgreen-100
                               dark:from-wasabi-900 dark:to-emeraldgreen-700/40 flex items-center justify-center">
                <i className={`${c.icon} text-base text-wasabi-600 dark:text-wasabi-300`} aria-hidden="true" />
              </span>
              <p className="mt-2 text-[12.5px] font-black text-gray-900 dark:text-gray-50">{c.title}</p>
              <p className="mt-1 text-[10.5px] font-medium leading-snug text-gray-500 dark:text-gray-400">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link to="/houses" className="btn-ghost flex-1">
            <i className="ri-home-4-line" aria-hidden="true" />재배동 8동
          </Link>
          <Link to="/visit" className="btn-ghost flex-1">
            <i className="ri-information-line" aria-hidden="true" />방문 안내
          </Link>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
