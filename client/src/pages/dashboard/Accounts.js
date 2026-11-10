import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAccounts, useTransactions } from '../../hooks';
import { AccountCard } from '../../components/data-display';
import { BalanceDisplay } from '../../components/data-display';
import { TransactionRow } from '../../components/data-display';
import { Button, SkeletonCard } from '../../components/ui';
import { ROUTES } from '../../utils/constants';
import { useState } from 'react';
export const Accounts = () => {
    const { accounts, isLoading, refetch } = useAccounts();
    const [showBalances, setShowBalances] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const handleViewTransactions = (accountId) => {
        setSelectedAccount(accountId);
        setShowTransactions(true);
    };
    const handleCloseTransactions = () => {
        setSelectedAccount(null);
        setShowTransactions(false);
    };
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: _jsx(SkeletonCard, { className: "w-64" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(3)].map((_, i) => (_jsx(SkeletonCard, {}, i))) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Accounts" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "View and manage your accounts" })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => refetch(), children: "Refresh" }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: accounts.map((account) => (_jsx(AccountCard, { account: account, onClick: () => handleViewTransactions(account.id), showActions: true }, account.id))) }), showTransactions && selectedAccount && (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", role: "dialog", "aria-modal": "true", children: [_jsx("div", { className: "fixed inset-0 bg-black/50", onClick: handleCloseTransactions, "aria-hidden": "true" }), _jsxs("div", { className: "fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl animate-in slide-in-from-right", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Account Details" }), _jsx("p", { className: "text-sm text-gray-500", children: "Recent transactions" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleCloseTransactions, children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "p-4 border-b border-gray-200 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(BalanceDisplay, { balance: accounts.find((a) => a.id === selectedAccount)?.balance || 0, availableBalance: accounts.find((a) => a.id === selectedAccount)?.availableBalance, label: "Available Balance", showToggle: true }), _jsx(Link, { to: ROUTES.TRANSFER, className: "text-sm font-medium text-chase-600 hover:text-chase-700", children: "Transfer" })] }) }), _jsx("div", { className: "p-4 max-h-[60vh] overflow-y-auto", children: _jsx(AccountTransactions, { accountId: selectedAccount, onClose: handleCloseTransactions }) })] })] }))] }));
};
const AccountTransactions = ({ accountId, onClose }) => {
    const { transactions, isLoading, pagination, refetch } = useTransactions({ accountId, limit: 20 });
    const [page, setPage] = useState(1);
    if (isLoading) {
        return (_jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "p-4 animate-pulse", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 w-3/4 bg-gray-200 rounded" }), _jsx("div", { className: "h-3 w-1/2 bg-gray-200 rounded mt-1" })] })] }) }, i))) }));
    }
    if (transactions.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No transactions" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "This account has no recent activity" })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [transactions.map((transaction) => (_jsx(TransactionRow, { transaction: transaction }, transaction.id))), pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200", children: [_jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, className: "p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg", children: "Previous" }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Page ", page, " of ", pagination.totalPages] }), _jsx("button", { onClick: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), disabled: page === pagination.totalPages, className: "p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg", children: "Next" })] }))] }));
};
