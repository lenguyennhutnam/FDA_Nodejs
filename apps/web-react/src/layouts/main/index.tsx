import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export const MainLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F7FC' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};
