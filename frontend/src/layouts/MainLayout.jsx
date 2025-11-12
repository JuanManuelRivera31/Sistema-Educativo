import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';

export default function MainLayout() {
  const { pathname } = useLocation();
  const hideHeader = pathname === '/login' || pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <main className="max-w-7xl mx-auto p-6 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
