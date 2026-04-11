import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { kakaoLogin, KAKAO_CONFIGURED } from '@/lib/kakaoAuth';

export const AUTH_KEY = 'hyangjae_user';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  loginType: 'kakao' | 'guest';
  joinedAt: string;
  bookings: number;
}

type Step = 'main' | 'loading' | 'error';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('main');
  const [errorMsg, setErrorMsg] = useState('');

  const saveUser = (user: UserInfo) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    navigate('/profile');
  };

  const handleKakaoLogin = async () => {
    if (!KAKAO_CONFIGURED) {
      // 앱 키 미설정 시 → 일시적으로 게스트처럼 처리하되 에러 노출 없이 진행
      // (실 서비스에서는 키가 항상 설정되어 있어야 함)
      setErrorMsg('서비스 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      setStep('error');
      return;
    }

    setStep('loading');
    try {
      const profile = await kakaoLogin();
      saveUser({
        id: `kakao_${profile.id}`,
        name: profile.name,
        email: profile.email,
        profileImage: profile.profileImage,
        loginType: 'kakao',
        joinedAt: new Date().toISOString().split('T')[0],
        bookings: 0,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('취소') || msg.includes('cancel')) {
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
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F5DC00] active:bg-[#EDD100] text-[#191919] font-black text-base py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <KakaoIcon size={22} />
              카카오로 시작하기
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

            <p className="text-center text-xs text-gray-400 leading-relaxed pt-2">
              로그인 시{' '}
              <span className="text-emerald-600 font-bold">서비스 이용약관</span>
              {' '}및{' '}
              <span className="text-emerald-600 font-bold">개인정보처리방침</span>
              에 동의합니다.
            </p>
          </div>
        )}

        {/* ── 로딩 ── */}
        {step === 'loading' && (
          <div className="text-center space-y-5 w-full max-w-sm">
            <div className="w-20 h-20 mx-auto bg-[#FEE500] rounded-3xl flex items-center justify-center animate-pulse shadow-xl">
              <KakaoIcon size={36} />
            </div>
            <p className="text-base font-black text-gray-900">카카오 로그인 중...</p>
            <p className="text-xs text-gray-400">팝업창에서 카카오 계정으로 로그인해 주세요</p>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 bg-[#FEE500] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <button onClick={() => setStep('main')} className="text-xs text-gray-400 underline">취소</button>
          </div>
        )}

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
