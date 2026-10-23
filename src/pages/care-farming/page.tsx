import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import Tilt3D from '@/components/Tilt3D';
import CareProgramImage from '@/components/CareProgramImage';
import {
  CARE_PROGRAMS,
  CARE_EVIDENCE,
  CARE_TECH_FUSION,
  CARE_CERT_ROADMAP,
  CARE_LEGAL,
  FARM_PROFILE,
} from '@/data/farmStory';

export default function CareFarmingPage() {
  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title="치유농업" subtitle="대상별 5개 프로그램 · 인증 추진 중" />

      {/* ══ 히어로 ══ */}
      <section className="px-4 pt-5 pb-6">
        <div className="relative rounded-5xl overflow-hidden shadow-depth-4 grain
                        bg-gradient-to-br from-rose-600 via-soil-500 to-emeraldgreen-700 p-6">
          <span className="orb -top-14 -left-10 w-60 h-60 bg-rose-300/45" aria-hidden="true" />
          <span className="orb -bottom-16 -right-8 w-56 h-56 bg-emeraldgreen-300/40" aria-hidden="true" />

          <div className="relative z-10">
            <span className="chip !bg-white/15 !text-white !border-white/25">
              <i className="ri-heart-pulse-line" aria-hidden="true" />CARE FARMING
            </span>
            <h1 className="mt-3 text-[28px] leading-tight font-black text-white">
              서초구민에게<br />돌아가는 것
            </h1>
            <p className="mt-3 text-[12.5px] leading-relaxed font-medium text-white/85">
              향재원의 재배 현장은 그대로 치유농업 공간이 됩니다.
              직장인 · 시니어 · 어린이 · 가족 · 복지기관에게 각기 다른 효과를 돌려줍니다.
              그 효과는 농촌진흥청이 이미 수치로 검증해 두었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 준비 단계 고지 ══ */}
      <section className="px-4 pb-6">
        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/60
                        bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-900
                        p-4 shadow-depth-1">
          <p className="flex items-start gap-2 text-[12px] font-bold leading-relaxed text-amber-900 dark:text-amber-100">
            <i className="ri-information-fill text-base text-amber-500 mt-px shrink-0" aria-hidden="true" />
            <span>{CARE_LEGAL.notice}</span>
          </p>
        </div>
      </section>

      {/* ══ 농촌진흥청 실증 근거 ══ */}
      <section className="px-4 pb-8">
        <span className="eyebrow"><i className="ri-bar-chart-2-line" aria-hidden="true" />EVIDENCE</span>
        <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">
          효과는 이미 <span className="text-gradient">수치로 검증</span>되어 있습니다
        </h2>
        <p className="mt-2 text-[12px] font-medium text-gray-500 dark:text-gray-400">
          아래는 농촌진흥청이 발표한 치유농업 실증 결과입니다. 향재원의 프로그램은 이 결과 위에서 설계했습니다.
        </p>

        <div className="mt-4 snap-row pb-2 -mx-1 px-1">
          {CARE_EVIDENCE.map((e, i) => (
            <article
              key={e.id}
              className={`snap-item w-[16.5rem] rounded-4xl overflow-hidden shadow-depth-2 grain p-4 text-white
                          relative animate-rise-3d delay-step-${(i % 6) + 1}`}
            >
              <span className={`absolute inset-0 bg-gradient-to-br ${e.gradient}`} aria-hidden="true" />
              <span className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <i className={`${e.icon} text-lg`} aria-hidden="true" />
                  </span>
                  <div className="leading-none min-w-0">
                    <p className="text-[12.5px] font-black truncate">{e.target}</p>
                    <p className="mt-1 text-[10px] font-bold text-white/70 truncate" translate="no">{e.sample}</p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {e.metrics.map(m => (
                    <li key={m.label} className="flex items-center gap-1.5 rounded-xl bg-white/15 backdrop-blur-md px-2.5 py-1.5">
                      <i className={`${m.dir === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-[11px] shrink-0`}
                         aria-hidden="true" />
                      <span className="text-[10.5px] font-bold flex-1 min-w-0 truncate">{m.label}</span>
                      <span className="text-[11px] font-black shrink-0" translate="no">{m.value}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-2.5 text-[9.5px] font-bold text-white/60 leading-snug">출처 · {e.source}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══ 프로그램 5종 ══ */}
      <section className="px-4 pb-8 scene">
        <span className="eyebrow"><i className="ri-seedling-line" aria-hidden="true" />PROGRAMS</span>
        <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">대상별 프로그램</h2>
        <p className="mt-2 text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          같은 밭이라도 7세와 70세가 얻는 것은 다릅니다. 대상마다 활동·강도·결합 기술을 따로 설계했습니다.
        </p>

        <div className="space-y-4">
          {CARE_PROGRAMS.map((p, i) => (
            <Tilt3D key={p.id} className={`rounded-4xl animate-rise-3d delay-step-${(i % 6) + 1}`} max={5}>
              <Link
                to={`/care-farming/${p.id}`}
                className="block rounded-4xl overflow-hidden shadow-depth-3 bg-white/80 dark:bg-gray-900/70
                           border border-white/60 dark:border-gray-700/60 group"
              >
                {/* 대표 이미지 */}
                <div className="relative h-36 overflow-hidden">
                  <CareProgramImage program={p} className="w-full h-full" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${p.gradient} opacity-55 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/22 backdrop-blur-md
                                     border border-white/30 px-2 py-0.5 text-[10px] font-black">
                      <i className={p.icon} aria-hidden="true" />{p.target}
                    </span>
                    <p className="mt-1 text-[19px] font-black leading-tight drop-shadow">{p.name}</p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[12.5px] font-bold text-gray-800 dark:text-gray-100 leading-snug">{p.summary}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">{p.format}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.resources.slice(0, 3).map(r => (
                      <span key={r} className="chip !text-[10px] !py-0.5">{r}</span>
                    ))}
                  </div>

                  <p className="mt-3 inline-flex items-center gap-0.5 text-[11.5px] font-black
                                text-wasabi-600 dark:text-wasabi-300 group-hover:gap-1.5 transition-all">
                    프로그램 상세 보기 <i className="ri-arrow-right-line" aria-hidden="true" />
                  </p>
                </div>
              </Link>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* ══ 치유농업 × 첨단농업 ══ */}
      <section className="px-4 pb-8 scene">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">
          치유농업 × <span className="text-gradient">첨단 농업</span>
        </h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          향재원의 치유농업은 감성만으로 설계되지 않습니다. 작물을 기르기 위해 만든 기술이 그대로 사람을 위한 환경이 됩니다.
        </p>

        <div className="space-y-2.5">
          {CARE_TECH_FUSION.map((f, i) => (
            <Link key={f.id} to={f.link} className={`block group animate-rise-3d delay-step-${i + 1}`}>
              <div className="glass-card card-3d p-4 flex items-start gap-3">
                <span className="mt-0.5 w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emeraldgreen-400 to-blueangel-700
                                 flex items-center justify-center shadow-depth-2
                                 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <i className={`${f.icon} text-lg text-white`} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-black text-gray-900 dark:text-gray-50 leading-snug">{f.title}</p>
                  <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{f.desc}</p>
                  <p className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-black text-wasabi-600 dark:text-wasabi-300
                                group-hover:gap-1.5 transition-all">
                    {f.linkLabel} <i className="ri-arrow-right-line" aria-hidden="true" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ 제도 · 인증 로드맵 ══ */}
      <section className="px-4 pb-10">
        <div className="glass-card p-5">
          <span className="eyebrow"><i className="ri-award-line" aria-hidden="true" />ROADMAP</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">제도적 뒷받침</h2>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { k: '근거 법률', v: CARE_LEGAL.law, sub: CARE_LEGAL.lawYear, icon: 'ri-scales-3-line' },
              { k: '목표 인증', v: CARE_LEGAL.cert, sub: `${CARE_LEGAL.certAuthority} · ${CARE_LEGAL.certYear}`, icon: 'ri-medal-line' },
            ].map(r => (
              <div key={r.k} className="rounded-2xl bg-wasabi-50 dark:bg-wasabi-900/40 border border-wasabi-100 dark:border-wasabi-800 p-3">
                <i className={`${r.icon} text-base text-wasabi-600 dark:text-wasabi-300`} aria-hidden="true" />
                <p className="mt-1 text-[9.5px] font-black text-gray-400">{r.k}</p>
                <p className="text-[11.5px] font-black text-gray-900 dark:text-gray-50 leading-snug">{r.v}</p>
                <p className="mt-0.5 text-[10px] font-bold text-wasabi-600 dark:text-wasabi-300">{r.sub}</p>
              </div>
            ))}
          </div>

          <ol className="mt-4 relative pl-7">
            <span className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-wasabi-400 via-amber-300 to-gray-200 dark:to-gray-700"
                  aria-hidden="true" />
            {CARE_CERT_ROADMAP.map(s => (
              <li key={s.step} className="relative pb-4 last:pb-0">
                <span className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
                  ${s.status === 'done'  ? 'bg-wasabi-500 text-white'
                  : s.status === 'doing' ? 'bg-amber-400 text-amber-950 animate-harvest-glow'
                  :                        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {s.status === 'done' ? <i className="ri-check-line" aria-hidden="true" /> : s.step}
                </span>
                <p className="text-[13px] font-black text-gray-900 dark:text-gray-50">
                  {s.label}
                  {s.status === 'doing' && <span className="ml-1.5 chip !py-0 !text-[9px]">진행 중</span>}
                  {s.status === 'done'  && <span className="ml-1.5 chip !py-0 !text-[9px]">완료</span>}
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 pt-4 hairline">
            <p className="text-[11px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
              프로그램 운영 계획·협력 문의는 {FARM_PROFILE.phone} 으로 연락해 주세요.
              방문은 재배 일정에 따라 제한될 수 있어 사전 협의가 필요합니다.
            </p>
            <Link to="/visit" className="btn-primary w-full mt-3">
              <i className="ri-information-line" aria-hidden="true" />
              방문 안내 확인
            </Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
