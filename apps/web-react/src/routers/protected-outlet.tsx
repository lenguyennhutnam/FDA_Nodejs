/**
 * protected-outlet.tsx — Auth guard
 * Theo pattern vfan/routers/protected-outlet.tsx
 *
 * - Check token trong localStorage
 * - Gọi /me để verify token hợp lệ
 * - Nếu hợp lệ → dispatch updateInfo → render Outlet
 * - Nếu không → dispatch logout → redirect /login
 */
import { FC, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout, setAuthStatus, updateInfo } from '@/redux/auth/auth.slice';
import { StoreService } from '@/utils/store';
import { RouterLink } from './routers';
import { AuthService } from '@/lib/apis/auth';

type RouterProps = {
  requireLogin?: boolean;
};

const ProtectedOutlet: FC<RouterProps> = ({ requireLogin = false }) => {
  const { isLogin, authStatus } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = StoreService.getAuthToken();

      if (!token) {
        if (!cancelled) {
          dispatch(setAuthStatus('unauthenticated'));
          setBootstrapped(true);
        }
        return;
      }

      try {
        // Verify token bằng cách gọi /me
        const user = await AuthService.me(token);
        if (!cancelled) {
          dispatch(updateInfo(user));
        }
      } catch {
        // Token hết hạn hoặc không hợp lệ → logout
        if (!cancelled) {
          dispatch(logout());
        }
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Đang kiểm tra token → hiện loading
  if (!bootstrapped || authStatus === 'unknown') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Trang yêu cầu đăng nhập mà chưa đăng nhập → redirect login
  if (requireLogin && !isLogin) {
    return <Navigate to={RouterLink.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedOutlet;
