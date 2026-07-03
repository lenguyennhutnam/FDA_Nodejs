import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts';
import { LoginPage } from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import TargetsPage from '@/pages/targets';
import TargetDetailPage from '@/pages/targets/detail';
import UsersPage from '@/pages/users';
import SettingsPage from '@/pages/settings';
import ProtectedOutlet from './protected-outlet';
import { RouterLink } from './routers';

const MainRoutes = [
  // Redirect root → dashboard
  { path: '/', element: <Navigate to={RouterLink.DASHBOARD} replace /> },

  // Trang đăng nhập (không cần auth)
  { path: RouterLink.LOGIN, element: <LoginPage /> },

  // Các trang yêu cầu đăng nhập
  {
    path: '',
    element: <ProtectedOutlet requireLogin={true} />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          { path: RouterLink.DASHBOARD, element: <DashboardPage /> },
          { path: RouterLink.TARGETS, element: <TargetsPage /> },
          { path: `${RouterLink.TARGETS}/:id`, element: <TargetDetailPage /> },
          { path: RouterLink.USERS, element: <UsersPage /> },
          { path: RouterLink.SETTINGS, element: <SettingsPage /> },
          // Fallback
          { path: '*', element: <Navigate to={RouterLink.DASHBOARD} replace /> },
        ],
      },
    ],
  },
];

export default MainRoutes;
