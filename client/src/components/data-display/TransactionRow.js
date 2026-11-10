import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRight, ArrowDownLeft, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime, getTransactionTypeLabel, getTransactionTypeIcon } from '../../utils';
import { Badge } from '../ui';
export const TransactionRow = ({ transaction, onClick, showAccount = false }) => {
    const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
    const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
    const amountPrefix = isCredit ? '+' : '-';
    const typeIcons = {
        credit: ArrowDown,
        debit: ArrowUp,
        transfer_in: ArrowDownLeft,
        transfer_out: ArrowUpRight,
    };
    const Icon = typeIcons[transaction.type] || ArrowUp;
    return (_jsxs("div", { className: `flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`, onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        } } : undefined, children: [_jsx("div", { className: `p-3 rounded-xl ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`, children: _jsx(Icon, { className: "w-5 h-5", "aria-hidden": "true" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 truncate", children: transaction.description }), _jsxs("span", { className: `text-sm font-semibold ${amountColor} whitespace-nowrap`, children: [amountPrefix, formatCurrency(Math.abs(transaction.amount))] })] }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsx(Badge, { variant: "gray", size: "sm", children: getTransactionTypeLabel(transaction.type) }), transaction.category && (_jsx("span", { className: "text-xs text-gray-500", children: transaction.category })), showAccount && transaction.accountNickname && (_jsx("span", { className: "text-xs text-gray-500", children: transaction.accountNickname })), _jsx("span", { className: "text-xs text-gray-400 ml-auto", children: formatRelativeTime(transaction.createdAt) })] })] }), onClick && (_jsx(ChevronRight, { className: "w-5 h-5 text-gray-300 flex-shrink-0", "aria-hidden": "true" }))] }));
};
export const TransactionTableRow = ({ transaction, onClick }) => {
    const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
    const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
    const amountPrefix = isCredit ? '+' : '-';
    return (_jsxs("tr", { className: `${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`, onClick: onClick, children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`, children: getTransactionTypeIcon(transaction.type) && (_jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [transaction.type === 'credit' && _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 10l7-7m0 0l7 7m-7-7v18" }), transaction.type === 'debit' && _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7v-18" }), transaction.type === 'transfer_in' && _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }), transaction.type === 'transfer_out' && _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" })] })) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: transaction.description }), _jsx("p", { className: "text-xs text-gray-500", children: formatDate(transaction.createdAt) })] })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-500", children: transaction.category || '-' }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: "gray", size: "sm", children: getTransactionTypeLabel(transaction.type) }) }), _jsxs("td", { className: "px-4 py-3 text-sm font-semibold text-right {amountColor}", children: [amountPrefix, formatCurrency(Math.abs(transaction.amount))] }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-500 text-right", children: formatCurrency(transaction.balanceAfter) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-500", children: formatRelativeTime(transaction.createdAt) })] }));
};
