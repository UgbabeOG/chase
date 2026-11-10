import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAccounts, useTransactions } from '../../hooks';
import { BalanceSummary } from '../../components/data-display';
import { AccountCard } from '../../components/data-display';
import { TransactionRow } from '../../components/data-display';
import { Button, SkeletonCard } from '../../components/ui';
import { ROUTES } from '../../utils/constants';
import { useState } from 'react';
export const Dashboard = () => {
    const { accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useAccounts();
    const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
    const [showBalances, setShowBalances] = useState(true);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
    const checkingBalance = accounts.filter((a) => a.accountType === 'checking').reduce((sum, acc) => sum + acc.balance, 0);
    const savingsBalance = accounts.filter((a) => a.accountType === 'savings').reduce((sum, acc) => sum + acc.balance, 0);
    const handleCopyAccount = (accountNumber) => {
        navigator.clipboard.writeText(accountNumber);
    };
    if (accountsLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(SkeletonCard, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(SkeletonCard, {}), _jsx(SkeletonCard, {}), _jsx(SkeletonCard, {})] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Recent Transactions" }) }), [...Array(5)].map((_, i) => (_jsx("div", { className: "p-4 border-b border-gray-100 animate-pulse", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 w-3/4 bg-gray-200 rounded" }), _jsx("div", { className: "h-3 w-1/2 bg-gray-200 rounded mt-1" })] })] }) }, i)))] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Welcome back! Here's an overview of your accounts." })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => refetchAccounts(), children: "Refresh" }), _jsx(Link, { to: ROUTES.TRANSFER, children: _jsx(Button, { size: "sm", leftIcon: _jsx(Plus, { className: "w-4 h-4" }), children: "Transfer" }) })] })] }), _jsx(BalanceSummary, { totalBalance: totalBalance, totalAvailable: totalAvailable, checkingBalance: checkingBalance, savingsBalance: savingsBalance }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: accounts.map((account) => (_jsx(AccountCard, { account: account, onClick: () => { }, showActions: true }, account.id))) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Recent Transactions" }), _jsx("p", { className: "text-sm text-gray-500", children: "Your latest account activity" })] }), _jsx(Link, { to: ROUTES.TRANSACTIONS, className: "text-sm font-medium text-chase-600 hover:text-chase-700", children: "View all" })] }), transactions.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No transactions yet" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Your recent transactions will appear here" })] })) : (_jsx("div", { className: "divide-y divide-gray-100", children: transactions.map((transaction) => (_jsx(TransactionRow, { transaction: transaction, onClick: () => { } }, transaction.id))) }))] })] }));
};
