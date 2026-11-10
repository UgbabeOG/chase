import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm, TwoFactorForm } from '../../components/forms';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';
export const Login = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [show2FA, setShow2FA] = useState(false);
    if (isAuthenticated) {
        return _jsx(Navigate, { to: user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD, replace: true });
    }
    const handleLoginSuccess = () => {
        navigate(user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD);
    };
    const handleSwitchTo2FA = () => {
        setShow2FA(true);
    };
    const handleBackToLogin = () => {
        setShow2FA(false);
    };
    return (_jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-6", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-10 h-10 text-chase-600", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: "Chase" })] }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Sign in to your account" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Access your banking dashboard securely" })] }), _jsx("div", { className: "card p-8", children: show2FA ? (_jsx(TwoFactorForm, { onSuccess: handleLoginSuccess, onBack: handleBackToLogin })) : (_jsx(LoginForm, { onSuccess: handleLoginSuccess, onSwitchTo2FA: handleSwitchTo2FA })) }), _jsxs("div", { className: "mt-6 text-center text-sm text-gray-500", children: [_jsx("p", { children: "Demo credentials:" }), _jsx("p", { className: "font-mono mt-1", children: "johndoe / password123" }), _jsx("p", { className: "font-mono", children: "admin / admin123" })] })] }));
};
