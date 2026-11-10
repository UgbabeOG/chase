import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Table, Pagination, Badge } from '../ui';
import { formatCurrency, formatDate, formatRelativeTime, getTransactionTypeLabel } from '../../utils';
export const TransactionTable = ({ transactions, pagination, onPageChange, isLoading, onRowClick, emptyMessage, }) => {
    const columns = useMemo(() => [
        {
            key: 'date',
            header: 'Date',
            render: (row) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: formatDate(row.createdAt) }), _jsx("p", { className: "text-xs text-gray-500", children: formatRelativeTime(row.createdAt) })] })),
        },
        {
            key: 'description',
            header: 'Description',
            render: (row) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: row.description }), row.category && _jsx("p", { className: "text-xs text-gray-500", children: row.category })] })),
        },
        {
            key: 'type',
            header: 'Type',
            render: (row) => (_jsx(Badge, { variant: "gray", size: "sm", children: getTransactionTypeLabel(row.type) })),
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'text-right',
            headerClassName: 'text-right',
            render: (row) => {
                const isCredit = row.type === 'credit' || row.type === 'transfer_in';
                return (_jsxs("span", { className: `text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`, children: [isCredit ? '+' : '-', formatCurrency(Math.abs(row.amount))] }));
            },
        },
        {
            key: 'balance',
            header: 'Balance',
            className: 'text-right',
            headerClassName: 'text-right',
            render: (row) => (_jsx("span", { className: "text-sm font-mono text-gray-900", children: formatCurrency(row.balanceAfter) })),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => {
                const statusColors = {
                    completed: 'success',
                    pending: 'warning',
                    failed: 'error',
                    cancelled: 'gray',
                };
                return _jsx(Badge, { variant: statusColors[row.status] || 'gray', size: "sm", children: row.status });
            },
        },
    ], []);
    return (_jsxs("div", { className: "card overflow-hidden", children: [_jsx(Table, { columns: columns, data: transactions, keyExtractor: (row) => row.id.toString(), isLoading: isLoading, emptyMessage: emptyMessage || 'No transactions found', hoverable: true, onRowClick: onRowClick }), pagination.totalPages > 1 && (_jsx(Pagination, { currentPage: pagination.page, totalPages: pagination.totalPages, onPageChange: onPageChange }))] }));
};
export const TransactionFilters = ({ filters, onFiltersChange, accounts, isLoading, }) => {
    const accountOptions = accounts.map((acc) => ({
        value: acc.id.toString(),
        label: `${acc.nickname || acc.accountType} ••••${acc.accountNumber.slice(-4)}`,
    }));
    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'credit', label: 'Deposits' },
        { value: 'debit', label: 'Withdrawals' },
        { value: 'transfer_in', label: 'Transfers In' },
        { value: 'transfer_out', label: 'Transfers Out' },
    ];
    return (_jsx("div", { className: "card p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "account-filter", className: "label", children: "Account" }), _jsxs("select", { id: "account-filter", value: filters.accountId?.toString() || '', onChange: (e) => onFiltersChange({ ...filters, accountId: e.target.value ? parseInt(e.target.value) : undefined }), disabled: isLoading, className: "input", children: [_jsx("option", { value: "", children: "All Accounts" }), accountOptions.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "type-filter", className: "label", children: "Type" }), _jsx("select", { id: "type-filter", value: filters.type || '', onChange: (e) => onFiltersChange({ ...filters, type: e.target.value || undefined }), disabled: isLoading, className: "input", children: typeOptions.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "start-date", className: "label", children: "From" }), _jsx("input", { id: "start-date", type: "date", value: filters.startDate || '', onChange: (e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined }), disabled: isLoading, className: "input", max: new Date().toISOString().split('T')[0] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "end-date", className: "label", children: "To" }), _jsx("input", { id: "end-date", type: "date", value: filters.endDate || '', onChange: (e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined }), disabled: isLoading, className: "input", max: new Date().toISOString().split('T')[0] })] })] }) }));
};
