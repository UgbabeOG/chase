import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout, AuthLayout, AdminLayout } from './components/layout';
import { Landing } from './pages/Landing';
import { Login, TwoFactor, Setup2FA } from './pages/auth';
import { Dashboard, Accounts, Transactions } from './pages/dashboard';
import { Transfer } from './pages/transfers';
import { Profile } from './pages/profile';
import { Settings } from './pages/settings';
import { AdminUsers, AdminTransactions } from './pages/admin';
import { NotFound } from './pages/NotFound';
import { useAuth } from './store/AuthContext';
import { ROUTES } from './utils/constants';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, isLoggingOut, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isLoading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return isAdmin ? <Navigate to={ROUTES.ADMIN_USERS} replace /> : <Outlet />;
};

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD} replace />;
  }

  return (
    <main className="flex min-h-screen min-h-[100svh] w-full items-center justify-center px-4 py-8 sm:px-6">
      <Outlet />
    </main>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.TWO_FACTOR} element={<TwoFactor />} />
        <Route path={ROUTES.SETUP_2FA} element={<Setup2FA />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
          <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
          <Route path={ROUTES.TRANSFER} element={<Transfer />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;