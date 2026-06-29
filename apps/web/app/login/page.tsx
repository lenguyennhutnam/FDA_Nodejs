'use client';

import { useActionState, useRef } from 'react';
import { loginAction, LoginState } from './actions';

export default function LoginPage() {
  const [state, action, isPending] = useActionState<LoginState, FormData>(loginAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  function devLogin() {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem('email') as HTMLInputElement).value = 'admin@fda.local';
    (form.elements.namedItem('password') as HTMLInputElement).value = 'Admin@12345';
    form.requestSubmit();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: '#111' }}>FDA — Đăng nhập</h1>
        <form ref={formRef} action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#111' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#111' }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#111' }}>Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#111' }}
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* DEV ONLY - xóa trước khi production */}
        <button
          onClick={devLogin}
          className="mt-3 w-full text-xs text-gray-400 border border-dashed border-gray-300 py-1 rounded hover:bg-gray-50"
        >
          [DEV] Login admin
        </button>
      </div>
    </div>
  );
}
