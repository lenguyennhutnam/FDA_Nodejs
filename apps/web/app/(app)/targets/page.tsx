import { fetchTargets } from '@/lib/targets';
import { getCurrentUser } from '@/lib/session';
import { TargetsClient } from './targets-client';

export default async function TargetsPage() {
  const [targets, user] = await Promise.all([fetchTargets(), getCurrentUser()]);
  const isAdmin = user?.role === 'admin';
  return <TargetsClient targets={targets} isAdmin={isAdmin} />;
}
