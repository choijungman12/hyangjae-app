import { Link } from 'react-router-dom';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import Tilt3D from '@/components/Tilt3D';
import UploadedHeroPhoto from '@/components/UploadedHeroPhoto';
import { CROP_HOUSES, CROP_HOUSE_POLICY } from '@/data/farmStory';

export default function HousesPage() {
  const [openNo, setOpenNo] = useState<number | null>(1);

  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title="재배동 8동" subtitle="유러피안 채소 · 무농약 유기질 배지" />

      {/* ══ 히어로 ══ */}
      <section className="px-4 pt-5 pb-6">
        <div className="relative rounded-5xl overflow-hidden shadow-depth-4 grain
                        bg-gradient-to-br from-lime-600 via-wasabi-700 to-emeraldgreen-700 p-6">
          <UploadedHeroPhoto
            imageKey="facility-house-thumb"
            alt="유러피안 채소 재배동 내부"
            className="absolute inset-0 w-full h-full"
            overlayClassName="bg-gradient-to-br from-lime-700/85 via-wasabi-800/80 to-emeraldgreen-800/85"
          />
          <span className="orb -top-12 -left-10 w-56 h-56 bg-lime-300/50" aria-hidden="true" />
          <span className="orb -bottom-14 -right-8 w-56 h-56 bg-emeraldgreen-300/40" aria-hidden="true" />

          <div className="relative z-10">
            <span className="chip !bg-white/15 !text-white !border-white/25">
              <i className="ri-plant-line" aria-hidden="true" />8 CROP HOUSES
            </span>
            <h1 className="mt-3 text-[28px] leading-tight font-black text-white">
              8개 동,<br />8가지 유러피안 채소
            </h1>
            <p className="mt-3 text-[12.5px] leading-relaxed font-medium text-white/80">
              텐트형 재배동 8동은 전부 <b className="text-white">작물 재배동</b>입니다.
              동마다 유러피안 채소 한 품목씩을 배정해 <b className="text-white">무농약·유기질 배지</b>로 기르며,
              수확 주기가 짧은 작물부터 긴 작물까지 섞어 연중 출하가 끊기지 않게 짰습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 운영 원칙 — 공간대여 아님 ══ */}
      <section className="px-4 pb-6">
        <div className="rounded-4xl border border-wasabi-200 dark:border-wasabi-800
                        bg-gradient-to-br from-wasabi-50 to-white dark:from-wasabi-900/50 dark:to-gray-900
                        p-5 shadow-depth-2">
          <p className="flex items-center gap-2 text-[15px] font-black text-gray-900 dark:text-gray-50">
            <i className="ri-checkbox-circle-fill text-wasabi-500 text-lg" aria-hidden="true" />
            {CROP_HOUSE_POLICY.headline}
          </p>
          <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
            {CROP_HOUSE_POLICY.body}
          </p>
          <ul className="mt-3 grid gap-1.5">
            {CROP_HOUSE_POLICY.bullets.map(b => (
              <li key={b} className="flex items-start gap-1.5 text-[11.5px] font-bold text-gray-700 dark:text-gray-300">
                <i className="ri-checkbox-circle-line text-wasabi-500 mt-px shrink-0" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ 배치도 — 8동 그리드 ══ */}
      <section className="px-4 pb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-1">동별 배치</h2>
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-4">
          탭하면 그 동에서 기르는 작물을 볼 수 있습니다.
        </p>

        <div className="grid grid-cols-4 gap-2.5 scene">
          {CROP_HOUSES.map((h, i) => (
            <button
              key={h.no}
              type="button"
              onClick={() => setOpenNo(openNo === h.no ? null : h.no)}
              aria-expanded={openNo === h.no}
              className={`relative aspect-square rounded-3xl overflow-hidden shadow-depth-2 card-3d
                          flex flex-col items-center justify-center gap-1 animate-rise-3d delay-step-${(i % 8) + 1}
                          ${openNo === h.no ? 'ring-2 ring-wasabi-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
            >
              <span className={`absolute inset-0 bg-gradient-to-br ${h.gradient}`} aria-hidden="true" />
              <span className="relative z-10 text-2xl" aria-hidden="true">{h.emoji}</span>
              <span className="relative z-10 text-[9.5px] font-black text-white/90" translate="no">{h.no}동</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══ 작물 상세 카드 ══ */}
      <section className="px-4 pb-10 space-y-3">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50">동별 작물 배정</h2>

        {CROP_HOUSES.map(h => {
          const open = openNo === h.no;
          return (
            <Tilt3D key={h.no} className="rounded-4xl" max={5}>
              <article
                className="relative rounded-4xl overflow-hidden shadow-depth-2 grain text-white"
                id={`house-${h.no}`}
              >
                <span className={`absolute inset-0 bg-gradient-to-br ${h.gradient}`} aria-hidden="true" />
                <span className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />

                <button
                  type="button"
                  onClick={() => setOpenNo(open ? null : h.no)}
                  aria-expanded={open}
                  className="relative z-10 w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className="w-12 h-12 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md
                                   flex items-center justify-center text-2xl shadow-depth-1" aria-hidden="true">
                    {h.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[9.5px] font-black tracking-[0.16em] text-white/65" translate="no">
                      HOUSE {String(h.no).padStart(2, '0')}
                    </span>
                    <span className="block text-[17px] font-black leading-tight">{h.name}</span>
                    <span className="block text-[10.5px] font-bold text-white/70" translate="no">
                      {h.nameEn}
                    </span>
                  </span>
                  <i className={`ri-arrow-down-s-line text-xl text-white/80 transition-transform duration-500 ${open ? 'rotate-180' : ''}`}
                     aria-hidden="true" />
                </button>

                {open && (
                  <div className="relative z-10 px-4 pb-4 animate-slideUp">
                    <p className="text-[12.5px] font-medium leading-relaxed text-white/90">{h.trait}</p>

                    <dl className="mt-3 grid gap-2">
                      {[
                        { icon: 'ri-time-line',      k: '파종 → 첫 수확', v: h.toHarvest },
                        { icon: 'ri-scissors-cut-line', k: '수확 방식',   v: h.harvestWay },
                        { icon: 'ri-heart-pulse-line', k: '치유 · 교육 활용', v: h.careUse },
                      ].map(row => (
                        <div key={row.k} className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3">
                          <dt className="flex items-center gap-1.5 text-[9.5px] font-black text-white/70">
                            <i className={row.icon} aria-hidden="true" />{row.k}
                          </dt>
                          <dd className="mt-1 text-[11.5px] font-bold leading-snug">{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </article>
            </Tilt3D>
          );
        })}

        <div className="flex gap-2 pt-2">
          <Link to="/field" className="btn-ghost flex-1">
            <i className="ri-flower-line" aria-hidden="true" />노지 보기
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
