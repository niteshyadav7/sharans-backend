import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

const Layout = () => {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
