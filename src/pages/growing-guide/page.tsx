import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';
import { getGrowingGuide, getAvailableGuideIds, DIFFICULTY_META, GROWING_GUIDES } from '@/data/cropGrowingGuide';

type Tab = 'overview' | 'smartfarm' | 'openfield' | 'pests';

export default function GrowingGuidePage() {
  const scrollY = useScrollY();
  const [params, setParams] = useSearchParams();
  const cropId = params.get('id') ?? 'wasabi';
  const [tab, setTab] = useState<Tab>('overview');
  const guide = getGrowingGuide(cropId);
  const availableIds = getAvailableGuideIds();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setTab('overview');
  }, [cropId]);

  /* 가이드 미제공 작물일 경우 */
  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
        <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <Link to="/cultivation-calendar" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl">
              <i className="ri-arrow-left-line text-xl text-gray-700" />
            </Link>
            <h1 className="text-base font-black text-gray-900 flex-1">재배 가이드</h1>
          </div>
        </header>

        <div className="px-4 pt-10 text-center">
          <div className="w-20 h-20 mx-auto bg-amber-50 rounded-3xl flex items-center justify-center mb-4">
            <i className="ri-tools-line text-4xl text-amber-500" />
          </div>
          <h2 className="text-base font-black text-gray-900 mb-2">가이드 준비 중</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            이 작물의 상세 재배 가이드는 아직 작성 중입니다.<br />
            현재 이용 가능한 작물을 선택해 주세요.
          </p>

          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-4">
            <p className="text-xs font-black text-gray-600 mb-3">이용 가능한 가이드</p>
            <div className="grid grid-cols-2 gap-2">
              {availableIds.map(id => {
                const g = GROWING_GUIDES[id];
                return (
                  <button
                    key={id}
                    onClick={() => setParams({ id })}
                    className="flex items-center gap-2 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CROP_VISUAL[id]?.gradient ?? 'from-gray-300 to-gray-400'} flex items-center justify-center shadow-sm`}>
                      <span className="text-xl">{CROP_VISUAL[id]?.emoji ?? '🌱'}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-gray-800">{g.name}</p>
                      <p className="text-[10px] text-gray-500">{g.difficulty}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const visual = CROP_VISUAL[cropId];
  const diff = DIFFICULTY_META[guide.difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24 overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl" style={{ transform: `translateY(${-scrollY * 0.2}px)` }} />
      </div>

      {/* 헤더 */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <Link to="/cultivation-calendar" className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 rounded-xl">
            <i className="ri-arrow-left-line text-xl text-gray-700" />
          </Link>
          <h1 className="text-base font-black text-gray-900 flex-1 truncate">{guide.name} 재배 가이드</h1>
        </div>
      </header>

      {/* 히어로 카드 */}
      <section className="px-4 pt-5 pb-5 relative z-10">
        <div className={`relative bg-gradient-to-br ${visual?.gradient ?? 'from-emerald-400 to-teal-500'} rounded-3xl p-6 text-white shadow-2xl overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full mb-2 border border-white/30">
                  <i className={diff.icon + ' text-[10px]'} />
                  <span className="text-[10px] font-black">{guide.difficulty}</span>
                </div>
                <h2 className="text-2xl font-black mb-1 drop-shadow-lg">{guide.name}</h2>
                <p className="text-xs text-white/70 italic">{guide.scientificName}</p>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">{guide.description}</p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl flex-shrink-0">
                <span className="text-5xl">{visual?.emoji ?? '🌱'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '분류',      value: guide.category,  icon: 'ri-plant-line' },
                { label: '재배 기간', value: guide.totalDays.replace('정식 후 ', ''), icon: 'ri-time-line' },
                { label: '초보자 추천', value: '⭐'.repeat(guide.beginnerScore), icon: 'ri-star-line' },
              ].map(item => (
                <div key={item.label} className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/20">
                  <i className={`${item.icon} text-sm mb-0.5`} />
                  <p className="text-xs font-black leading-tight truncate">{item.value}</p>
                  <p className="text-[10px] text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 출처 배지 */}
      <section className="px-4 pb-3 relative z-10">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <i className="ri-verified-badge-line text-blue-500 text-lg flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] font-black text-blue-900">공신력 있는 데이터 기반</p>
            <p className="text-[10px] text-blue-700 leading-relaxed mt-0.5">
              농촌진흥청(RDA) 국립원예특작과학원 표준 매뉴얼 · 농사로 표준영농교본 · 지역 농업기술원 자료 참조
            </p>
          </div>
        </div>
      </section>

      {/* 탭 */}
      <section className="px-4 pb-4 relative z-10 sticky top-[62px] z-30 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-md border border-gray-100 p-1.5 flex gap-1">
          {[
            { id: 'overview',  label: '개요',    icon: 'ri-information-line' },
            { id: 'smartfarm', label: '스마트팜', icon: 'ri-building-4-line' },
            { id: 'openfield', label: '노지',    icon: 'ri-leaf-line' },
            { id: 'pests',     label: '병해충',  icon: 'ri-bug-line' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-black transition-all ${
                tab === t.id ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' : 'text-gray-500'
              }`}
            >
              <i className={`${t.icon} text-base`} />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════ 개요 탭 ═══════ */}
      {tab === 'overview' && (
        <section className="px-4 pb-6 relative z-10 space-y-4">
          {/* 필수 영양소 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-flask-line text-emerald-500" />필수 영양소
            </h3>
            <div className="space-y-3">
              {guide.nutrients.map(n => (
                <div key={n.symbol} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-xs font-black text-white">{n.symbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900">{n.name}</p>
                      <p className="text-[10px] text-gray-500">{n.role}</p>
                    </div>
                    {n.rangePpm && (
                      <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                        {n.rangePpm} ppm
                      </span>
                    )}
                  </div>
                  <div className="bg-white/70 rounded-xl px-3 py-2 flex items-start gap-2">
                    <i className="ri-error-warning-line text-amber-500 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-gray-700 leading-relaxed">
                      <span className="font-black text-amber-700">결핍 시:</span> {n.deficiency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 초보자 팁 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-lightbulb-flash-line text-yellow-500" />초보자 필수 팁
            </h3>
            <div className="space-y-2">
              {guide.beginnerTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>
                  <p className="text-[11px] text-gray-800 leading-relaxed font-medium flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 참고자료 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-book-line text-blue-500" />참고 자료
            </h3>
            <div className="space-y-2">
              {guide.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all group"
                >
                  <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-external-link-line text-white" />
                  </div>
                  <span className="text-xs font-black text-blue-900 flex-1 group-hover:text-blue-700">{ref.label}</span>
                  <i className="ri-arrow-right-s-line text-blue-400" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ 스마트팜 탭 ═══════ */}
      {tab === 'smartfarm' && (
        <section className="px-4 pb-6 relative z-10 space-y-4">
          {/* 환경 조건 */}
          <EnvCard title="🏭 스마트팜 환경 조건" env={guide.smartFarm.env} color="blue" />

          {/* 단계별 재배 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-list-ordered text-blue-500" />단계별 재배 과정
            </h3>
            <div className="space-y-4">
              {guide.smartFarm.steps.map((step, i) => (
                <div key={i} className="relative pl-8">
                  {i < guide.smartFarm.steps.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-blue-200" />
                  )}
                  <div className="absolute left-0 top-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-blue-900">{step.title}</h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{step.days}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-[11px] text-gray-700">
                          <i className="ri-check-line text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                    {step.warning && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2">
                        <i className="ri-alarm-warning-line text-red-500 text-xs mt-0.5" />
                        <p className="text-[10px] text-red-700 font-bold leading-relaxed">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 필요 장비 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-tools-line text-blue-500" />필요 장비
            </h3>
            <div className="flex flex-wrap gap-2">
              {guide.smartFarm.equipment.map((eq, i) => (
                <span key={i} className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                  {eq}
                </span>
              ))}
            </div>
          </div>

          {/* 장점 */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl p-5 border border-emerald-100">
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-thumb-up-line text-emerald-500" />스마트팜 장점
            </h3>
            <ul className="space-y-1.5">
              {guide.smartFarm.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700">
                  <i className="ri-checkbox-circle-fill text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium leading-relaxed">{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 특기사항 */}
          {guide.smartFarm.notes.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-[11px] font-black text-amber-900 mb-2 flex items-center gap-1">
                <i className="ri-information-line" />참고 사항
              </p>
              <ul className="space-y-1">
                {guide.smartFarm.notes.map((note, i) => (
                  <li key={i} className="text-[10px] text-amber-700 leading-relaxed">• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ═══════ 노지 탭 ═══════ */}
      {tab === 'openfield' && (
        <section className="px-4 pb-6 relative z-10 space-y-4">
          <EnvCard title="🌾 노지재배 환경 조건" env={guide.openField.env} color="emerald" />

          {/* 정식 시기 */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 shadow-xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="ri-calendar-2-line text-2xl" />
              </div>
              <div>
                <p className="text-[11px] text-white/80 font-bold">정식 적기</p>
                <p className="text-sm font-black">{guide.openField.plantingMonths}</p>
              </div>
            </div>
          </div>

          {/* 단계별 재배 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-list-ordered text-emerald-500" />단계별 재배 과정
            </h3>
            <div className="space-y-4">
              {guide.openField.steps.map((step, i) => (
                <div key={i} className="relative pl-8">
                  {i < guide.openField.steps.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-emerald-200" />
                  )}
                  <div className="absolute left-0 top-0 w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-emerald-900">{step.title}</h4>
                      <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{step.days}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-[11px] text-gray-700">
                          <i className="ri-check-line text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                    {step.warning && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2">
                        <i className="ri-alarm-warning-line text-red-500 text-xs mt-0.5" />
                        <p className="text-[10px] text-red-700 font-bold leading-relaxed">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl p-5 border border-emerald-100">
            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-thumb-up-line text-emerald-500" />노지재배 장점
            </h3>
            <ul className="space-y-1.5">
              {guide.openField.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700">
                  <i className="ri-checkbox-circle-fill text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium leading-relaxed">{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {guide.openField.notes.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-[11px] font-black text-amber-900 mb-2 flex items-center gap-1">
                <i className="ri-information-line" />참고 사항
              </p>
              <ul className="space-y-1">
                {guide.openField.notes.map((note, i) => (
                  <li key={i} className="text-[10px] text-amber-700 leading-relaxed">• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ═══════ 병해충 탭 ═══════ */}
      {tab === 'pests' && (
        <section className="px-4 pb-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 border border-gray-100 mb-4">
            <h3 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-2">
              <i className="ri-bug-line text-red-500" />주요 병해충 및 방제
            </h3>
            <p className="text-[11px] text-gray-500 mb-4">예방이 치료보다 효과적입니다</p>
            <div className="space-y-3">
              {guide.pestsDiseases.map((pest, i) => (
                <div key={i} className={`rounded-2xl p-4 border ${pest.type === '병해' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${pest.type === '병해' ? 'bg-red-500' : 'bg-orange-500'}`}>
                      <i className={`${pest.type === '병해' ? 'ri-virus-line' : 'ri-bug-line'} text-white`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-gray-900">{pest.name}</h4>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${pest.type === '병해' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'}`}>
                        {pest.type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-xl p-2.5">
                      <p className="text-[10px] font-black text-gray-500 mb-0.5">증상</p>
                      <p className="text-[11px] text-gray-800 leading-relaxed">{pest.symptoms}</p>
                    </div>
                    <div className="bg-white rounded-xl p-2.5">
                      <p className="text-[10px] font-black text-emerald-600 mb-0.5">🛡 예방</p>
                      <p className="text-[11px] text-gray-800 leading-relaxed">{pest.prevention}</p>
                    </div>
                    <div className="bg-white rounded-xl p-2.5">
                      <p className="text-[10px] font-black text-blue-600 mb-0.5">💊 치료</p>
                      <p className="text-[11px] text-gray-800 leading-relaxed">{pest.treatment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 다른 작물 빠른 이동 */}
      <section className="px-4 pb-6 relative z-10">
        <h3 className="text-sm font-black text-gray-900 mb-3">다른 작물 가이드</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {availableIds.filter(id => id !== cropId).map(id => {
            const g = GROWING_GUIDES[id];
            return (
              <button
                key={id}
                onClick={() => setParams({ id })}
                className="flex-shrink-0 flex items-center gap-2 p-2.5 pr-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CROP_VISUAL[id]?.gradient ?? 'from-gray-300 to-gray-400'} flex items-center justify-center`}>
                  <span className="text-lg">{CROP_VISUAL[id]?.emoji ?? '🌱'}</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-800">{g.name}</p>
                  <p className="text-[9px] text-gray-500">{g.difficulty}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

/* 환경 조건 카드 */
function EnvCard({ title, env, color }: { title: string; env: import('@/data/cropGrowingGuide').EnvCondition; color: 'blue' | 'emerald' }) {
  const colorMap = {
    blue: { bg: 'from-blue-500 to-indigo-600', border: 'border-blue-100', item: 'bg-blue-50', text: 'text-blue-700' },
    emerald: { bg: 'from-emerald-500 to-teal-600', border: 'border-emerald-100', item: 'bg-emerald-50', text: 'text-emerald-700' },
  };
  const c = colorMap[color];

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border ${c.border} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${c.bg} px-5 py-4 text-white`}>
        <h3 className="text-sm font-black flex items-center gap-2">
          <i className="ri-settings-3-line" />{title}
        </h3>
      </div>
      <div className="p-5 grid grid-cols-2 gap-2.5">
        {[
          { icon: 'ri-sun-line',        label: '주간 온도', value: env.temperature.day },
          { icon: 'ri-moon-line',       label: '야간 온도', value: env.temperature.night },
          { icon: 'ri-drop-line',       label: '습도',     value: env.humidity },
          { icon: 'ri-lightbulb-line',  label: '광량',     value: env.light },
          { icon: 'ri-flask-line',      label: 'pH',      value: env.ph },
          { icon: 'ri-water-flash-line', label: 'EC',      value: env.ec },
        ].map(item => (
          <div key={item.label} className={`${c.item} rounded-xl p-3`}>
            <div className="flex items-center gap-1.5 mb-1">
              <i className={`${item.icon} ${c.text} text-sm`} />
              <p className="text-[10px] font-black text-gray-500">{item.label}</p>
            </div>
            <p className="text-[11px] font-black text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
          <i className="ri-water-flash-line text-gray-400 text-sm mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-gray-500">관수</p>
            <p className="text-[11px] text-gray-800 leading-relaxed">{env.watering}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
