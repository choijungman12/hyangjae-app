import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const Home = lazy(() => import('../pages/home/page'));
const CropRecognition = lazy(() => import('../pages/crop-recognition/page'));
const FacilityDesign = lazy(() => import('../pages/facility-design/page'));
const ProfitAnalysis = lazy(() => import('../pages/profit-analysis/page'));
const Booking = lazy(() => import('../pages/booking/page'));
const AIConsultant = lazy(() => import('../pages/ai-consultant/page'));
const CropDetail = lazy(() => import('../pages/crop-detail/page'));
const TaskReminders = lazy(() => import('../pages/task-reminders/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const TaskCalendar = lazy(() => import("../pages/task-calendar/page"));
const SmartFarmData = lazy(() => import('../pages/smart-farm-data/page'));
const CropDataDetail = lazy(() => import("../pages/crop-data-detail/page"));
const CultivationCalendar = lazy(() => import("../pages/cultivation-calendar/page"));
const FarmCalendarMemo = lazy(() => import("../pages/farm-calendar-memo/page"));
const Guide = lazy(() => import("../pages/guide/page"));

// 신규 페이지
const Login = lazy(() => import('../pages/login/page'));
const Profile = lazy(() => import('../pages/profile/page'));
const MapPage = lazy(() => import('../pages/map/page'));
const PriceTrends = lazy(() => import('../pages/price-trends/page'));
const Shop = lazy(() => import('../pages/shop/page'));
const ShopDetail = lazy(() => import('../pages/shop/detail'));
const ShopCart = lazy(() => import('../pages/shop/cart'));
const GrowingGuide = lazy(() => import('../pages/growing-guide/page'));
const DeviceControl = lazy(() => import('../pages/device-control/page'));
const AdminDashboard = lazy(() => import('../pages/admin/page'));
const AdminMembers = lazy(() => import('../pages/admin/members'));
const AdminBookings = lazy(() => import('../pages/admin/bookings'));
const AdminProducts = lazy(() => import('../pages/admin/products'));
const AdminContent = lazy(() => import('../pages/admin/content'));
const AdminBusiness = lazy(() => import('../pages/admin/business'));
const SmartCamera = lazy(() => import('../pages/smart-camera/page'));

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/crop-recognition', element: <CropRecognition /> },
  { path: '/facility-design', element: <FacilityDesign /> },
  { path: '/profit-analysis', element: <ProfitAnalysis /> },
  { path: '/booking', element: <Booking /> },
  { path: '/ai-consultant', element: <AIConsultant /> },
  { path: '/crop-detail', element: <CropDetail /> },
  { path: '/crop-data-detail', element: <CropDataDetail /> },
  { path: '/smart-farm-data', element: <SmartFarmData /> },
  { path: '/cultivation-calendar', element: <CultivationCalendar /> },
  { path: '/farm-calendar-memo', element: <FarmCalendarMemo /> },
  { path: '/task-reminders', element: <TaskReminders /> },
  { path: '/task-calendar', element: <TaskCalendar /> },
  { path: '/guide', element: <Guide /> },

  // 신규 라우트
  { path: '/login',        element: <Login /> },
  { path: '/profile',      element: <Profile /> },
  { path: '/map',          element: <MapPage /> },
  { path: '/price-trends', element: <PriceTrends /> },
  { path: '/shop',         element: <Shop /> },
  { path: '/shop/detail',  element: <ShopDetail /> },
  { path: '/shop/cart',    element: <ShopCart /> },
  { path: '/growing-guide',  element: <GrowingGuide /> },
  { path: '/device-control', element: <DeviceControl /> },

  // 관리자
  { path: '/admin',          element: <AdminDashboard /> },
  { path: '/admin/members',  element: <AdminMembers /> },
  { path: '/admin/bookings', element: <AdminBookings /> },
  { path: '/admin/products', element: <AdminProducts /> },
  { path: '/admin/content',  element: <AdminContent /> },
  { path: '/admin/business', element: <AdminBusiness /> },

  // AI 스마트 카메라
  { path: '/smart-camera', element: <SmartCamera /> },

  { path: '*', element: <NotFound /> },
];

export default routes;
