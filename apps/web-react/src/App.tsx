/**
 * App.tsx — Root component
 * Theo pattern vfan/App.tsx
 * Bọc đầy đủ providers: Redux, BrowserRouter, ThemeProvider, LocalizationProvider
 */
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/vi';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import viVN from 'antd/lib/locale/vi_VN';
import { ConfigProvider } from 'antd';
import { persistor, store } from './redux/store';
import ThemeRoutes from './routers';
import theme from './theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <ConfigProvider locale={viVN}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <ErrorBoundary>
                  <ThemeRoutes />
                </ErrorBoundary>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </LocalizationProvider>
            </ConfigProvider>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default App;
