import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import Tilt3D from '@/components/Tilt3D';
import UploadedHeroPhoto from '@/components/UploadedHeroPhoto';
import { FIELD_CROPS, FLOWER_DISTRICT } from '@/data/farmStory';

/** 노지 구역 운영 원칙 — 조경시설이 아니라 재배 구역임을 명시 */
const FIELD_NOTES = [
  {
    icon: 'ri-plant-line',
    title: '심어 둔 나무와 꽃은 판매용 작물입니다',
    desc: '노지에 식재된 블루베리·에메랄드골드·블루엔젤·에메랄드그린과 화훼는 출하를 전제로 기르는 판매용 묘목·과수·화훼입니다. 관상용 조경시설물이 아닙니다.',
  },
  {
    icon: 'ri-landscape-line',
    title: '지반을 깎거나 돋우지 않았습니다',
    desc: '매립 폐기물을 반출한 뒤 지반고를 그대로 유지한 채 식재했습니다. 콘크리트 타설도 하지 않았습니다.',
  },
  {
    icon: 'ri-shield-check-line',
    title: '게비온은 흙막이 구조입니다',
    desc: '경사면 토사 유실을 막기 위한 흙막이이며, 조경 장식 목적이 아닙니다.',
  },
];

export default function FieldPage() {
  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      <PageHeader title="노지 과수 · 조경수 · 화훼" subtitle="블루베리 · 에메랄드골드 · 블루엔젤" />

      {/* ══ 히어로 ══ */}
      <section className="px-4 pt-5 pb-6">
        <div className="relative rounded-5xl overflow-hidden shadow-depth-4 grain
                        bg-gradient-to-br from-blueangel-700 via-emeraldgreen-700 to-blueangel-500 p-6">
          <UploadedHeroPhoto
            imageKey="facility-field-thumb"
            alt="노지 과수·조경수 식재 구역"
            className="absolute inset-0 w-full h-full"
            overlayClassName="bg-gradient-to-br from-blueangel-800/85 via-emeraldgreen-800/80 to-blueangel-700/85"
          />
          <span className="orb -top-12 -right-10 w-60 h-60 bg-blueangel-300/50" aria-hidden="true" />
          <span className="orb -bottom-14 -left-10 w-56 h-56 bg-emeraldgreen-300/40" aria-hidden="true" />

          <div className="relative z-10">
            <span className="chip !bg-white/15 !text-white !border-white/25">
              <i className="ri-flower-line" aria-hidden="true" />OPEN FIELD
            </span>
            <h1 className="mt-3 text-[28px] leading-tight font-black text-white">
              밭에서 잘라<br />바로 실어내는 거리
            </h1>
            <p className="mt-3 text-[12.5px] leading-relaxed font-medium text-white/80">
              재배동 앞 쇄석을 걷어낸 자리에는 <b className="text-white">블루베리와 에메랄드골드</b>를 심어 농지 형상을 유지하고,
              잔여 노지에서는 블루엔젤·에메랄드그린과 절화를 기릅니다.
              서울 최대 화훼 유통 거점이 같은 양재동 생활권에 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 작물 ══ */}
      <section className="px-4 pb-8 scene">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">노지에서 기르는 것</h2>
        <div className="space-y-3">
          {FIELD_CROPS.map((c, i) => (
            <Tilt3D key={c.id} className={`rounded-4xl animate-rise-3d delay-step-${(i % 6) + 1}`} max={5}>
              <article className="relative rounded-4xl overflow-hidden shadow-depth-2 grain text-white p-5">
                <span className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} aria-hidden="true" />
                <span className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />

                <div className="relative z-10">
                  <div className="flex items-start gap-3">
                    <span className="w-11 h-11 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md
                                     flex items-center justify-center shadow-depth-1">
                      <i className={`${c.icon} text-xl`} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-black">
                          {c.category}
                        </span>
                        <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-bold text-white/85">
                          {c.zone}
                        </span>
                      </span>
                      <p className="mt-1 text-[18px] font-black leading-tight">{c.name}</p>
                      <p className="text-[10.5px] font-bold text-white/70 italic" translate="no">{c.species}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-white/90">{c.desc}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-2.5">
                      <p className="text-[9.5px] font-black text-white/70">규격</p>
                      <p className="mt-0.5 text-[11px] font-bold" translate="no">{c.spec}</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-2.5">
                      <p className="text-[9.5px] font-black text-white/70">출하 시기</p>
                      <p className="mt-0.5 text-[11px] font-bold">{c.season}</p>
                    </div>
                  </div>
                </div>
              </article>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* ══ 화훼단지 근접성 ══ */}
      <section className="px-4 pb-8">
        <div className="glass-card p-5">
          <span className="eyebrow"><i className="ri-truck-line" aria-hidden="true" />LOGISTICS</span>
          <h2 className="mt-1.5 text-lg font-black text-gray-900 dark:text-gray-50">{FLOWER_DISTRICT.headline}</h2>
          <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
            {FLOWER_DISTRICT.body}
          </p>

          {/* 거리 시각화 */}
          <div className="mt-4 relative rounded-3xl bg-gradient-to-r from-wasabi-50 to-blueangel-100
                          dark:from-wasabi-900/40 dark:to-blueangel-700/30 p-4 overflow-hidden">
            <div className="relative flex items-center justify-between">
              <div className="text-center">
                <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-wasabi-400 to-emeraldgreen-700
                                flex items-center justify-center shadow-depth-2">
                  <i className="ri-plant-fill text-lg text-white" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-[10px] font-black text-gray-700 dark:text-gray-300">향재원</p>
                <p className="text-[9px] font-bold text-gray-400" translate="no">양재동 178-4</p>
              </div>

              <div className="flex-1 px-2">
                <div className="relative h-px bg-gradient-to-r from-wasabi-400 to-blueangel-500">
                  <i className="ri-truck-fill absolute -top-2.5 left-1/2 -translate-x-1/2 text-base text-blueangel-600 dark:text-blueangel-300"
                     aria-hidden="true" />
                </div>
                <p className="mt-2 text-center text-[9.5px] font-black text-blueangel-700 dark:text-blueangel-300">
                  차량 5분대
                </p>
              </div>

              <div className="text-center">
                <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600
                                flex items-center justify-center shadow-depth-2">
                  <i className="ri-store-2-fill text-lg text-white" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-[10px] font-black text-gray-700 dark:text-gray-300">양재 화훼공판장</p>
                <p className="text-[9px] font-bold text-gray-400">같은 양재동</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {FLOWER_DISTRICT.advantages.map(a => (
              <div key={a.title} className="rounded-2xl bg-white/70 dark:bg-gray-900/50
                                            border border-gray-100 dark:border-gray-800 p-3">
                <i className={`${a.icon} text-base text-blueangel-600 dark:text-blueangel-300`} aria-hidden="true" />
                <p className="mt-1 text-[11.5px] font-black text-gray-900 dark:text-gray-50">{a.title}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 노지 운영 원칙 ══ */}
      <section className="px-4 pb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 mb-4">노지 구역에 대하여</h2>
        <div className="space-y-2.5">
          {FIELD_NOTES.map((n, i) => (
            <div key={n.title} className={`glass-card p-4 flex items-start gap-3 animate-rise-3d delay-step-${i + 1}`}>
              <span className="mt-0.5 w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-emeraldgreen-400 to-emeraldgreen-700
                               flex items-center justify-center">
                <i className={`${n.icon} text-base text-white`} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-black text-gray-900 dark:text-gray-50 leading-snug">{n.title}</p>
                <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link to="/care-farming" className="btn-ghost flex-1">
            <i className="ri-heart-pulse-line" aria-hidden="true" />치유농업
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
