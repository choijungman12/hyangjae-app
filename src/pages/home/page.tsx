import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import NoFoodNotice from '@/components/NoFoodNotice';
import WasabiMark from '@/components/WasabiMark';
import Tilt3D from '@/components/Tilt3D';
import CareProgramImage from '@/components/CareProgramImage';
import HydroponicBedArt from '@/components/HydroponicBedArt';
import UploadedHeroPhoto from '@/components/UploadedHeroPhoto';
import { useScrollY } from '@/hooks/useScrollY';
import { useCustomImage } from '@/hooks/useCustomImage';
import { AUTH_KEY } from '@/pages/login/page';
import {
  FARM_PROFILE,
  FARM_STATS,
  FARM_STORY,
  WASABI,
  CROP_HOUSES,
  CROP_HOUSE_POLICY,
  FIELD_CROPS,
  FLOWER_DISTRICT,
  CARE_PROGRAMS,
  CARE_CERT_ROADMAP,
  MASCOT,
  STORY_ROUTES,
} from '@/data/farmStory';

/**
 * ❗ 시설 사진을 직접 참조하지 않습니다.
 *   기존 조감도·렌더링에는 텐트·화로·휴게 공간이 섞여 있어 농장의 실제 운영과 다르게 읽힙니다.
 *   대신 설비 구조를 그린 벡터 도해를 쓰고, 검수된 실사진은 관리자 화면에서 업로드해 교체합니다.
 */

/* ── 스마트팜 운영 도구 — 농장 운영자·방문자가 바로 쓰는 기능 ── */
const FARM_TOOLS = [
  { icon: 'ri-camera-lens-line',    title: 'AI 작물 인식',  desc: '사진 한 장으로 작물·상태 판별', to: '/crop-recognition', gradient: 'from-wasabi-400 to-emeraldgreen-700' },
  { icon: 'ri-dashboard-3-line',    title: '실시간 환경',    desc: '온·습도 · CO₂ · 양액 모니터링',  to: '/smart-farm-data',  gradient: 'from-blueangel-300 to-blueangel-700' },
  { icon: 'ri-calendar-check-line', title: '재배 캘린더',    desc: '파종 · 정식 · 수확 일정 관리',   to: '/cultivation-calendar', gradient: 'from-amber-400 to-orange-600' },
  { icon: 'ri-line-chart-line',     title: '시세 동향',      desc: '가락시장 · KAMIS 연동 시세',     to: '/price-trends',     gradient: 'from-cyan-400 to-blue-700' },
  { icon: 'ri-robot-2-line',        title: 'AI 재배 상담',   desc: '24시간 영농 컨설팅',             to: '/ai-consultant',    gradient: 'from-violet-400 to-indigo-700' },
  { icon: 'ri-remote-control-line', title: '장비 제어',      desc: 'QR · IP 로 IoT 설비 연결',       to: '/device-control',   gradient: 'from-slate-400 to-gray-700' },
];

/**
 * 숫자 카운트업 — 진입 시 한 번만.
 * 원본 값의 소수 자리수를 유지합니다 (634.5 를 635 로 반올림하지 않도록).
 */
