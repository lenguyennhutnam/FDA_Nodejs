'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/(app)/actions';
import type { CurrentUser } from '@/lib/session';

type NavItem = { href: string; label: string; icon: string; disabled?: boolean };

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/targets', label: 'Mục tiêu bảo vệ', icon: '🎯' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
];

export function Sidebar({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg">📡</span>
          <div>
            <div className="text-base font-bold leading-tight">FDA</div>
            <div className="text-[11px] text-gray-400">Giám sát hoạt động lãnh đạo</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                title="Sắp có"
              >
                <span className="opacity-50">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-[10px] text-gray-600">sắp có</span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-2 px-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">
              {user.email.charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.email}</div>
              <div className="text-xs text-gray-400 capitalize">{user.role}</div>
            </div>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition"
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
