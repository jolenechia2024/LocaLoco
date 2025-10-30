// App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';
import { useThemeStore } from './store/themeStore';

export default function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <BrowserRouter>
      <div className={isDarkMode ? 'dark' : ''}>
        <AppRoutes />
        <Toaster />  {/* ✅ Remove isDarkMode prop */}
      </div>
    </BrowserRouter>
  );
}
