import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import NoFoodNotice from '@/components/NoFoodNotice';
import WasabiMark from '@/components/WasabiMark';
import { FARM_PROFILE, VISIT_RULES, STORY_ROUTES } from '@/data/farmStory';

/** 방문 가능한 목적 — 생산 시설이므로 목적이 분명한 방문만 받습니다. */
const VISIT_PURPOSES = [
  {
    icon: 'ri-store-2-line',
    title: '농산물 구매 · 상담',
    desc: '고추냉이 가공품과 유러피안 특수작물, 노지 조경수·화훼의 구매·납품 상담',
    gradient: 'from-wasabi-400 to-emeraldgreen-700',
  },
  {
    icon: 'ri-building-line',
    title: '기관 · 사업 협의',
    desc: '치유농업 프로그램 협력, 스마트팜 기술 교류, 농업 관련 기관 방문',
    gradient: 'from-blueangel-300 to-blueangel-700',
  },
  {
    icon: 'ri-graduation-cap-line',
    title: '영농 견학',
    desc: '고추냉이 수경재배·환경제어 설비 견학 (재배 일정에 따라 제한될 수 있습니다)',
    gradient: 'from-amber-400 to-orange-600',
  },
];

export default function VisitPage() {
  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title="방문 안내" subtitle="농산물 생산 시설 이용 수칙" />

      {/* ══ 취식 불가 — 전체 카드 ══ */}
      <section className="px-4 pt-5 pb-6">
        <NoFoodNotice variant="full" />
      </section>

      {/* ══ 우리는 어떤 곳인가 ══ */}
      <section className="px-4 pb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5">
            <WasabiMark className="w-9 h-9" animated />
            <div className="leading-none">
              <p className="text-[16px] font-black text-gray-900 dark:text-gray-50">{FARM_PROFILE.nameKo}</p>
              <p className="mt-1 text-[10.5px] font-bold text-wasabi-600 dark:text-wasabi-300">{FARM_PROFILE.tagline}</p>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
            향재원은 고추냉이와 유러피안 특수작물, 노지 조경수·화훼를 기르는 <b className="text-gray-900 dark:text-gray-50">생산 농장</b>입니다.
            쉬어 가는 공간이 아니라 작물이 자라는 작업 현장입니다.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { k: '시설 용도', v: '농산물 생산', ok: true },
              { k: '공간 대여', v: '운영 없음',   ok: false },
              { k: '야영 · 숙박', v: '운영 없음', ok: false },
              { k: '취식 · 화기', v: '전면 불가', ok: false },
            ].map(r => (
              <div key={r.k} className={`rounded-2xl p-3 border
                ${r.ok ? 'bg-wasabi-50 border-wasabi-100 dark:bg-wasabi-900/40 dark:border-wasabi-800'
                       : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                <p className="text-[9.5px] font-black text-gray-400">{r.k}</p>
                <p className={`mt-0.5 text-[12px] font-black
                  ${r.ok ? 'text-wasabi-700 dark:text-wasabi-200' : 'text-gray-600 dark:text-gray-300'}`}>
                  <i className={`${r.ok ? 'ri-check-line' : 'ri-close-line'} mr-0.5`} aria-hidden="true" />
                  {r.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 방문 목적 ══ */}
      <section className="px-4 pb-8 scene">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">이런 목적으로 방문하실 수 있습니다</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          작업 동선과 작물 보호를 위해, 목적이 분명한 방문만 사전 협의 후 받고 있습니다.
        </p>

        <div className="space-y-2.5">
          {VISIT_PURPOSES.map((v, i) => (
            <div key={v.title} className={`glass-card p-4 flex items-start gap-3 animate-rise-3d delay-step-${i + 1}`}>
              <span className={`mt-0.5 w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br ${v.gradient}
                                flex items-center justify-center shadow-depth-2`}>
                <i className={`${v.icon} text-lg text-white`} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-black text-gray-900 dark:text-gray-50">{v.title}</p>
                <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 이용 수칙 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">방문 시 지켜 주실 것</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {VISIT_RULES.map((r, i) => (
            <div key={r.title} className={`glass-card p-4 animate-rise-3d delay-step-${(i % 6) + 1}`}>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-wasabi-100 to-emeraldgreen-100
                               dark:from-wasabi-900 dark:to-emeraldgreen-700/40
                               flex items-center justify-center">
                <i className={`${r.icon} text-base text-wasabi-600 dark:text-wasabi-300`} aria-hidden="true" />
              </span>
              <p className="mt-2 text-[12px] font-black text-gray-900 dark:text-gray-50 leading-snug">{r.title}</p>
              <p className="mt-1 text-[10.5px] font-medium leading-snug text-gray-500 dark:text-gray-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 사전 협의 연락 ══ */}
      <section className="px-4 pb-8">
        <div className="relative rounded-4xl overflow-hidden shadow-depth-3 grain
                        bg-gradient-to-br from-wasabi-700 via-emeraldgreen-700 to-wasabi-900 p-5 text-white">
          <span className="orb -top-10 -right-8 w-40 h-40 bg-wasabi-300/40" aria-hidden="true" />
          <div className="relative z-10">
            <span className="chip !bg-white/15 !text-white !border-white/25">
              <i className="ri-phone-line" aria-hidden="true" />사전 협의
            </span>
            <p className="mt-3 text-[17px] font-black leading-snug">방문 전에 먼저 연락해 주세요</p>
            <p className="mt-2 text-[12px] font-medium leading-relaxed text-white/85">
              방제 작업일이나 수확·출하일에는 출입이 제한됩니다. 날짜와 목적을 알려 주시면 가능한 시간을 안내드립니다.
            </p>

            <a href={`tel:${FARM_PROFILE.phone.replace(/-/g, '')}`}
               className="btn-primary w-full mt-4 !bg-white !text-wasabi-800">
              <i className="ri-phone-fill" aria-hidden="true" />
              <span translate="no">{FARM_PROFILE.phone}</span>
            </a>

            <dl className="mt-4 space-y-1.5 text-[11px]">
              {[
                { k: '소재지', v: FARM_PROFILE.address },
                { k: '운영',   v: `${FARM_PROFILE.operator} (대표 ${FARM_PROFILE.ceo})` },
              ].map(r => (
                <div key={r.k} className="flex gap-2">
                  <dt className="w-12 shrink-0 font-black text-white/60">{r.k}</dt>
                  <dd className="font-bold text-white/90">{r.v}</dd>
                </div>
              ))}
            </dl>

            <Link to="/map" className="btn-ghost w-full mt-3 !bg-white/10 !text-white !border-white/25">
              <i className="ri-map-pin-2-line" aria-hidden="true" />
              찾아오시는 길
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 다른 페이지로 ══ */}
      <section className="px-4 pb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">농장 둘러보기</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {STORY_ROUTES.map(r => (
            <Link key={r.to} to={r.to} className="glass-card card-3d p-4 group">
              <span className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${r.gradient}
                                flex items-center justify-center shadow-depth-2
                                transition-transform duration-500 group-hover:scale-110`}>
                <i className={`${r.icon} text-lg text-white`} aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-[13px] font-black text-gray-900 dark:text-gray-50">{r.label}</p>
              <p className="mt-0.5 text-[10.5px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{r.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
