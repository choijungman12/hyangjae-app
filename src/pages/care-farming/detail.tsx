import { Link, useParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import Tilt3D from '@/components/Tilt3D';
import CareProgramImage from '@/components/CareProgramImage';
import {
  CARE_PROGRAMS,
  getCareProgram,
  getCareEvidence,
  CARE_LEGAL,
  NO_FOOD_NOTICE,
  FARM_PROFILE,
} from '@/data/farmStory';

export default function CareProgramDetail() {
  const { programId } = useParams<{ programId: string }>();
  const program = programId ? getCareProgram(programId) : undefined;

  if (!program) {
    return (
      <div className="min-h-screen mesh-bg pb-safe">
        <PageHeader title="치유농업" backTo="/care-farming" />
        <div className="px-4 pt-16 text-center">
          <i className="ri-seedling-line text-5xl text-gray-300" aria-hidden="true" />
          <p className="mt-4 text-sm font-black text-gray-700 dark:text-gray-200">프로그램을 찾을 수 없습니다</p>
          <Link to="/care-farming" className="btn-primary mt-5">
            <i className="ri-arrow-left-line" aria-hidden="true" />전체 프로그램 보기
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const evidence = program.evidenceIds.map(getCareEvidence).filter(Boolean);
  const others = CARE_PROGRAMS.filter(p => p.id !== program.id);

  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title={program.name} subtitle={program.target} backTo="/care-farming" />

      {/* ══ 히어로 — 대표 이미지 ══ */}
      <section className="px-4 pt-5 pb-6">
        <Tilt3D className="rounded-5xl" max={5}>
          <div className="relative rounded-5xl overflow-hidden shadow-depth-4">
            <CareProgramImage program={program} className="w-full h-56" />
            <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} opacity-55 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-5 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md
                               border border-white/30 px-2.5 py-1 text-[10.5px] font-black">
                <i className={program.icon} aria-hidden="true" />
                {program.targetDetail}
              </span>
              <h1 className="mt-2 text-[26px] font-black leading-tight drop-shadow">{program.name}</h1>
              <p className="mt-1 text-[12px] font-bold text-white/85 leading-snug">{program.summary}</p>
            </div>
          </div>
        </Tilt3D>

        <div className="mt-3 glass-card p-3 flex items-center gap-2">
          <i className="ri-calendar-schedule-line text-base text-wasabi-600 dark:text-wasabi-300" aria-hidden="true" />
          <span className="text-[11.5px] font-black text-gray-800 dark:text-gray-100">{program.format}</span>
        </div>
      </section>

      {/* ══ 왜 이 프로그램인가 ══ */}
      <section className="px-4 pb-8">
        <div className="glass-card p-5 border-l-4 !border-l-wasabi-500">
          <span className="eyebrow"><i className="ri-question-answer-line" aria-hidden="true" />WHY</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">왜 이렇게 설계했나</h2>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
            {program.why}
          </p>
        </div>
      </section>

      {/* ══ 커리큘럼 ══ */}
      <section className="px-4 pb-8">
        <span className="eyebrow"><i className="ri-route-line" aria-hidden="true" />CURRICULUM</span>
        <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50 mb-4">진행 순서</h2>

        <ol className="relative pl-8">
          <span className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-wasabi-400 to-emeraldgreen-600"
                aria-hidden="true" />
          {program.curriculum.map((c, i) => (
            <li key={c.step} className={`relative pb-5 last:pb-0 animate-rise-3d delay-step-${i + 1}`}>
              <span className={`absolute -left-8 top-1 w-7 h-7 rounded-xl bg-gradient-to-br ${program.gradient}
                               text-white flex items-center justify-center text-[10px] font-black shadow-depth-2`}
                    translate="no">
                {i + 1}
              </span>
              <p className="text-[10px] font-black tracking-wider text-wasabi-600 dark:text-wasabi-300" translate="no">
                {c.step}
              </p>
              <p className="text-[14.5px] font-black text-gray-900 dark:text-gray-50 leading-tight">{c.title}</p>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{c.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══ 치유 자원 · 결합 기술 ══ */}
      <section className="px-4 pb-8 grid grid-cols-1 gap-3">
        <div className="glass-card p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-gray-900 dark:text-gray-50">
            <i className="ri-leaf-line text-wasabi-500" aria-hidden="true" />치유 자원
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {program.resources.map(r => (
              <span key={r} className="chip">{r}</span>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-gray-900 dark:text-gray-50">
            <i className="ri-cpu-line text-blueangel-700 dark:text-blueangel-300" aria-hidden="true" />결합 기술
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {program.tech.map(t => (
              <li key={t} className="flex items-start gap-1.5 text-[12px] font-bold text-gray-700 dark:text-gray-300">
                <i className="ri-checkbox-circle-line text-blueangel-500 mt-px shrink-0" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ 기대 효과 — 농진청 실증 근거 ══ */}
      {evidence.length > 0 && (
        <section className="px-4 pb-8">
          <span className="eyebrow"><i className="ri-bar-chart-2-line" aria-hidden="true" />EVIDENCE</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50 mb-1">기대 효과</h2>
          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
            이 프로그램이 근거로 삼은 농촌진흥청 실증 결과입니다.
          </p>

          <div className="space-y-3">
            {evidence.map((e, i) => e && (
              <article key={e.id}
                       className={`relative rounded-4xl overflow-hidden shadow-depth-2 grain p-4 text-white
                                   animate-rise-3d delay-step-${i + 1}`}>
                <span className={`absolute inset-0 bg-gradient-to-br ${e.gradient}`} aria-hidden="true" />
                <span className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <i className={`${e.icon} text-lg`} aria-hidden="true" />
                    </span>
                    <div className="leading-none">
                      <p className="text-[13px] font-black">{e.target}</p>
                      <p className="mt-1 text-[10px] font-bold text-white/70" translate="no">{e.sample}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {e.metrics.map(m => (
                      <div key={m.label} className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-2.5">
                        <p className="flex items-center gap-1 text-[9.5px] font-bold text-white/75">
                          <i className={m.dir === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} aria-hidden="true" />
                          {m.label}
                        </p>
                        <p className="mt-0.5 text-[13px] font-black" translate="no">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-2.5 text-[9.5px] font-bold text-white/65">출처 · {e.source}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ══ 참여 안내 ══ */}
      <section className="px-4 pb-8">
        <div className="rounded-4xl border border-amber-200 dark:border-amber-900/60
                        bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-900
                        p-5 shadow-depth-2">
          <p className="flex items-center gap-1.5 text-[13.5px] font-black text-amber-900 dark:text-amber-50">
            <i className="ri-information-fill text-amber-500" aria-hidden="true" />참여 안내
          </p>
          <p className="mt-2 text-[12px] font-bold leading-relaxed text-amber-900/85 dark:text-amber-100/85">
            {CARE_LEGAL.notice}
          </p>

          <div className="mt-3 rounded-2xl bg-white/70 dark:bg-gray-900/50 border border-amber-100 dark:border-amber-900/50 p-3">
            <p className="text-[11px] font-black text-gray-800 dark:text-gray-100 flex items-center gap-1">
              <i className="ri-forbid-2-line text-red-500" aria-hidden="true" />프로그램 중에도 취식은 불가합니다
            </p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
              {NO_FOOD_NOTICE.programNote} 취식과 화기 사용은 농장 전역에서 전면 불가합니다.
            </p>
          </div>

          <a href={`tel:${FARM_PROFILE.phone.replace(/-/g, '')}`} className="btn-primary w-full mt-4">
            <i className="ri-phone-fill" aria-hidden="true" />
            <span translate="no">{FARM_PROFILE.phone}</span> · 협력 문의
          </a>
          <Link to="/visit" className="btn-ghost w-full mt-2">
            <i className="ri-information-line" aria-hidden="true" />방문 안내 확인
          </Link>
        </div>
      </section>

      {/* ══ 다른 프로그램 ══ */}
      <section className="px-4 pb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">다른 프로그램</h2>
        <div className="snap-row pb-2 -mx-1 px-1">
          {others.map(o => (
            <Link key={o.id} to={`/care-farming/${o.id}`}
                  className="snap-item w-[13.5rem] rounded-3xl overflow-hidden shadow-depth-2 bg-white/80 dark:bg-gray-900/70
                             border border-white/60 dark:border-gray-700/60">
              <div className="relative h-24">
                <CareProgramImage program={o} className="w-full h-full" />
                <div className={`absolute inset-0 bg-gradient-to-br ${o.gradient} opacity-55 mix-blend-multiply`} />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-black text-wasabi-600 dark:text-wasabi-300">{o.target}</p>
                <p className="text-[13px] font-black text-gray-900 dark:text-gray-50 leading-tight">{o.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
