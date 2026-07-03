import { useRoutes } from 'react-router-dom';
import MainRoutes from './main-routers';

/**
 * ThemeRoutes — Render toàn bộ route tree
 * Giống vfan/routers/index.ts
 */
const ThemeRoutes = () => {
  return useRoutes(MainRoutes);
};

export default ThemeRoutes;
