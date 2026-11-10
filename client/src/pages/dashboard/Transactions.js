import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useAccounts, useTransactions } from '../../hooks';
import { TransactionTable, TransactionFilters } from '../../components/data-display';
import { Button, Badge, Select } from '../../components/ui';
export const Transactions = () => {
    const { accounts } = useAccounts();
    const [filters, setFilters] = useState({
        accountId: undefined,
        type: undefined,
        startDate: undefined,
        endDate: undefined,
    });
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc',
    });
    const { transactions, pagination, isLoading, refetch } = useTransactions({
        ...filters,
        page,
        limit: 20,
    });
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal)
                return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [transactions, sortConfig]);
    const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined).length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Transactions" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "View and filter your transaction history" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "ghost", size: "sm", leftIcon: _jsx(Download, { className: "w-4 h-4" }), children: "Export" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => refetch(), children: "Refresh" })] })] }), _jsx(TransactionFilters, { filters: filters, onFiltersChange: handleFiltersChange, accounts: accounts, isLoading: isLoading }), activeFiltersCount > 0 && (_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Active filters:" }), filters.accountId && (_jsx(Badge, { variant: "gray", onRemove: () => handleFiltersChange({ ...filters, accountId: undefined }), children: "Account" })), filters.type && (_jsxs(Badge, { variant: "gray", onRemove: () => handleFiltersChange({ ...filters, type: undefined }), children: ["Type: ", filters.type] })), filters.startDate && (_jsxs(Badge, { variant: "gray", onRemove: () => handleFiltersChange({ ...filters, startDate: undefined }), children: ["From: ", filters.startDate] })), filters.endDate && (_jsxs(Badge, { variant: "gray", onRemove: () => handleFiltersChange({ ...filters, endDate: undefined }), children: ["To: ", filters.endDate] })), activeFiltersCount > 0 && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleFiltersChange({ accountId: undefined, type: undefined, startDate: undefined, endDate: undefined }), children: "Clear all" }))] })), _jsx(TransactionTable, { transactions: sortedTransactions, pagination: pagination, onPageChange: setPage, isLoading: isLoading, emptyMessage: "No transactions found matching your filters" }), _jsxs("div", { className: "flex items-center justify-between pt-4", children: [_jsxs("p", { className: "text-sm text-gray-500", children: ["Showing ", ((page - 1) * 20) + 1, " to ", Math.min(page * 20, pagination.total), " of ", pagination.total, " transactions"] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Select, { value: `${sortConfig.key}:${sortConfig.direction}`, onChange: (value) => {
                                const [key, direction] = value.split(':');
                                setSortConfig({ key, direction: direction });
                            }, options: [
                                { value: 'createdAt:desc', label: 'Newest First' },
                                { value: 'createdAt:asc', label: 'Oldest First' },
                                { value: 'amount:desc', label: 'Amount: High to Low' },
                                { value: 'amount:asc', label: 'Amount: Low to High' },
                            ], className: "w-48" }) })] })] }));
};
