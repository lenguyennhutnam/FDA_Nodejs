import { redirect } from 'next/navigation';
import { fetchUsers } from '@/lib/users';
import { getCurrentUser } from '@/lib/session';
import { UsersClient } from './users-client';
import { getAccessToken } from '@/lib/auth';

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const token = await getAccessToken();
  const users = await fetchUsers(token || '');

  return <UsersClient initialUsers={users} currentUserId={user.id} token={token || ''} />;
}
