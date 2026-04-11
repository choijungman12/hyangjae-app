import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg animate-pulse">
          <i className="ri-plant-line text-3xl text-white"></i>
        </div>
        <p className="text-sm font-semibold text-emerald-600">향재원 로딩 중...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <Suspense fallback={<LoadingFallback />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
