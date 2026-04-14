import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const CHAPTERS = [
  {
    id: 1,
    title: '향재원 소개',
    subtitle: '브랜드 & 스마트팜 개요',
    color: 'from-emerald-500 to-teal-600',
    startIndex: 0,
    endIndex: 3,
  },
  {
    id: 2,
    title: '재배 환경 관리',
    subtitle: '온도·습도·CO₂ 최적 조건',
    color: 'from-blue-500 to-indigo-600',
    startIndex: 4,
    endIndex: 10,
  },
  {
    id: 3,
    title: '영양 & 관개 관리',
    subtitle: 'EC·pH 조절 및 관수 스케줄',
    color: 'from-cyan-500 to-blue-600',
    startIndex: 11,
    endIndex: 17,
  },
  {
    id: 4,
    title: '씨앗 & 육묘 관리',
    subtitle: 'T0/T1/T2 종자 저장 및 육묘',
    color: 'from-lime-500 to-green-600',
    startIndex: 18,
    endIndex: 24,
  },
  {
    id: 5,
    title: '병해충 & 방제',
    subtitle: '주요 병해충 예방 및 처리',
    color: 'from-orange-500 to-red-600',
    startIndex: 25,
    endIndex: 31,
  },
  {
    id: 6,
    title: '수확 & 품질관리',
    subtitle: '등급 선별 및 저장 기준',
    color: 'from-purple-500 to-pink-600',
    startIndex: 32,
    endIndex: 38,
  },
  {
    id: 7,
    title: 'IoT 스마트 모니터링',
    subtitle: '실시간 센서 데이터 및 자동화',
    color: 'from-violet-500 to-indigo-600',
    startIndex: 39,
    endIndex: 45,
  },
  {
    id: 8,
    title: '경제성 & 성장 타임라인',
    subtitle: '23개월 성장 계획 및 수익 분석',
    color: 'from-amber-500 to-orange-600',
    startIndex: 46,
    endIndex: 54,
  },
];

const TOTAL_IMAGES = 55;

const EXTENSIONS: Record<number, string> = { 1: 'png', 3: 'png' };

function getImagePath(index: number): string {
  const ext = EXTENSIONS[index] ?? 'jpg';
  return `/guide-images/guide-${String(index).padStart(2, '0')}.${ext}`;
}

/* ═══════ 향재원 소개 웹툰 — 10화 (public/webtoon/1~10.jpg) ═══════ */
const INTRO_TOTAL = 10;

function getIntroPath(index: number): string {
  // index는 0부터 시작, 파일은 1부터 시작
  return `/webtoon/${index + 1}.jpg`;
}

type WebtoonCategory = 'intro' | 'guide';

