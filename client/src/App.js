import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout, AdminLayout } from './components/layout';
import { Landing } from './pages/Landing';
import { Login, TwoFactor, Setup2FA } from './pages/auth';
import { Dashboard, Accounts, Transactions } from './pages/dashboard';
import { Transfer } from './pages/transfers';
import { AdminUsers, AdminTransactions } from './pages/admin';
import { NotFound } from './pages/NotFound';
import { useAuth } from './store/AuthContext';
import { ROUTES } from './utils/constants';
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading, isLoggingOut, user } = useAuth();
    const isAdmin = user?.role === 'admin';
    if (isLoading || isLoggingOut) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
    }
    return isAdmin ? _jsx(Navigate, { to: ROUTES.ADMIN_USERS, replace: true }) : _jsx(Outlet, {});
};
const AdminRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" }) }));
    }
    if (!isAuthenticated || user?.role !== 'admin') {
        return _jsx(Navigate, { to: ROUTES.DASHBOARD, replace: true });
    }
    return _jsx(Outlet, {});
};
const PublicRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-chase-600" }) }));
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD, replace: true });
    }
    return (_jsx("main", { className: "flex min-h-screen min-h-[100svh] w-full items-center justify-center px-4 py-8 sm:px-6", children: _jsx(Outlet, {}) }));
};
const App = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsxs(Route, { element: _jsx(PublicRoute, {}), children: [_jsx(Route, { path: ROUTES.LOGIN, element: _jsx(Login, {}) }), _jsx(Route, { path: ROUTES.TWO_FACTOR, element: _jsx(TwoFactor, {}) }), _jsx(Route, { path: ROUTES.SETUP_2FA, element: _jsx(Setup2FA, {}) })] }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: ROUTES.DASHBOARD, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: ROUTES.ACCOUNTS, element: _jsx(Accounts, {}) }), _jsx(Route, { path: ROUTES.TRANSACTIONS, element: _jsx(Transactions, {}) }), _jsx(Route, { path: ROUTES.TRANSFER, element: _jsx(Transfer, {}) })] }) }), _jsx(Route, { element: _jsx(AdminRoute, {}), children: _jsxs(Route, { element: _jsx(AdminLayout, {}), children: [_jsx(Route, { path: "/admin/users", element: _jsx(AdminUsers, {}) }), _jsx(Route, { path: "/admin/transactions", element: _jsx(AdminTransactions, {}) }), _jsx(Route, { path: "/admin", element: _jsx(Navigate, { to: "/admin/users", replace: true }) })] }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
};
export default App;
