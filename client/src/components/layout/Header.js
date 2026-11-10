import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation, NavLink } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown, CreditCard, History, ArrowUpRight, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Avatar, Dropdown } from '../ui';
import { ROUTES } from '../../utils/constants';
export const Header = () => {
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const navigation = [
        { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: 'Accounts', href: ROUTES.ACCOUNTS, icon: CreditCard },
        { name: 'Transactions', href: ROUTES.TRANSACTIONS, icon: History },
        { name: 'Transfer', href: ROUTES.TRANSFER, icon: ArrowUpRight },
    ];
    const adminNavigation = [
        { name: 'Users', href: ROUTES.ADMIN_USERS, icon: User },
        { name: 'Transactions', href: ROUTES.ADMIN_TRANSACTIONS, icon: History },
    ];
    const isAdmin = user?.role === 'admin';
    return (_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-40", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center gap-8", children: [_jsxs(Link, { to: ROUTES.DASHBOARD, className: "flex items-center gap-2", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-8 h-8 text-chase-600", viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-xl font-bold text-gray-900 hidden sm:block", children: "Chase" })] }), _jsxs("nav", { className: "hidden md:flex items-center gap-1", "aria-label": "Main navigation", children: [navigation.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-chase-50 text-chase-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`, children: [_jsx(item.icon, { className: "w-4 h-4", "aria-hidden": "true" }), item.name] }, item.name))), isAdmin && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-px h-6 bg-gray-200 mx-1" }), _jsxs(NavLink, { to: ROUTES.ADMIN_USERS, className: ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`, children: [_jsx(Shield, { className: "w-4 h-4", "aria-hidden": "true" }), "Admin"] })] }))] })] }), _jsx("div", { className: "flex items-center gap-4", children: isAuthenticated && user && (_jsx(Dropdown, { trigger: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { name: user.firstName + ' ' + user.lastName, size: "sm" }), _jsx("span", { className: "hidden sm:block text-sm font-medium text-gray-700", children: user.firstName }), _jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })] }), items: [
                                { label: 'Profile', value: 'profile', icon: _jsx(User, { className: "w-4 h-4" }) },
                                { label: 'Settings', value: 'settings', icon: _jsx(Settings, { className: "w-4 h-4" }) },
                                { label: 'Security', value: 'security', icon: _jsx(Shield, { className: "w-4 h-4" }) },
                                { label: 'Sign out', value: 'logout', icon: _jsx(LogOut, { className: "w-4 h-4" }), danger: true },
                            ], onSelect: (value) => {
                                if (value === 'logout') {
                                    logout();
                                }
                            } })) })] }) }) }));
};
