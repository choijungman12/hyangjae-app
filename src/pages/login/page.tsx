import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { kakaoLogin, KAKAO_CONFIGURED } from '@/lib/kakaoAuth';
import { naverLogin, NAVER_CONFIGURED } from '@/lib/naverAuth';
import { googleLogin, GOOGLE_CONFIGURED } from '@/lib/googleAuth';
import { loginAsBusiness } from '@/lib/businessAuth';

export const AUTH_KEY = 'hyangjae_user';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  loginType: 'kakao' | 'naver' | 'google' | 'guest';
  joinedAt: string;
  bookings: number;
}

type Step = 'main' | 'loading' | 'error' | 'business-login';
type Provider = 'kakao' | 'naver' | 'google';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const wantsBusiness = searchParams.get('role') === 'business';
  const [step, setStep] = useState<Step>(wantsBusiness ? 'business-login' : 'main');
  const [loadingProvider, setLoadingProvider] = useState<Provider>('kakao');
  const [errorMsg, setErrorMsg] = useState('');
  const [bizForm, setBizForm] = useState({ name: '', businessName: '', phone: '', email: '' });

  const saveUser = (user: UserInfo) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    navigate('/profile');
  };

  const handleSocialLogin = async (provider: Provider) => {
    const configured =
      provider === 'kakao' ? KAKAO_CONFIGURED :
      provider === 'naver' ? NAVER_CONFIGURED :
      GOOGLE_CONFIGURED;

    if (!configured) {
      setErrorMsg('서비스 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      setStep('error');
      return;
    }

    setLoadingProvider(provider);
    setStep('loading');
    try {
      const profile =
        provider === 'kakao' ? await kakaoLogin() :
        provider === 'naver' ? await naverLogin() :
        await googleLogin();

      saveUser({
        id: `${provider}_${profile.id}`,
        name: profile.name,
        email: profile.email,
        profileImage: profile.profileImage,
        loginType: provider,
        joinedAt: new Date().toISOString().split('T')[0],
        bookings: 0,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('취소') || msg.toLowerCase().includes('cancel')) {
        setStep('main');
      } else {
        setErrorMsg('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        setStep('error');
      }
    }
  };

  const handleGuestLogin = () => {
    saveUser({
      id: `guest_${Date.now()}`,
      name: '게스트',
      email: '',
      profileImage: '',
      loginType: 'guest',
      joinedAt: new Date().toISOString().split('T')[0],
      bookings: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* 헤더 */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Link to="/" className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all">
          <i className="ri-arrow-left-line text-xl text-gray-700" />
        </Link>
        <h1 className="text-base font-black text-gray-900">로그인</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* 로고 */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <i className="ri-plant-line text-5xl text-white drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">향재원</h2>
          <p className="text-sm text-gray-500 font-medium">서초구 양재동 스마트팜 · 체험 공간</p>
        </div>

        {/* ── 메인 ── */}
        {step === 'main' && (
          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F5DC00] active:bg-[#EDD100] text-[#191919] font-black text-base py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <KakaoIcon size={22} />
              카카오로 시작하기
            </button>

            <button
              onClick={() => handleSocialLogin('naver')}
              className="w-full flex items-center justify-center gap-3 bg-[#03C75A] hover:bg-[#02B14F] active:bg-[#029846] text-white font-black text-base py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <NaverIcon size={20} />
              네이버로 시작하기
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-black text-base py-4 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <GoogleIcon size={20} />
              구글로 시작하기
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-black text-sm py-4 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <i className="ri-user-line text-lg" />
              게스트로 둘러보기
            </button>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">사업자</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={() => setStep('business-login')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <i className="ri-building-line text-lg" />
              사업자 · 예비사업자 로그인
            </button>

            <p className="text-center text-xs text-gray-400 leading-relaxed pt-2">
              로그인 시{' '}
              <span className="text-emerald-600 font-bold">서비스 이용약관</span>
              {' '}및{' '}
              <span className="text-emerald-600 font-bold">개인정보처리방침</span>
              에 동의합니다.
            </p>
          </div>
        )}

        {/* ── 사업자 로그인 / 가입 신청 ── */}
        {step === 'business-login' && (
          <div className="w-full max-w-sm">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 mb-4">
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl mb-3">
                  <i className="ri-building-line text-2xl text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900">사업자 로그인</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  사업자 또는 예비사업자로 가입하시면<br />
                  <b>수지분석 · 시설설계 · 작목반장 시세</b> 서비스를 이용할 수 있습니다
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-gray-600 mb-1">이름 (대표자명)</label>
                  <input
                    type="text"
                    value={bizForm.name}
                    onChange={e => setBizForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-600 mb-1">사업장명 (예비사업자는 예정 명칭)</label>
                  <input
                    type="text"
                    value={bizForm.businessName}
                    onChange={e => setBizForm(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="OO 스마트팜"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-600 mb-1">연락처</label>
                  <input
                    type="tel"
                    value={bizForm.phone}
                    onChange={e => setBizForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-600 mb-1">이메일</label>
                  <input
                    type="email"
                    value={bizForm.email}
                    onChange={e => setBizForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!bizForm.name || !bizForm.businessName || !bizForm.phone || !bizForm.email) {
                    setErrorMsg('모든 항목을 입력해 주세요.');
                    return;
                  }
                  setErrorMsg('');
                  loginAsBusiness(bizForm);
                  const dest = redirectTo ? `/${redirectTo}` : '/profit-analysis';
                  navigate(dest);
                }}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <i className="ri-login-box-line mr-1.5" />
                사업자 로그인 / 가입 신청
              </button>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center mt-2 font-bold">{errorMsg}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep('main')}
              className="w-full text-center text-xs text-gray-500 font-bold py-2 hover:text-gray-700 transition-colors"
            >
              ← 일반 로그인으로 돌아가기
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-3">
              <div className="flex items-start gap-2">
                <i className="ri-information-line text-blue-500 text-sm mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-blue-800 leading-relaxed">
                  <p className="font-black mb-1">사업자 서비스 안내</p>
                  <ul className="space-y-0.5">
                    <li>• <b>수지분석</b>: 작물별 ROI · 원가 · 수익 시뮬레이션</li>
                    <li>• <b>시설설계</b>: 평당 비용 · 하우스 종류별 견적</li>
                    <li>• <b>작목반장 시세</b>: KAMIS 기반 작물 시세 밴드</li>
                    <li>• 각 사업자는 <b>자기 사업장의 데이터만</b> 확인 가능</li>
                    <li>• 향재원 자체 재무 데이터는 <b>관리자 전용</b></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 로딩 ── */}
        {step === 'loading' && (() => {
          const meta = {
            kakao:  { label: '카카오', bg: 'bg-[#FEE500]', dot: 'bg-[#FEE500]', icon: <KakaoIcon size={36} /> },
            naver:  { label: '네이버', bg: 'bg-[#03C75A]', dot: 'bg-[#03C75A]', icon: <NaverIcon size={32} /> },
            google: { label: '구글',   bg: 'bg-white border-2 border-gray-200', dot: 'bg-gray-300', icon: <GoogleIcon size={32} /> },
          }[loadingProvider];
          return (
            <div className="text-center space-y-5 w-full max-w-sm">
              <div className={`w-20 h-20 mx-auto ${meta.bg} rounded-3xl flex items-center justify-center animate-pulse shadow-xl`}>
                {meta.icon}
              </div>
              <p className="text-base font-black text-gray-900">{meta.label} 로그인 중...</p>
              <p className="text-xs text-gray-400">팝업창에서 {meta.label} 계정으로 로그인해 주세요</p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2.5 h-2.5 ${meta.dot} rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <button onClick={() => setStep('main')} className="text-xs text-gray-400 underline">취소</button>
            </div>
          );
        })()}

        {/* ── 오류 ── */}
        {step === 'error' && (
          <div className="text-center space-y-5 w-full max-w-sm">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-3xl flex items-center justify-center shadow-xl">
              <i className="ri-error-warning-line text-4xl text-red-400" />
            </div>
            <div>
              <p className="text-base font-black text-gray-900 mb-1">로그인 실패</p>
              <p className="text-sm text-gray-500">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStep('main')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KakaoIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.91)} viewBox="0 0 22 20" fill="none" aria-hidden="true">
      <path
        d="M11 0C4.925 0 0 3.9 0 8.714c0 3.1 2.025 5.834 5.1 7.378l-1.3 4.783c-.113.413.35.742.713.493L10.225 17.8c.258.017.516.026.775.026C17.075 17.826 22 13.926 22 8.714 22 3.9 17.075 0 11 0Z"
        fill="#191919"
      />
    </svg>
  );
}

function NaverIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.539 10.71 8.255 6H4v8h4.461V9.288L11.745 14H16V6h-4.461v4.71Z" fill="#fff" />
    </svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5Z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7Z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.4 39.5 16.1 44 24 44Z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5Z"/>
    </svg>
  );
}
