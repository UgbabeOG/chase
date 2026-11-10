import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui';
import { ROUTES } from '../utils/constants';
export const NotFound = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-9xl font-bold text-gray-200", children: "404" }), _jsx("h2", { className: "mt-4 text-2xl font-bold text-gray-900", children: "Page Not Found" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Sorry, we couldn't find the page you're looking for." }), _jsxs("div", { className: "mt-8 flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsx(Link, { to: ROUTES.DASHBOARD, children: _jsx(Button, { leftIcon: _jsx(Home, { className: "w-4 h-4" }), children: "Go to Dashboard" }) }), _jsx(Link, { to: ROUTES.DASHBOARD, children: _jsx(Button, { variant: "secondary", leftIcon: _jsx(Search, { className: "w-4 h-4" }), children: "Browse Accounts" }) })] })] }) }));
};
