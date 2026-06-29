import { Sidebar } from '@/components/Sidebar';
import { getCurrentUser } from '@/lib/session';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
