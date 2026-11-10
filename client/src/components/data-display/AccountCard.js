import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CreditCard, MoreHorizontal, Copy, Check } from 'lucide-react';
import { formatCurrency, formatAccountNumber } from '../../utils';
import { Button, Badge } from '../ui';
import { useState } from 'react';
export const AccountCard = ({ account, onClick, showActions = true }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(account.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const isChecking = account.accountType === 'checking';
    return (_jsxs("div", { className: `card-hover p-6 relative ${onClick ? 'cursor-pointer' : ''}`, onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        } } : undefined, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-3 rounded-xl ${isChecking ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`, children: _jsx(CreditCard, { className: "w-6 h-6", "aria-hidden": "true" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: account.nickname || (isChecking ? 'Checking' : 'Savings') }), _jsx("p", { className: "text-sm text-gray-500 font-mono", children: formatAccountNumber(account.accountNumber) })] })] }), showActions && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleCopy, "aria-label": copied ? 'Copied!' : 'Copy account number', children: copied ? _jsx(Check, { className: "w-4 h-4 text-green-500" }) : _jsx(Copy, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "More options", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] }))] }), _jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Available Balance" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-1", children: formatCurrency(account.availableBalance) }), account.balance !== account.availableBalance && (_jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Current balance: ", _jsx("span", { className: "font-medium text-gray-900", children: formatCurrency(account.balance) })] }))] }), _jsxs("div", { className: "mt-6 flex items-center justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Routing: ", _jsx("span", { className: "font-mono font-medium text-gray-900", children: account.routingNumber })] }), _jsx(Badge, { variant: isChecking ? 'info' : 'success', children: isChecking ? 'Checking' : 'Savings' })] })] }));
};
export const AccountCardSkeleton = ({ className = '' }) => (_jsxs("div", { className: `card p-6 animate-pulse ${className}`, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-5 w-3/4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 w-1/2 bg-gray-200 rounded mt-2" })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("div", { className: "h-3 w-2/3 bg-gray-200 rounded" }), _jsx("div", { className: "h-8 w-full bg-gray-200 rounded mt-2" })] }), _jsxs("div", { className: "mt-6 flex justify-between", children: [_jsx("div", { className: "h-4 w-1/3 bg-gray-200 rounded" }), _jsx("div", { className: "h-5 w-20 bg-gray-200 rounded-full" })] })] }));
