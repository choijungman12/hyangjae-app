import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <h1 className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-100 select-none pointer-events-none z-0">
        404
      </h1>
      <div className="relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-xl">
          <i className="ri-map-pin-2-line text-4xl text-white"></i>
        </div>
        <h1 className="text-xl font-black text-gray-900 mt-2">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-gray-500 font-mono">{location.pathname}</p>
        <p className="mt-3 text-base text-gray-500">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <i className="ri-home-5-line text-lg"></i>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