export default function GuidePage() {
  const [category, setCategory] = useState<WebtoonCategory>('intro');
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [introLightboxIndex, setIntroLightboxIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chapters' | 'all'>('chapters');
  const chapterRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const scrollToChapter = (chapterId: number) => {
    setActiveChapter(chapterId);
    setViewMode('all');
    setTimeout(() => {
      chapterRefs.current[chapterId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    if (lightboxIndex !== null || introLightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex, introLightboxIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === 'ArrowRight' && lightboxIndex < TOTAL_IMAGES - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (e.key === 'Escape') {
      setLightboxIndex(null);
    }
  };

  const getChapterForIndex = (index: number) =>
    CHAPTERS.find(c => index >= c.startIndex && index <= c.endIndex);

  return (
    <div className="min-h-screen bg-gray-950 pb-20" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-800">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800 transition-colors"
            aria-label="홈으로"
          >
            <i className="ri-arrow-left-line text-xl text-gray-300" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">향재원 웹툰</h1>
            <p className="text-xs text-emerald-400">
              {category === 'intro' ? `향재원 소개 · ${INTRO_TOTAL}화` : `재배 가이드 · ${TOTAL_IMAGES}화`}
            </p>
          </div>
          {category === 'guide' && (
            <button
              onClick={() => setViewMode(viewMode === 'chapters' ? 'all' : 'chapters')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {viewMode === 'chapters' ? '전체보기' : '챕터별'}
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setCategory('intro')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              category === 'intro'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <i className="ri-sparkling-line mr-1" />
            향재원 소개 웹툰
          </button>
          <button
            type="button"
            onClick={() => setCategory('guide')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              category === 'guide'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <i className="ri-book-open-line mr-1" />
            재배 가이드 웹툰
          </button>
        </div>
      </header>

      {/* ═══════ 향재원 소개 웹툰 카테고리 ═══════ */}
      {category === 'intro' && (
        <div className="pt-4 pb-8">
          <div className="px-4 mb-5">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-900/60 border border-emerald-800/50 p-5 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                <i className="ri-sparkling-fill text-2xl text-white" />
              </div>
              <h2 className="text-white font-black text-base mb-1">향재원 소개 웹툰</h2>
              <p className="text-emerald-200 text-xs">A Heartwarming Evening at Hyangjaewon</p>
              <p className="text-gray-400 text-[11px] mt-2" translate="no">총 {INTRO_TOTAL}화 · 순서대로 읽어주세요</p>
            </div>
          </div>

          {Array.from({ length: INTRO_TOTAL }, (_, i) => i).map((index) => (
            <div key={index} className="relative group">
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none" translate="no">
                #{index + 1}
              </div>
              <button
                type="button"
                className="w-full block cursor-zoom-in"
                onClick={() => setIntroLightboxIndex(index)}
                aria-label={`향재원 소개 웹툰 ${index + 1}화 크게 보기`}
              >
                <img
                  src={getIntroPath(index)}
                  alt={`향재원 소개 웹툰 ${index + 1}`}
                  className="w-full object-contain block"
                  loading="lazy"
                />
              </button>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
            </div>
          ))}

          {/* 끝 카드 */}
          <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-800/50 p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
              <i className="ri-heart-fill text-2xl text-white" />
            </div>
            <h3 className="text-white font-black text-base mb-1">향재원 소개 웹툰 완독!</h3>
            <p className="text-gray-400 text-xs mb-4" translate="no">총 {INTRO_TOTAL}화</p>
            <button
              type="button"
              onClick={() => setCategory('guide')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg"
            >
              <i className="ri-book-open-line" />
              재배 가이드 웹툰 보기
            </button>
          </div>
        </div>
      )}

      {/* ═══════ 재배 가이드 웹툰 카테고리 ═══════ */}
      {category === 'guide' && (<>

      {/* Chapter Overview */}
      {viewMode === 'chapters' && (
        <div className="px-4 pt-6 pb-4">
          <p className="text-gray-400 text-sm mb-6 text-center">
            챕터를 선택하거나 전체보기로 순서대로 확인하세요
          </p>
          <div className="space-y-3">
            {CHAPTERS.map((chapter) => {
              const count = chapter.endIndex - chapter.startIndex + 1;
              return (
                <button
                  key={chapter.id}
                  onClick={() => scrollToChapter(chapter.id)}
                  className="w-full text-left group"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-300">
                    {/* Gradient Preview Strip */}
                    <div className={`h-1 bg-gradient-to-r ${chapter.color} w-full`} />
                    <div className="flex items-center gap-4 p-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chapter.color} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0`}>
                        {chapter.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm truncate">{chapter.title}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">{chapter.subtitle}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-500">{count}화</span>
                        <i className="ri-arrow-right-s-line text-lg text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </div>
                    {/* Thumbnail row */}
                    <div className="px-4 pb-3 flex gap-1.5 overflow-hidden">
                      {Array.from({ length: Math.min(4, count) }, (_, i) => (
                        <div key={i} className="w-14 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            src={getImagePath(chapter.startIndex + i)}
                            alt={`미리보기 ${chapter.startIndex + i + 1}`}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                            loading="lazy"
                          />
                        </div>
                      ))}
                      {count > 4 && (
                        <div className="w-14 h-10 rounded-lg bg-gray-800 flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-bold">+{count - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Webtoon View */}
      {viewMode === 'all' && (
        <div className="pt-2">
          {CHAPTERS.map((chapter) => (
            <div
              key={chapter.id}
              ref={(el) => { chapterRefs.current[chapter.id] = el; }}
            >
              {/* Chapter Banner */}
              <div className={`mx-4 my-4 rounded-2xl bg-gradient-to-r ${chapter.color} p-4 shadow-xl`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                    {chapter.id}
                  </div>
                  <div>
                    <h2 className="text-white font-black text-base">{chapter.title}</h2>
                    <p className="text-white/80 text-xs">{chapter.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Images in chapter */}
              {Array.from(
                { length: chapter.endIndex - chapter.startIndex + 1 },
                (_, i) => chapter.startIndex + i
              ).map((imgIndex) => (
                <div key={imgIndex} className="relative group">
                  {/* Episode number badge */}
                  <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none">
                    #{imgIndex + 1}
                  </div>
                  <button
                    className="w-full block cursor-zoom-in"
                    onClick={() => setLightboxIndex(imgIndex)}
                    aria-label={`이미지 ${imgIndex + 1} 크게 보기`}
                  >
                    <img
                      src={getImagePath(imgIndex)}
                      alt={`가이드 이미지 ${imgIndex + 1}`}
                      className="w-full object-contain block"
                      loading="lazy"
                    />
                  </button>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
                </div>
              ))}

              {/* Chapter end divider */}
              <div className="flex items-center gap-3 px-6 my-6">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs font-semibold">챕터 {chapter.id} 완</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
            </div>
          ))}

          {/* End card */}
          <div className="mx-4 mb-8 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-800/50 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <i className="ri-plant-line text-3xl text-white" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">향재원 재배 가이드 완독!</h3>
            <p className="text-gray-400 text-sm mb-5">총 {TOTAL_IMAGES}화 · 8개 챕터</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              <i className="ri-home-5-line" />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      )}

      </>)}
      {/* ═══════ /재배 가이드 웹툰 카테고리 ═══════ */}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-white font-bold text-sm">
                {getChapterForIndex(lightboxIndex)?.title}
              </p>
              <p className="text-gray-400 text-xs">#{lightboxIndex + 1} / {TOTAL_IMAGES}</p>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl text-white hover:bg-gray-700 transition-colors"
              aria-label="닫기"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 overflow-auto flex items-start justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImagePath(lightboxIndex)}
              alt={`가이드 이미지 ${lightboxIndex + 1}`}
              className="max-w-full w-full object-contain"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-4 bg-black/80 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
              disabled={lightboxIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 disabled:opacity-30 rounded-xl text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              <i className="ri-arrow-left-s-line text-lg" />
              이전
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, TOTAL_IMAGES) }, (_, i) => {
                const start = Math.max(0, Math.min(lightboxIndex - 2, TOTAL_IMAGES - 5));
                const idx = start + i;
                return (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      idx === lightboxIndex ? 'bg-emerald-400 w-6' : 'bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
            </div>
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null && prev < TOTAL_IMAGES - 1 ? prev + 1 : prev))}
              disabled={lightboxIndex === TOTAL_IMAGES - 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 disabled:opacity-30 rounded-xl text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              다음
              <i className="ri-arrow-right-s-line text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* 향재원 소개 웹툰 전용 Lightbox */}
      {introLightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          onClick={() => setIntroLightboxIndex(null)}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-white font-bold text-sm">향재원 소개 웹툰</p>
              <p className="text-gray-400 text-xs" translate="no">#{introLightboxIndex + 1} / {INTRO_TOTAL}</p>
            </div>
            <button
              type="button"
              onClick={() => setIntroLightboxIndex(null)}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl text-white hover:bg-gray-700 transition-colors"
              aria-label="닫기"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-start justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getIntroPath(introLightboxIndex)}
              alt={`향재원 소개 웹툰 ${introLightboxIndex + 1}`}
              className="max-w-full w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-4 bg-black/80 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIntroLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
              disabled={introLightboxIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 disabled:opacity-30 rounded-xl text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              <i className="ri-arrow-left-s-line text-lg" />
              이전
            </button>
            <span className="text-gray-400 text-xs" translate="no">{introLightboxIndex + 1} / {INTRO_TOTAL}</span>
            <button
              type="button"
              onClick={() => setIntroLightboxIndex((prev) => (prev !== null && prev < INTRO_TOTAL - 1 ? prev + 1 : prev))}
              disabled={introLightboxIndex === INTRO_TOTAL - 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 disabled:opacity-30 rounded-xl text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              다음
              <i className="ri-arrow-right-s-line text-lg" />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
