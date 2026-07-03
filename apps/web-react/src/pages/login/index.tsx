import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { loginSuccess, setToken } from '@/redux/auth/auth.slice';
import { StoreService } from '@/utils/store';
import { AuthService } from '@/lib/apis/auth';
import { RouterLink } from '@/routers/routers';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { isLogin } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Đã đăng nhập → redirect dashboard
  if (isLogin) {
    return <Navigate to={RouterLink.DASHBOARD} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await AuthService.login(email, password);
      // Lưu token vào localStorage
      StoreService.setAuthToken(res.accessToken);
      StoreService.setRefreshToken(res.refreshToken);
      // Lấy thông tin user
      const user = await AuthService.me(res.accessToken);
      dispatch(setToken(res.accessToken));
      dispatch(loginSuccess(user));
      navigate(RouterLink.DASHBOARD, { replace: true });
    } catch (e: any) {
      setError(e.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">📡</span>
            <div className="text-left">
              <div className="text-2xl font-bold text-white leading-tight">FDA</div>
              <div className="text-sm text-gray-400">Giám sát hoạt động lãnh đạo</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