function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const decimals = (String(value).split('.')[1] ?? '').length;
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = value * (1 - Math.pow(1 - p, 3));
      setN(Number(eased.toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, decimals]);

  return (
    <span translate="no">
      {n.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

/** 섹션 제목 — eyebrow + 큰 제목 + 보조 설명 */
function SectionHead({ eyebrow, title, desc, to, toLabel }: {
  eyebrow: string; title: React.ReactNode; desc?: string; to?: string; toLabel?: string;
}) {
  return (
    <div className="mb-5">
      <span className="eyebrow">
        <i className="ri-circle-fill text-[6px]" aria-hidden="true" />
        {eyebrow}
      </span>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <h2 className="text-[22px] leading-tight font-black text-gray-900 dark:text-gray-50">{title}</h2>
        {to && (
          <Link to={to} className="shrink-0 text-xs font-black text-wasabi-600 dark:text-wasabi-300 flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {toLabel ?? '더 보기'} <i className="ri-arrow-right-s-line" aria-hidden="true" />
          </Link>
        )}
      </div>
      {desc && <p className="mt-2 text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">{desc}</p>}
    </div>
  );
}

export default function Home() {
  const scrollY = useScrollY();
  const [userName, setUserName] = useState<string | null>(null);
  const [activeHouse, setActiveHouse] = useState(0);
  const mascotImg = useCustomImage('mascot-maru', '');

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) { try { setUserName(JSON.parse(raw).name); } catch { /* noop */ } }
  }, []);

  const house = CROP_HOUSES[activeHouse];

  return (
    <div className="min-h-screen mesh-bg pb-safe overflow-x-hidden">
      {/* ══ 배경 오브 — 스크롤 패럴랙스 ══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb top-[-6rem] right-[-4rem] w-80 h-80 bg-wasabi-400/25"
             style={{ transform: `translateY(${scrollY * 0.12}px)` }} />
        <div className="orb top-[40vh] left-[-6rem] w-72 h-72 bg-blueangel-300/25"
             style={{ transform: `translateY(${-scrollY * 0.08}px)` }} />
        <div className="orb bottom-[-8rem] right-[-2rem] w-96 h-96 bg-emeraldgreen-300/20"
             style={{ transform: `translateY(${-scrollY * 0.05}px)` }} />
      </div>

      {/* ══ 헤더 ══ */}
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-wasabi-400/50 rounded-2xl blur-lg animate-glow-breathe" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-wasabi-50
                              dark:from-wasabi-900 dark:to-gray-900 shadow-depth-2 flex items-center justify-center">
                <WasabiMark className="w-7 h-7" animated />
              </div>
            </div>
            <div className="leading-none">
              <p className="text-[17px] font-black text-gray-900 dark:text-gray-50 tracking-tight">{FARM_PROFILE.nameKo}</p>
              <p className="mt-1 text-[10px] font-black tracking-[0.12em] text-wasabi-600 dark:text-wasabi-300" translate="no">
                WASABI SMART FARM
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link to="/visit" className="btn-ghost !px-3 !py-2 !text-[11px]">
              <i className="ri-information-line" aria-hidden="true" />
              방문 안내
            </Link>
            <Link
              to={userName ? '/profile' : '/login'}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:shadow-depth-2 transition-all"
              aria-label={userName ? '내 정보' : '로그인'}
            >
              <i className="ri-user-3-line text-lg text-wasabi-600 dark:text-wasabi-300" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══ 히어로 — 3D 레이어드 씬 ══ */}
      <section className="relative px-4 pt-6 pb-4 scene">
        <div className="relative rounded-5xl overflow-hidden shadow-depth-4 grain
                        bg-gradient-to-br from-wasabi-900 via-emeraldgreen-700 to-wasabi-950">
          {/* 업로드된 실사진이 있으면 배경으로 깔립니다 (검수 후 /admin/content 에서 교체) */}
          <UploadedHeroPhoto
            imageKey="hero-slide-1"
            alt="향재원 고추냉이 스마트팜 전경"
            className="absolute inset-0 w-full h-full"
            overlayClassName="bg-gradient-to-br from-wasabi-950/90 via-emeraldgreen-900/80 to-wasabi-950/90"
          />
          {/* 안쪽 오로라 */}
          <div className="absolute inset-0 opacity-70 mix-blend-screen" aria-hidden="true">
            <div className="orb -top-16 -left-10 w-72 h-72 bg-wasabi-400/60" />
            <div className="orb top-24 -right-12 w-64 h-64 bg-blueangel-300/50" />
            <div className="orb -bottom-20 left-16 w-72 h-72 bg-emeraldgreen-300/40" />
          </div>

          {/* 스캔 라인 — 스마트팜의 계측 감각 */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wasabi-200/80 to-transparent animate-scan-line" aria-hidden="true" />

          <div className="relative z-10 px-6 pt-8 pb-7">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25
                            backdrop-blur-xl px-3 py-1.5 mb-4">
              <i className="ri-map-pin-2-fill text-[11px] text-wasabi-200" aria-hidden="true" />
              <span className="text-[11px] font-black text-white/95" translate="no">{FARM_PROFILE.address}</span>
            </div>

            <h1 className="text-[34px] leading-[1.1] font-black text-white tracking-tight">
              서울 최초<br />
              <span className="inline-flex items-center gap-2">
                <span className="bg-gradient-to-r from-wasabi-200 via-white to-emeraldgreen-300 bg-clip-text text-transparent">
                  고추냉이
                </span>
                <WasabiMark className="w-9 h-9 drop-shadow-lg" animated />
              </span><br />
              스마트팜
            </h1>

            <p className="mt-4 text-[13px] leading-relaxed text-white/80 font-medium max-w-[22rem]">
              {FARM_PROFILE.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/wasabi" className="btn-primary !bg-white !text-wasabi-800 !shadow-depth-3">
                <i className="ri-plant-fill" aria-hidden="true" />
                고추냉이 이야기
              </Link>
              <Link to="/visit" className="btn-ghost !bg-white/10 !text-white !border-white/30">
                <i className="ri-information-line" aria-hidden="true" />
                방문 전 꼭 확인
              </Link>
            </div>
          </div>

          {/* 히어로 하단 — 통계 스트립 */}
          <div className="relative z-10 grid grid-cols-4 border-t border-white/15 bg-black/20 backdrop-blur-md">
            {FARM_STATS.map((s, i) => (
              <div key={s.label}
                   className={`px-2 py-3.5 text-center animate-count-in delay-step-${i + 1} ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <p className="text-[17px] font-black text-white leading-none">
                  <CountUp value={s.value} />
                  <span className="text-[10px] font-bold text-white/70 ml-0.5">{s.unit}</span>
                </p>
                <p className="mt-1.5 text-[9.5px] font-bold text-white/60 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 취식 불가 공지 — 가장 오해가 잦은 지점이라 최상단 고정 ══ */}
      <section className="px-4 pb-6">
        <NoFoodNotice variant="banner" />
      </section>

      {/* ══ 스토리 내비게이션 — 벤토 그리드 ══ */}
      <section className="px-4 pb-8 scene">
        <SectionHead
          eyebrow="WHAT WE GROW"
          title={<>향재원은 <span className="text-gradient">기르는 곳</span>입니다</>}
          desc="부지 전체가 생산 구역입니다. 온실에서는 고추냉이를, 8개 재배동에서는 유러피안 특수작물을, 노지에서는 조경수와 화훼를 기릅니다."
        />
        <div className="bento">
          {STORY_ROUTES.map((r, i) => (
            <Tilt3D key={r.to} className={`rounded-4xl animate-rise-3d delay-step-${i + 1}`}>
              <Link
                to={r.to}
                className="block relative h-40 rounded-4xl overflow-hidden shadow-depth-3 grain
                           bg-gradient-to-br text-white p-4 group"
              >
                <span className={`absolute inset-0 bg-gradient-to-br ${r.gradient}`} aria-hidden="true" />
                <span className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
                <span className="relative z-10 flex flex-col h-full justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center
                                   shadow-depth-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <i className={`${r.icon} text-xl`} aria-hidden="true" />
                  </span>
                  <span className="block">
                    <span className="block text-[15px] font-black leading-tight">{r.label}</span>
                    <span className="block mt-1 text-[11px] font-medium text-white/80 leading-snug">{r.sub}</span>
                  </span>
                </span>
              </Link>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* ══ 고추냉이 ══ */}
      <section className="px-4 pb-8">
        <SectionHead
          eyebrow="THE MAIN CROP"
          title={<>왜 <span className="text-gradient">고추냉이</span>인가</>}
          desc={WASABI.whyHard}
          to="/wasabi"
          toLabel="자세히"
        />

        <Tilt3D className="rounded-4xl" max={6}>
          <div className="rounded-4xl overflow-hidden shadow-depth-3 border border-white/60 dark:border-gray-700/60">
            <HydroponicBedArt
              className="w-full h-48 bg-wasabi-50 dark:bg-wasabi-950"
              title="고추냉이 3단 다단 수경 베드 단면도"
            />
            <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/70">
              <p className="chip">
                <i className="ri-flask-line" aria-hidden="true" />
                3단 다단 베드 · 총 연장 634.5m
              </p>
              <p className="mt-2 text-[13px] font-bold text-gray-900 dark:text-gray-50 leading-snug">
                흙 없이, 농약 없이 — 수온 13℃를 지키는 순환 양액
              </p>
            </div>
          </div>
        </Tilt3D>

        <p className="mt-4 text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
          {WASABI.whySmartFarm}
        </p>

        {/* 환경 제어 기준값 */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {WASABI.environment.map((e, i) => (
            <div key={e.key} className={`glass-card p-3 text-center animate-rise-3d delay-step-${(i % 6) + 1}`}>
              <i className={`${e.icon} text-lg text-wasabi-500 dark:text-wasabi-300`} aria-hidden="true" />
              <p className="mt-1.5 text-[13px] font-black text-gray-900 dark:text-gray-50 leading-none" translate="no">
                {e.value}<span className="text-[9px] font-bold text-gray-400 ml-0.5">{e.unit}</span>
              </p>
              <p className="mt-1 text-[9.5px] font-bold text-gray-500 dark:text-gray-400">{e.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 재배동 8동 ══ */}
      <section className="px-4 pb-8">
        <SectionHead
          eyebrow="8 CROP HOUSES"
          title={<>8개 동, <span className="text-gradient">8가지 유러피안 채소</span></>}
          desc={CROP_HOUSE_POLICY.body}
          to="/houses"
          toLabel="재배동 보기"
        />

        {/* 동 선택 칩 */}
        <div className="snap-row pb-2 -mx-1 px-1">
          {CROP_HOUSES.map((h, i) => (
            <button
              key={h.no}
              type="button"
              onClick={() => setActiveHouse(i)}
              className={`snap-item rounded-2xl px-3.5 py-2 text-[11px] font-black transition-all duration-300 ease-spring
                ${i === activeHouse
                  ? 'bg-gradient-to-br from-wasabi-500 to-emeraldgreen-700 text-white shadow-glow-wasabi scale-105'
                  : 'glass text-gray-600 dark:text-gray-300 hover:shadow-depth-1'}`}
              aria-pressed={i === activeHouse}
            >
              <span translate="no">{h.no}동</span> · {h.name}
            </button>
          ))}
        </div>

        {/* 선택된 동 상세 — 3D 카드 */}
        <Tilt3D className="mt-3 rounded-4xl" max={7}>
          <article className="relative rounded-4xl overflow-hidden shadow-depth-3 grain text-white p-5 min-h-[11rem]">
            <span className={`absolute inset-0 bg-gradient-to-br ${house.gradient}`} aria-hidden="true" />
            <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-white/70" translate="no">
                    HOUSE {String(house.no).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-2xl font-black leading-tight">{house.name}</h3>
                  <p className="text-[11px] font-bold text-white/75" translate="no">{house.nameEn}</p>
                </div>
                <span className="text-4xl drop-shadow-lg" aria-hidden="true">{house.emoji}</span>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-white/90 font-medium">{house.trait}</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/15 backdrop-blur-md p-2.5 border border-white/20">
                  <p className="text-[9.5px] font-black text-white/70">파종 → 첫 수확</p>
                  <p className="mt-1 text-[11px] font-bold leading-snug" translate="no">{house.toHarvest}</p>
                  <p className="mt-1.5 text-[10px] font-medium text-white/75 leading-snug">{house.harvestWay}</p>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-md p-2.5 border border-white/20">
                  <p className="text-[9.5px] font-black text-white/70">치유 · 교육 활용</p>
                  <p className="mt-1 text-[11px] font-bold leading-snug">{house.careUse}</p>
                </div>
              </div>
            </div>
          </article>
        </Tilt3D>

        {/* 재배동 운영 원칙 — 공간대여 아님 명시 */}
        <div className="mt-3 glass-card p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-gray-900 dark:text-gray-50">
            <i className="ri-checkbox-circle-fill text-wasabi-500" aria-hidden="true" />
            {CROP_HOUSE_POLICY.headline}
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {CROP_HOUSE_POLICY.bullets.map(b => (
              <li key={b} className="flex items-start gap-1.5 text-[11.5px] font-medium text-gray-600 dark:text-gray-400">
                <i className="ri-arrow-right-s-line text-wasabi-500 mt-px shrink-0" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ 노지 — 조경수 · 화훼 ══ */}
      <section className="px-4 pb-8 scene">
        <SectionHead
          eyebrow="OPEN FIELD"
          title={<>노지에는 <span className="text-gradient">블루베리 · 조경수 · 화훼</span></>}
          desc={FLOWER_DISTRICT.body}
          to="/field"
          toLabel="노지 보기"
        />

        <div className="grid grid-cols-2 gap-3">
          {FIELD_CROPS.slice(0, 2).map((c, i) => (
            <Tilt3D key={c.id} className={`rounded-4xl animate-rise-3d delay-step-${i + 1}`}>
              <div className="relative h-44 rounded-4xl overflow-hidden shadow-depth-3 grain p-4 text-white">
                <span className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} aria-hidden="true" />
                <span className="absolute -bottom-8 -right-6 w-28 h-28 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <i className={`${c.icon} text-lg`} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[15px] font-black leading-tight">{c.name}</p>
                    <p className="text-[10px] font-bold text-white/70" translate="no">{c.species}</p>
                    <p className="mt-1.5 text-[10.5px] font-medium text-white/85 leading-snug">{c.spec}</p>
                  </div>
                </div>
              </div>
            </Tilt3D>
          ))}
        </div>

        {/* 화훼단지 근접성 — 마퀴 */}
        <div className="mt-3 glass-card overflow-hidden">
          <div className="p-4 pb-3">
            <p className="flex items-center gap-1.5 text-[13px] font-black text-gray-900 dark:text-gray-50">
              <i className="ri-truck-fill text-blueangel-500" aria-hidden="true" />
              {FLOWER_DISTRICT.headline}
            </p>
          </div>
          <div className="relative overflow-hidden border-t border-gray-200/60 dark:border-gray-700/60 py-3">
            <div className="flex w-max animate-marquee gap-3 px-3">
              {[...FLOWER_DISTRICT.advantages, ...FLOWER_DISTRICT.advantages].map((a, i) => (
                <div key={`${a.title}-${i}`} className="shrink-0 w-44 rounded-2xl bg-gradient-to-br from-blueangel-100 to-white
                                                        dark:from-blueangel-700/30 dark:to-gray-900 p-3 border border-blueangel-100 dark:border-blueangel-700/40">
                  <i className={`${a.icon} text-base text-blueangel-700 dark:text-blueangel-300`} aria-hidden="true" />
                  <p className="mt-1 text-[11.5px] font-black text-gray-900 dark:text-gray-50">{a.title}</p>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 치유농업 ══ */}
      <section className="px-4 pb-8">
        <SectionHead
          eyebrow="CARE FARMING"
          title={<>대상마다 다른 <span className="text-gradient">치유의 속도</span></>}
          desc="직장인 · 시니어 · 어린이 · 가족 · 복지기관까지, 대상별로 다른 5개 프로그램을 설계하고 있습니다. 효과는 농촌진흥청 실증 결과를 근거로 삼았습니다."
          to="/care-farming"
          toLabel="프로그램 보기"
        />

        <div className="snap-row pb-2 -mx-1 px-1">
          {CARE_PROGRAMS.map((p, i) => (
            <Link
              key={p.id}
              to={`/care-farming/${p.id}`}
              className={`snap-item w-[15.5rem] rounded-4xl overflow-hidden shadow-depth-2
                          bg-white/80 dark:bg-gray-900/70 border border-white/60 dark:border-gray-700/60
                          animate-rise-3d delay-step-${(i % 6) + 1} group`}
            >
              <span className="relative block h-24 overflow-hidden">
                <CareProgramImage program={p} className="w-full h-full" />
                <span className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-55 mix-blend-multiply`} />
                <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full
                                 bg-white/25 backdrop-blur-md border border-white/30 px-2 py-0.5
                                 text-[9.5px] font-black text-white">
                  <i className={p.icon} aria-hidden="true" />{p.target}
                </span>
              </span>
              <span className="block p-3.5">
                <span className="block text-[15px] font-black leading-snug text-gray-900 dark:text-gray-50">{p.name}</span>
                <span className="mt-1.5 block text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                  {p.summary}
                </span>
                <span className="mt-2 inline-flex items-center gap-0.5 text-[10.5px] font-black
                                 text-wasabi-600 dark:text-wasabi-300 group-hover:gap-1.5 transition-all">
                  상세 보기 <i className="ri-arrow-right-line" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* 인증 추진 단계 */}
        <div className="mt-3 glass-card p-4">
          <p className="text-[12px] font-black text-gray-900 dark:text-gray-50 mb-3">치유농업 인증 추진 단계</p>
          <ol className="space-y-2.5">
            {CARE_CERT_ROADMAP.map(s => (
              <li key={s.step} className="flex items-start gap-2.5">
                <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black
                  ${s.status === 'done'  ? 'bg-wasabi-500 text-white'
                  : s.status === 'doing' ? 'bg-amber-400 text-amber-950 animate-harvest-glow'
                  :                        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {s.status === 'done' ? <i className="ri-check-line" aria-hidden="true" /> : s.step}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-gray-900 dark:text-gray-50">
                    {s.label}
                    {s.status === 'doing' && <span className="ml-1.5 chip !py-0 !text-[9px]">진행 중</span>}
                  </p>
                  <p className="text-[10.5px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ 마스코트 마루 ══ */}
      <section className="px-4 pb-8">
        <Tilt3D className="rounded-4xl" max={6}>
          <div className="relative rounded-4xl overflow-hidden shadow-depth-3 grain
                          bg-gradient-to-br from-wasabi-50 via-white to-emeraldgreen-100
                          dark:from-wasabi-900 dark:via-gray-900 dark:to-emeraldgreen-700/30 p-5">
            <span className="orb -top-10 -right-8 w-40 h-40 bg-wasabi-300/40" aria-hidden="true" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="shrink-0">
                {mascotImg ? (
                  <img src={mascotImg} alt={`향재원 마스코트 ${MASCOT.name}`}
                       className="w-20 h-20 object-contain drop-shadow-xl animate-leaf-sway" />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-wasabi-300 to-emeraldgreen-600
                                  shadow-depth-3 flex items-center justify-center">
                    <WasabiMark className="w-12 h-12" animated />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="eyebrow">MASCOT</span>
                <p className="mt-1 text-xl font-black text-gray-900 dark:text-gray-50 leading-none">
                  {MASCOT.name}
                  <span className="ml-2 text-[11px] font-bold text-gray-400" translate="no">{MASCOT.nameEn}</span>
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-wasabi-600 dark:text-wasabi-300">{MASCOT.role}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                  {MASCOT.story}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
              {MASCOT.poses.map(p => (
                <span key={p.id} className="chip">{p.label}</span>
              ))}
            </div>
          </div>
        </Tilt3D>
      </section>

      {/* ══ 농장 이야기 타임라인 ══ */}
      <section className="px-4 pb-8">
        <SectionHead
          eyebrow="OUR STORY"
          title={<>매립장이던 땅이 <span className="text-gradient">농장</span>이 되기까지</>}
        />
        <ol className="relative pl-7">
          <span className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-gray-300 via-wasabi-400 to-emeraldgreen-500 dark:from-gray-700" aria-hidden="true" />
          {FARM_STORY.map((c, i) => (
            <li key={c.id} className={`relative pb-5 animate-rise-3d delay-step-${i + 1}`}>
              <span className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-depth-1
                ${c.tone === 'past'  ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                : c.tone === 'work'  ? 'bg-soil-300 text-soil-700'
                : c.tone === 'now'   ? 'bg-gradient-to-br from-wasabi-400 to-emeraldgreen-600 text-white animate-harvest-glow'
                :                      'bg-rose-200 dark:bg-rose-900 text-rose-600 dark:text-rose-200'}`}>
                <i className={`${c.icon} text-[11px]`} aria-hidden="true" />
              </span>
              <p className="text-[10px] font-black tracking-wider text-gray-400" translate="no">{c.period}</p>
              <p className="text-[14px] font-black text-gray-900 dark:text-gray-50 leading-tight">{c.title}</p>
              <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-gray-600 dark:text-gray-400">{c.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══ 스마트팜 운영 도구 ══ */}
      <section className="px-4 pb-8 scene">
        <SectionHead
          eyebrow="FARM TOOLS"
          title={<>농장을 움직이는 <span className="text-gradient">기술</span></>}
          desc="향재원의 모든 재배 구역은 센서와 데이터로 관리됩니다. 치유농업 프로그램도 이 데이터 위에서 설계됩니다."
        />
        <div className="grid grid-cols-2 gap-3">
          {FARM_TOOLS.map((t, i) => (
            <Link key={t.to} to={t.to} className={`group animate-rise-3d delay-step-${(i % 6) + 1}`}>
              <div className="glass-card card-3d h-full p-4">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.gradient} shadow-depth-2
                                 flex items-center justify-center transition-transform duration-500
                                 group-hover:scale-110 group-hover:rotate-6`}>
                  <i className={`${t.icon} text-xl text-white`} aria-hidden="true" />
                </div>
                <p className="mt-3 text-[13px] font-black text-gray-900 dark:text-gray-50">{t.title}</p>
                <p className="mt-1 text-[10.5px] font-medium text-gray-500 dark:text-gray-400 leading-snug">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ 제품 ══ */}
      <section className="px-4 pb-8">
        <SectionHead
          eyebrow="FARM PRODUCTS"
          title={<>서울에서 기른 <span className="text-gradient">국산 고추냉이 가공품</span></>}
          to="/shop"
          toLabel="전체 보기"
        />
        <Tilt3D className="rounded-4xl" max={6}>
          <Link to="/shop"
                className="block relative rounded-4xl overflow-hidden shadow-depth-3 grain
                           bg-gradient-to-br from-wasabi-700 via-emeraldgreen-700 to-wasabi-900 p-5">
            <UploadedHeroPhoto
              imageKey="store-products"
              alt="향재원 고추냉이 가공품"
              className="absolute inset-0 w-full h-full"
              overlayClassName="bg-gradient-to-br from-wasabi-900/90 via-emeraldgreen-800/80 to-wasabi-950/90"
            />
            <span className="orb -top-10 -right-8 w-40 h-40 bg-wasabi-300/35" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <WasabiMark className="w-9 h-9" />
                <div className="leading-none">
                  <p className="text-[14px] font-black text-white">고추냉이 가공품</p>
                  <p className="mt-1 text-[10.5px] font-bold text-wasabi-200">양재동 재배 · 국내산 100%</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['와사비 소금', '줄기 장아찌', '펌프형 농축액', '잎 절임', '가루', '생근경'].map(t => (
                  <span key={t} className="rounded-full bg-white/18 backdrop-blur-md border border-white/25
                                           px-2.5 py-1 text-[10.5px] font-bold text-white">{t}</span>
                ))}
              </div>
              <p className="mt-3 inline-flex items-center gap-0.5 text-[11.5px] font-black text-white">
                온라인 직판 보기 <i className="ri-arrow-right-line" aria-hidden="true" />
              </p>
            </div>
          </Link>
        </Tilt3D>
      </section>

      {/* ══ 푸터 ══ */}
      <footer className="px-4 pb-10">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5">
            <WasabiMark className="w-7 h-7" />
            <div className="leading-none">
              <p className="text-[15px] font-black text-gray-900 dark:text-gray-50">{FARM_PROFILE.nameKo}</p>
              <p className="mt-1 text-[10px] font-bold text-wasabi-600 dark:text-wasabi-300" translate="no">
                {FARM_PROFILE.taglineEn}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[11.5px]">
            {[
              { k: '소재지', v: FARM_PROFILE.address },
              { k: '운영',   v: `${FARM_PROFILE.operator} (대표 ${FARM_PROFILE.ceo})` },
              { k: '문의',   v: FARM_PROFILE.phone },
              { k: '용도',   v: '농산물 생산 시설 · 공간대여/숙박 운영 없음' },
            ].map(r => (
              <div key={r.k} className="flex gap-3">
                <dt className="w-12 shrink-0 font-black text-gray-400">{r.k}</dt>
                <dd className="font-bold text-gray-700 dark:text-gray-300">{r.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 pt-4 hairline flex flex-wrap gap-2">
            <Link to="/visit" className="chip"><i className="ri-information-line" aria-hidden="true" />방문 안내</Link>
            <Link to="/map" className="chip"><i className="ri-map-pin-line" aria-hidden="true" />찾아오시는 길</Link>
            <Link to="/guide" className="chip"><i className="ri-book-open-line" aria-hidden="true" />재배 가이드</Link>
          </div>

          <p className="mt-4 text-[10px] font-medium text-gray-400 leading-relaxed">
            © 2026 {FARM_PROFILE.operator}. 본 사이트에 표기된 모든 시설은 농산물 생산을 위한 농업시설이며,
            숙박·야영·공간대여 서비스를 제공하지 않습니다. 치유농업 프로그램은 등록·인증 절차 진행 중으로 아직 운영 전입니다.
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
