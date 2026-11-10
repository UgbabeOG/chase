import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Loader2, Copy } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';
import { useToast } from '../../store/ToastContext';
const verify2FASchema = zod.object({
    token: zod.string().length(6, 'Code must be 6 digits'),
});
export const Setup2FA = () => {
    const { user, setup2FA, verify2FA, refreshUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState('setup');
    const [setupData, setSetupData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return null;
    }
    if (user?.otpEnabled) {
        navigate(ROUTES.DASHBOARD);
        return null;
    }
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(verify2FASchema),
    });
    const handleSetup = async () => {
        setIsLoading(true);
        try {
            const data = await setup2FA();
            setSetupData(data);
            setStep('verify');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to set up 2FA';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleVerify = async (data) => {
        setIsLoading(true);
        try {
            await verify2FA(data.token);
            await refreshUser();
            showToast({ type: 'success', title: '2FA Enabled', message: 'Two-factor authentication has been enabled successfully' });
            navigate(ROUTES.DASHBOARD);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyBackupCodes = () => {
        if (setupData) {
            navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
            showToast({ type: 'success', title: 'Copied', message: 'Backup codes copied to clipboard' });
        }
    };
    if (step === 'setup') {
        return (_jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-6", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-10 h-10 text-chase-600", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: "Chase" })] }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Set Up Two-Factor Authentication" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Add an extra layer of security to your account" })] }), _jsx("div", { className: "card p-8", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("svg", { className: "w-6 h-6 text-blue-600 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-800", children: "What is 2FA?" }), _jsx("p", { className: "text-sm text-blue-700", children: "Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password." })] })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "1. Install an authenticator app" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-2 list-disc list-inside", children: [_jsx("li", { children: "Google Authenticator" }), _jsx("li", { children: "Authy" }), _jsx("li", { children: "Microsoft Authenticator" }), _jsx("li", { children: "1Password" })] }), _jsxs(Button, { className: "w-full", size: "lg", onClick: handleSetup, isLoading: isLoading, children: [isLoading ? _jsx(Loader2, { className: "w-5 h-5 mr-2" }) : null, "Continue to QR Code"] })] })] }) })] }));
    }
    return (_jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-6", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-10 h-10 text-chase-600", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: "Chase" })] }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Scan QR Code" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Open your authenticator app and scan the code below" })] }), _jsx("div", { className: "card p-8", children: _jsxs("form", { onSubmit: handleSubmit(handleVerify), className: "space-y-6", noValidate: true, children: [_jsxs("div", { className: "text-center", children: [setupData && (_jsx("div", { className: "inline-block p-4 bg-white border border-gray-200 rounded-lg", children: _jsx("img", { src: setupData.qrCodeUrl, alt: "QR Code for 2FA setup", className: "w-48 h-48" }) })), _jsx("p", { className: "mt-4 text-sm text-gray-500", children: "Can't scan? Enter this key manually:" }), setupData && (_jsxs("div", { className: "mt-2 flex items-center gap-2 justify-center", children: [_jsx("code", { className: "px-3 py-1.5 bg-gray-100 rounded font-mono text-sm text-gray-900 tracking-wider", children: setupData.secret }), _jsx("button", { type: "button", onClick: () => navigator.clipboard.writeText(setupData.secret), className: "p-1.5 text-gray-400 hover:text-gray-600", "aria-label": "Copy secret key", children: _jsx(Copy, { className: "w-4 h-4" }) })] }))] }), _jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("svg", { className: "w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-yellow-800", children: "Save your backup codes" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Store these codes in a safe place. Each code can be used once if you lose access to your authenticator app." })] })] }), setupData && (_jsxs("div", { className: "mt-4", children: [_jsxs("button", { type: "button", onClick: () => setShowBackupCodes(!showBackupCodes), className: "text-sm text-yellow-700 hover:text-yellow-800 font-medium flex items-center gap-1", children: [showBackupCodes ? 'Hide' : 'Show', " backup codes", _jsx("svg", { className: `w-4 h-4 transition-transform ${showBackupCodes ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), showBackupCodes && (_jsx("div", { className: "mt-3 grid grid-cols-2 gap-2", children: setupData.backupCodes.map((code, index) => (_jsx("code", { className: "px-2 py-1 bg-white border border-gray-200 rounded font-mono text-sm text-gray-900", children: code }, index))) })), showBackupCodes && (_jsxs("button", { type: "button", onClick: copyBackupCodes, className: "mt-3 text-sm text-chase-600 hover:text-chase-700 font-medium flex items-center gap-1", children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy all codes"] }))] }))] }), _jsx("div", { children: _jsx(Input, { ...register('token'), label: "Enter 6-digit code from your app", placeholder: "000000", type: "text", autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6, error: errors.token?.message, disabled: isLoading }) }), _jsxs(Button, { type: "submit", className: "w-full", size: "lg", isLoading: isLoading, children: [isLoading ? _jsx(Loader2, { className: "w-5 h-5 mr-2" }) : null, "Enable 2FA"] })] }) })] }));
};
