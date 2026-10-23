import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

/* ── 농장 스토리 (공개 페이지) ── */
const Home = lazy(() => import('../pages/home/page'));
const Wasabi = lazy(() => import('../pages/wasabi/page'));
const Houses = lazy(() => import('../pages/houses/page'));
const Field = lazy(() => import('../pages/field/page'));
const CareFarming = lazy(() => import('../pages/care-farming/page'));
const CareProgramDetail = lazy(() => import('../pages/care-farming/detail'));
const Visit = lazy(() => import('../pages/visit/page'));

/* ── 스마트팜 · 작물 ── */
const CropRecognition = lazy(() => import('../pages/crop-recognition/page'));
const FacilityDesign = lazy(() => import('../pages/facility-design/page'));
const ProfitAnalysis = lazy(() => import('../pages/profit-analysis/page'));
const AIConsultant = lazy(() => import('../pages/ai-consultant/page'));
const CropDetail = lazy(() => import('../pages/crop-detail/page'));
const TaskReminders = lazy(() => import('../pages/task-reminders/page'));
const TaskCalendar = lazy(() => import('../pages/task-calendar/page'));
const SmartFarmData = lazy(() => import('../pages/smart-farm-data/page'));
const CropDataDetail = lazy(() => import('../pages/crop-data-detail/page'));
const CultivationCalendar = lazy(() => import('../pages/cultivation-calendar/page'));
const FarmCalendarMemo = lazy(() => import('../pages/farm-calendar-memo/page'));
const Guide = lazy(() => import('../pages/guide/page'));
const GrowingGuide = lazy(() => import('../pages/growing-guide/page'));
const DeviceControl = lazy(() => import('../pages/device-control/page'));
const PriceTrends = lazy(() => import('../pages/price-trends/page'));
const SmartCamera = lazy(() => import('../pages/smart-camera/page'));

/* ── 사용자 · 판매 ── */
const Login = lazy(() => import('../pages/login/page'));
const Profile = lazy(() => import('../pages/profile/page'));
const MapPage = lazy(() => import('../pages/map/page'));
const Shop = lazy(() => import('../pages/shop/page'));
const ShopDetail = lazy(() => import('../pages/shop/detail'));
const ShopCart = lazy(() => import('../pages/shop/cart'));

/* ── 관리자 ── */
const AdminDashboard = lazy(() => import('../pages/admin/page'));
const AdminMembers = lazy(() => import('../pages/admin/members'));
const AdminInquiries = lazy(() => import('../pages/admin/inquiries'));
const AdminProducts = lazy(() => import('../pages/admin/products'));
const AdminContent = lazy(() => import('../pages/admin/content'));
const AdminBusiness = lazy(() => import('../pages/admin/business'));

const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  /* 농장 스토리 — 고추냉이를 중심으로 한 공개 서사 */
  { path: '/',             element: <Home /> },
  { path: '/wasabi',       element: <Wasabi /> },
  { path: '/houses',       element: <Houses /> },
  { path: '/field',        element: <Field /> },
  { path: '/care-farming', element: <CareFarming /> },
  { path: '/care-farming/:programId', element: <CareProgramDetail /> },
  { path: '/visit',        element: <Visit /> },

  /* 스마트팜 · 작물 데이터 */
  { path: '/crop-recognition',     element: <CropRecognition /> },
  { path: '/facility-design',      element: <FacilityDesign /> },
  { path: '/profit-analysis',      element: <ProfitAnalysis /> },
  { path: '/ai-consultant',        element: <AIConsultant /> },
  { path: '/crop-detail',          element: <CropDetail /> },
  { path: '/crop-data-detail',     element: <CropDataDetail /> },
  { path: '/smart-farm-data',      element: <SmartFarmData /> },
  { path: '/cultivation-calendar', element: <CultivationCalendar /> },
  { path: '/farm-calendar-memo',   element: <FarmCalendarMemo /> },
  { path: '/task-reminders',       element: <TaskReminders /> },
  { path: '/task-calendar',        element: <TaskCalendar /> },
  { path: '/guide',                element: <Guide /> },
  { path: '/growing-guide',        element: <GrowingGuide /> },
  { path: '/device-control',       element: <DeviceControl /> },
  { path: '/price-trends',         element: <PriceTrends /> },
  { path: '/smart-camera',         element: <SmartCamera /> },

  /* 사용자 · 판매 */
  { path: '/login',       element: <Login /> },
  { path: '/profile',     element: <Profile /> },
  { path: '/map',         element: <MapPage /> },
  { path: '/shop',        element: <Shop /> },
  { path: '/shop/detail', element: <ShopDetail /> },
  { path: '/shop/cart',   element: <ShopCart /> },

  /* 관리자 */
  { path: '/admin',           element: <AdminDashboard /> },
  { path: '/admin/members',   element: <AdminMembers /> },
  { path: '/admin/inquiries', element: <AdminInquiries /> },
  { path: '/admin/products',  element: <AdminProducts /> },
  { path: '/admin/content',   element: <AdminContent /> },
  { path: '/admin/business',  element: <AdminBusiness /> },

  /* 구 공간대여 경로 — 방문 안내로 영구 이동 (북마크·외부 링크 호환) */
  { path: '/booking',         element: <Navigate to="/visit" replace /> },
  { path: '/admin/bookings',  element: <Navigate to="/admin/inquiries" replace /> },

  { path: '*', element: <NotFound /> },
];

export default routes;
