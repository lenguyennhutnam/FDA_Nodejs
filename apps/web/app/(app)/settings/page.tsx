import { fetchSettings, fetchDataStats } from '@/lib/settings';
import { getCurrentUser } from '@/lib/session';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const [settings, stats, user] = await Promise.all([
    fetchSettings(),
    fetchDataStats(),
    getCurrentUser(),
  ]);

  if (!settings) {
    return <main className="p-8 text-gray-500">Không tải được cài đặt.</main>;
  }

  return (
    <SettingsClient settings={settings} stats={stats} isAdmin={user?.role === 'admin'} />
  );
}
