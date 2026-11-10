import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';
const twoFactorSchema = zod.object({
    otp: zod.string().length(6, 'Code must be 6 digits'),
});
export const TwoFactor = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Get username and password from location state
    const state = location.state;
    const username = state?.username;
    const password = state?.password;
    if (isAuthenticated) {
        navigate(ROUTES.DASHBOARD);
        return null;
    }
    if (!username || !password) {
        navigate(ROUTES.LOGIN);
        return null;
    }
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(twoFactorSchema),
    });
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await login(username, password, data.otp);
            navigate(ROUTES.DASHBOARD);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-6", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-10 h-10 text-chase-600", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: "Chase" })] }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Two-Factor Authentication" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Enter the 6-digit code from your authenticator app" })] }), _jsx("div", { className: "card p-8", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", noValidate: true, children: [error && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm", role: "alert", children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }), error] })), _jsx("div", { children: _jsx(Input, { ...register('otp'), label: "Authentication Code", placeholder: "000000", type: "text", autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6, error: errors.otp?.message, disabled: isLoading }) }), _jsxs(Button, { type: "submit", className: "w-full", size: "lg", isLoading: isLoading, children: [isLoading ? _jsx(Loader2, { className: "w-5 h-5 mr-2" }) : null, "Verify Code"] }), _jsx(Button, { type: "button", variant: "ghost", className: "w-full", onClick: () => navigate(ROUTES.LOGIN), children: "Back to Login" })] }) })] }));
};
