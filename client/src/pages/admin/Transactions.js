import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminUsers, useAdminTransactions } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select } from '../../components/ui';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils';
import { useToast } from '../../store/ToastContext';
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES, TRANSACTION_STATUSES } from '../../utils/constants';
import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const createTransactionSchema = zod.object({
    accountId: zod.number().int().positive(),
    type: zod.enum(['debit', 'credit', 'transfer_in', 'transfer_out']),
    category: zod.string().max(50).optional(),
    description: zod.string().min(1, 'Description is required').max(255),
    amount: zod.number(),
    status: zod.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    counterpartyAccountId: zod.number().int().positive().optional(),
    metadata: zod.record(zod.unknown()).optional(),
});
export const AdminTransactions = () => {
    const { users } = useAdminUsers({ limit: 1000 });
    const { transactions, pagination, isLoading, refetch } = useAdminTransactions();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc',
    });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register: createRegister, handleSubmit: createHandleSubmit, reset: createReset, watch: createWatch, setValue: createSetValue, formState: { errors: createErrors }, } = useForm({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: { type: 'debit', status: 'completed' },
    });
    const { register: updateRegister, handleSubmit: updateHandleSubmit, reset: updateReset, formState: { errors: updateErrors }, } = useForm({
        resolver: zodResolver(createTransactionSchema.partial()),
    });
    const watchedType = createWatch('type');
    const watchedAccountId = createWatch('accountId');
    const handleCreate = async (data) => {
        setIsSubmitting(true);
        try {
            // Find user for the account
            const userId = users.find((u) => u.id === data.accountId)?.id || 1;
            await api.createTransaction(userId, data);
            showToast({ type: 'success', title: 'Transaction Created', message: 'Transaction has been created successfully' });
            createReset();
            setIsCreateOpen(false);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create transaction';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleUpdate = async (data) => {
        if (!editingTransaction)
            return;
        setIsSubmitting(true);
        try {
            await api.updateTransaction(editingTransaction.id, data);
            showToast({ type: 'success', title: 'Transaction Updated', message: 'Transaction has been updated successfully' });
            setEditingTransaction(null);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update transaction';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!deletingTransaction)
            return;
        setIsSubmitting(true);
        try {
            await api.deleteTransaction(deletingTransaction.id);
            showToast({ type: 'success', title: 'Transaction Deleted', message: 'Transaction has been deleted successfully' });
            setDeletingTransaction(null);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete transaction';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const columns = useMemo(() => [
        {
            key: 'date',
            header: 'Date',
            render: (row) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: formatDate(row.createdAt) }), _jsx("p", { className: "text-xs text-gray-500", children: formatRelativeTime(row.createdAt) })] })),
        },
        {
            key: 'user',
            header: 'User',
            render: (row) => (_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [row.firstName, " ", row.lastName] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["@", row.username] })] })),
        },
        {
            key: 'account',
            header: 'Account',
            render: (row) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: row.accountNickname || row.accountType }), _jsxs("p", { className: "text-xs text-gray-500 font-mono", children: ["\u2022\u2022\u2022\u2022", row.accountNickname ? '' : '****'] })] })),
        },
        {
            key: 'type',
            header: 'Type',
            render: (row) => {
                const typeLabels = {
                    credit: 'Deposit',
                    debit: 'Withdrawal',
                    transfer_in: 'Transfer In',
                    transfer_out: 'Transfer Out',
                };
                const typeColors = {
                    credit: 'success',
                    debit: 'error',
                    transfer_in: 'info',
                    transfer_out: 'warning',
                };
                return (_jsx(Badge, { variant: typeColors[row.type] || 'gray', size: "sm", children: typeLabels[row.type] || row.type }));
            },
        },
        {
            key: 'category',
            header: 'Category',
            render: (row) => (_jsx("p", { className: "text-sm text-gray-500", children: row.category || '-' })),
        },
        {
            key: 'description',
            header: 'Description',
            render: (row) => (_jsx("p", { className: "text-sm text-gray-900 max-w-xs truncate", title: row.description, children: row.description })),
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
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingTransaction(row), disabled: isSubmitting, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeletingTransaction(row), disabled: isSubmitting, children: _jsx(Trash2, { className: "w-4 h-4 text-red-600" }) })] })),
        },
    ], [transactions, isSubmitting]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Transaction Management" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "View, create, and manage all transactions" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => refetch(), children: "Refresh" }), _jsx(Button, { onClick: () => setIsCreateOpen(true), leftIcon: _jsx(Plus, { className: "w-4 h-4" }), children: "Add Transaction" })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search description...", value: search, onChange: (e) => setSearch(e.target.value), className: "input pl-10" })] }), _jsx(Select, { value: typeFilter, onChange: (value) => setTypeFilter(value), options: [
                                        { value: '', label: 'All Types' },
                                        ...TRANSACTION_TYPES,
                                    ], className: "w-40" }), _jsx(Select, { value: statusFilter, onChange: (value) => setStatusFilter(value), options: [
                                        { value: '', label: 'All Statuses' },
                                        ...TRANSACTION_STATUSES,
                                    ], className: "w-40" }), _jsx(Select, { value: userFilter, onChange: (value) => setUserFilter(value), options: [
                                        { value: '', label: 'All Users' },
                                        ...users.map((u) => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName} (${u.username})` })),
                                    ], className: "w-48" })] }) }), _jsx(Table, { columns: columns, data: transactions, keyExtractor: (row) => row.id.toString(), isLoading: isLoading, emptyMessage: "No transactions found", hoverable: true }), pagination.totalPages > 1 && (_jsx(Pagination, { currentPage: page, totalPages: pagination.totalPages, onPageChange: setPage }))] }), _jsx(Modal, { isOpen: isCreateOpen, onClose: () => setIsCreateOpen(false), title: "Create Transaction", size: "lg", children: _jsxs("form", { onSubmit: createHandleSubmit(handleCreate), className: "space-y-4", noValidate: true, children: [_jsx(Select, { ...createRegister('accountId', { valueAsNumber: true }), label: "Account", options: users.flatMap((u) => u.id // This would need accounts from the user
                            ).map((acc) => ({ value: acc.id.toString(), label: `${acc.nickname || acc.accountType} ••••${acc.accountNumber.slice(-4)}` })), disabled: isSubmitting }), _jsx(Select, { ...createRegister('type'), label: "Type", options: TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label })), disabled: isSubmitting }), _jsx(Select, { ...createRegister('category'), label: "Category (Optional)", options: TRANSACTION_CATEGORIES.map((c) => ({ value: c, label: c })), disabled: isSubmitting }), _jsx(Input, { ...createRegister('description'), label: "Description", placeholder: "Transaction description", disabled: isSubmitting }), _jsx(Input, { ...createRegister('amount', { valueAsNumber: true }), label: "Amount", type: "number", step: "0.01", placeholder: "0.00", disabled: isSubmitting }), _jsx(Select, { ...createRegister('status'), label: "Status", options: TRANSACTION_STATUSES.map((s) => ({ value: s.value, label: s.label })), disabled: isSubmitting }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setIsCreateOpen(false), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Create Transaction" })] })] }) }), _jsx(Modal, { isOpen: !!editingTransaction, onClose: () => setEditingTransaction(null), title: "Edit Transaction", size: "lg", children: editingTransaction && (_jsxs("form", { onSubmit: updateHandleSubmit(handleUpdate), className: "space-y-4", noValidate: true, children: [_jsx(Input, { ...updateRegister('description'), label: "Description", defaultValue: editingTransaction.description, disabled: isSubmitting }), _jsx(Input, { ...updateRegister('amount', { valueAsNumber: true }), label: "Amount", type: "number", step: "0.01", defaultValue: editingTransaction.amount, disabled: isSubmitting }), _jsx(Select, { ...updateRegister('status'), label: "Status", options: TRANSACTION_STATUSES.map((s) => ({ value: s.value, label: s.label })), defaultValue: editingTransaction.status, disabled: isSubmitting }), _jsx(Select, { ...updateRegister('category'), label: "Category", options: TRANSACTION_CATEGORIES.map((c) => ({ value: c, label: c })), defaultValue: editingTransaction.category || '', disabled: isSubmitting }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setEditingTransaction(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Save Changes" })] })] })) }), _jsx(Modal, { isOpen: !!deletingTransaction, onClose: () => setDeletingTransaction(null), title: "Delete Transaction", size: "sm", children: deletingTransaction && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-600", children: ["Are you sure you want to delete this transaction?", _jsx("br", {}), _jsx("strong", { className: "text-gray-900", children: deletingTransaction.description }), "(", formatCurrency(Math.abs(deletingTransaction.amount)), ")"] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setDeletingTransaction(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, isLoading: isSubmitting, children: "Delete Transaction" })] })] })) })] }));
};
