import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Search, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useAdminUsers } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select } from '../../components/ui';
import { formatRelativeTime } from '../../utils';
import { useToast } from '../../store/ToastContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
const createUserSchema = zod.object({
    username: zod.string().min(3, 'Username must be at least 3 characters').max(50),
    email: zod.string().email('Invalid email address'),
    password: zod.string().min(8, 'Password must be at least 8 characters').max(100),
    firstName: zod.string().min(1, 'First name is required').max(50),
    lastName: zod.string().min(1, 'Last name is required').max(50),
    phone: zod.string().max(20).optional(),
    role: zod.enum(['user', 'admin']).optional(),
});
const updateUserSchema = zod.object({
    email: zod.string().email('Invalid email address').optional(),
    firstName: zod.string().min(1).max(50).optional(),
    lastName: zod.string().min(1).max(50).optional(),
    phone: zod.string().max(20).optional(),
    role: zod.enum(['user', 'admin']).optional(),
    isActive: zod.boolean().optional(),
});
export const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const { users, pagination, isLoading, refetch } = useAdminUsers({
        page,
        limit: 10,
        search,
        role: roleFilter || undefined,
    });
    const { showToast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [twoFactorUser, setTwoFactorUser] = useState(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [isTwoFactorSaving, setIsTwoFactorSaving] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');
    const [isPolicyLoading, setIsPolicyLoading] = useState(true);
    const [isPolicySaving, setIsPolicySaving] = useState(false);
    useEffect(() => {
        let active = true;
        api.getTransactionPolicy()
            .then((policy) => {
            if (active)
                setBlockedMessage(policy.blockedMessage);
        })
            .catch((err) => {
            const message = err instanceof Error ? err.message : 'Failed to load transaction settings';
            showToast({ type: 'error', title: 'Error', message });
        })
            .finally(() => {
            if (active)
                setIsPolicyLoading(false);
        });
        return () => {
            active = false;
        };
    }, [showToast]);
    const { register: createRegister, handleSubmit: createHandleSubmit, reset: createReset, control: createControl, formState: { errors: createErrors }, } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: 'user' },
    });
    const { register: updateRegister, handleSubmit: updateHandleSubmit, reset: updateReset, setValue: updateSetValue, control: updateControl, formState: { errors: updateErrors }, } = useForm({
        resolver: zodResolver(updateUserSchema),
    });
    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };
    const handleRoleFilter = (e) => {
        setRoleFilter(e.target.value);
        setPage(1);
    };
    const handleCreate = async (data) => {
        setIsSubmitting(true);
        try {
            await api.createUser(data);
            showToast({ type: 'success', title: 'User Created', message: `${data.username} has been created successfully` });
            createReset();
            setIsCreateOpen(false);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create user';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleUpdate = async (data) => {
        if (!editingUser)
            return;
        setIsSubmitting(true);
        try {
            await api.updateUser(editingUser.id, data);
            showToast({ type: 'success', title: 'User Updated', message: 'User has been updated successfully' });
            setEditingUser(null);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update user';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!deletingUser)
            return;
        setIsSubmitting(true);
        try {
            await api.deleteUser(deletingUser.id);
            showToast({ type: 'success', title: 'User Deleted', message: 'User has been deleted successfully' });
            setDeletingUser(null);
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete user';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleToggleTransactions = useCallback(async (targetUser) => {
        setIsSubmitting(true);
        try {
            await api.updateUser(targetUser.id, { transactionsBlocked: !targetUser.transactionsBlocked });
            showToast({
                type: 'success',
                title: targetUser.transactionsBlocked ? 'Transactions Allowed' : 'Transactions Blocked',
                message: `Transaction access updated for ${targetUser.username}`,
            });
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update transaction access';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [refetch, showToast, users]);
    const handleSaveTwoFactor = async (event) => {
        event.preventDefault();
        if (!twoFactorUser)
            return;
        setIsTwoFactorSaving(true);
        try {
            const secret = twoFactorSecret.replace(/\s/g, '').toUpperCase();
            await api.updateUserTwoFactor(twoFactorUser.id, {
                enabled: twoFactorEnabled,
                ...(secret ? { secret } : {}),
            });
            showToast({
                type: 'success',
                title: '2FA Updated',
                message: `Two-factor authentication ${twoFactorEnabled ? 'enabled' : 'disabled'} for ${twoFactorUser.username}.`,
            });
            setTwoFactorUser(null);
            setTwoFactorSecret('');
            refetch();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update two-factor authentication';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsTwoFactorSaving(false);
        }
    };
    const handleSavePolicy = async (event) => {
        event.preventDefault();
        setIsPolicySaving(true);
        try {
            const policy = await api.updateTransactionPolicy({ blockedMessage: blockedMessage.trim() });
            setBlockedMessage(policy.blockedMessage);
            showToast({ type: 'success', title: 'Settings Saved', message: 'Transaction restriction message updated.' });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update transaction settings';
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsPolicySaving(false);
        }
    };
    const columns = useMemo(() => [
        {
            key: 'username',
            header: 'Username',
            render: (row) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: row.username }), _jsxs("p", { className: "text-xs text-gray-500", children: [row.firstName, " ", row.lastName] })] })),
        },
        {
            key: 'email',
            header: 'Email',
            render: (row) => (_jsx("p", { className: "text-sm text-gray-900", children: row.email })),
        },
        {
            key: 'role',
            header: 'Role',
            render: (row) => (_jsx(Badge, { variant: row.role === 'admin' ? 'warning' : 'gray', size: "sm", children: row.role.charAt(0).toUpperCase() + row.role.slice(1) })),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (_jsx(Badge, { variant: row.isActive ? 'success' : 'error', size: "sm", children: row.isActive ? 'Active' : 'Inactive' })),
        },
        {
            key: 'otp',
            header: '2FA',
            render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: row.otpEnabled ? 'success' : 'gray', size: "sm", children: row.otpEnabled ? 'Enabled' : 'Disabled' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                            setTwoFactorUser(row);
                            setTwoFactorEnabled(row.otpEnabled);
                            setTwoFactorSecret('');
                        }, disabled: isTwoFactorSaving, "aria-label": `Manage 2FA for ${row.username}`, children: _jsx(Shield, { className: "w-4 h-4" }) })] })),
        },
        {
            key: 'lastLogin',
            header: 'Last Login',
            render: (row) => (_jsx("p", { className: "text-sm text-gray-500", children: row.lastLogin ? formatRelativeTime(row.lastLogin) : 'Never' })),
        },
        {
            key: 'transactionAccess',
            header: 'Transaction Access',
            render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: row.transactionsBlocked ? 'error' : 'success', size: "sm", children: row.transactionsBlocked ? 'Blocked' : 'Allowed' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleToggleTransactions(row), disabled: isSubmitting, "aria-label": `${row.transactionsBlocked ? 'Allow' : 'Block'} transactions for ${row.username}`, children: row.transactionsBlocked ? 'Allow' : 'Block' })] })),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingUser(row), disabled: isSubmitting, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeletingUser(row), disabled: isSubmitting, children: _jsx(Trash2, { className: "w-4 h-4 text-red-600" }) })] })),
        },
    ], [handleToggleTransactions, isSubmitting, isTwoFactorSaving]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "User Management" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage users, roles, and transaction access" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx(Link, { to: ROUTES.ADMIN_TRANSACTIONS, children: _jsx(Button, { variant: "secondary", className: "w-full", children: "Manage Transactions" }) }), _jsx(Button, { onClick: () => setIsCreateOpen(true), leftIcon: _jsx(Plus, { className: "w-4 h-4" }), children: "Add User" })] })] }), _jsxs("form", { onSubmit: handleSavePolicy, className: "card p-4 sm:p-6 space-y-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Transaction restriction message" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Users with blocked transaction access will see this message when a transfer is denied." })] }), _jsx("label", { htmlFor: "blocked-message", className: "label", children: "Fallback message" }), _jsx("textarea", { id: "blocked-message", value: blockedMessage, onChange: (event) => setBlockedMessage(event.target.value), maxLength: 500, rows: 3, className: "input resize-y", disabled: isPolicyLoading || isPolicySaving, required: true }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsxs("p", { className: "text-xs text-gray-500", children: [blockedMessage.length, "/500 characters"] }), _jsx(Button, { type: "submit", isLoading: isPolicySaving, disabled: isPolicyLoading || !blockedMessage.trim(), children: "Save Message" })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search users...", value: search, onChange: handleSearch, className: "input pl-10" })] }), _jsx(Select, { value: roleFilter, onChange: handleRoleFilter, options: [
                                        { value: '', label: 'All Roles' },
                                        { value: 'user', label: 'User' },
                                        { value: 'admin', label: 'Admin' },
                                    ], className: "w-40" })] }) }), _jsx(Table, { columns: columns, data: users, keyExtractor: (row) => row.id.toString(), isLoading: isLoading, emptyMessage: "No users found", hoverable: true }), pagination.totalPages > 1 && (_jsx(Pagination, { currentPage: page, totalPages: pagination.totalPages, onPageChange: setPage }))] }), _jsx(Modal, { isOpen: isCreateOpen, onClose: () => setIsCreateOpen(false), title: "Create New User", size: "lg", children: _jsxs("form", { onSubmit: createHandleSubmit(handleCreate), className: "space-y-4", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...createRegister('username'), label: "Username", placeholder: "johndoe", error: createErrors.username?.message, disabled: isSubmitting }), _jsx(Input, { ...createRegister('email'), label: "Email", placeholder: "john@example.com", type: "email", error: createErrors.email?.message, disabled: isSubmitting })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...createRegister('firstName'), label: "First Name", placeholder: "John", error: createErrors.firstName?.message, disabled: isSubmitting }), _jsx(Input, { ...createRegister('lastName'), label: "Last Name", placeholder: "Doe", error: createErrors.lastName?.message, disabled: isSubmitting })] }), _jsx(Input, { ...createRegister('phone'), label: "Phone (Optional)", placeholder: "555-0123", disabled: isSubmitting }), _jsx(Input, { ...createRegister('password'), label: "Password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", type: "password", error: createErrors.password?.message, disabled: isSubmitting, helperText: "Minimum 8 characters" }), _jsx(Controller, { control: createControl, name: "role", render: ({ field }) => (_jsx(Select, { ref: field.ref, label: "Role", value: field.value || 'user', onChange: (event) => field.onChange(event.target.value), onBlur: field.onBlur, options: USER_ROLES.map((role) => ({ value: role.value, label: role.label })), disabled: isSubmitting })) }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setIsCreateOpen(false), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Create User" })] })] }) }), _jsx(Modal, { isOpen: !!editingUser, onClose: () => setEditingUser(null), title: "Edit User", size: "lg", children: editingUser && (_jsxs("form", { onSubmit: updateHandleSubmit(handleUpdate), className: "space-y-4", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...updateRegister('email'), label: "Email", defaultValue: editingUser.email, disabled: isSubmitting }), _jsx(Input, { ...updateRegister('phone'), label: "Phone", defaultValue: editingUser.phone || '', disabled: isSubmitting })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...updateRegister('firstName'), label: "First Name", defaultValue: editingUser.firstName, disabled: isSubmitting }), _jsx(Input, { ...updateRegister('lastName'), label: "Last Name", defaultValue: editingUser.lastName, disabled: isSubmitting })] }), _jsx(Controller, { control: updateControl, name: "role", defaultValue: editingUser.role, render: ({ field }) => (_jsx(Select, { ref: field.ref, label: "Role", value: field.value || editingUser.role, onChange: (event) => field.onChange(event.target.value), onBlur: field.onBlur, options: USER_ROLES.map((role) => ({ value: role.value, label: role.label })), disabled: isSubmitting })) }), _jsx(Controller, { control: updateControl, name: "isActive", defaultValue: editingUser.isActive, render: ({ field }) => (_jsx(Select, { ref: field.ref, label: "Status", value: field.value === false ? 'false' : 'true', onChange: (event) => field.onChange(event.target.value === 'true'), onBlur: field.onBlur, options: [
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' },
                                ], disabled: isSubmitting })) }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setEditingUser(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Save Changes" })] })] })) }), _jsx(Modal, { isOpen: !!deletingUser, onClose: () => setDeletingUser(null), title: "Delete User", size: "sm", children: deletingUser && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-600", children: ["Are you sure you want to delete ", _jsx("strong", { children: deletingUser.username }), " (", deletingUser.firstName, " ", deletingUser.lastName, ")? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setDeletingUser(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, isLoading: isSubmitting, children: "Delete User" })] })] })) }), _jsx(Modal, { isOpen: !!twoFactorUser, onClose: () => {
                    setTwoFactorUser(null);
                    setTwoFactorSecret('');
                }, title: "Manage Two-Factor Authentication", description: twoFactorUser ? `Configure OTP for ${twoFactorUser.username}.` : undefined, size: "md", children: twoFactorUser && (_jsxs("form", { onSubmit: handleSaveTwoFactor, className: "space-y-5", children: [_jsxs("label", { className: "flex items-start gap-3 rounded-lg bg-gray-50 p-4", children: [_jsx("input", { type: "checkbox", checked: twoFactorEnabled, onChange: (event) => setTwoFactorEnabled(event.target.checked), disabled: isTwoFactorSaving, className: "mt-1 h-4 w-4 rounded border-gray-300 text-chase-600 focus:ring-chase-500" }), _jsxs("span", { children: [_jsx("span", { className: "block text-sm font-medium text-gray-900", children: "Require OTP at sign in" }), _jsx("span", { className: "mt-1 block text-sm text-gray-600", children: "When enabled, this user must provide a valid authenticator code after entering their password." })] })] }), _jsx(Input, { label: "Authenticator secret (Base32)", value: twoFactorSecret, onChange: (event) => setTwoFactorSecret(event.target.value.toUpperCase()), placeholder: "Leave blank to keep the current secret", autoComplete: "off", autoCapitalize: "characters", spellCheck: false, maxLength: 64, disabled: isTwoFactorSaving, helperText: "Enter 16-64 Base32 characters (A-Z, 2-7) to set or replace the secret. Disabling 2FA with this field blank clears the saved secret. The secret is not displayed again after saving." }), _jsxs("div", { className: "flex justify-end gap-3 border-t border-gray-200 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                        setTwoFactorUser(null);
                                        setTwoFactorSecret('');
                                    }, disabled: isTwoFactorSaving, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isTwoFactorSaving, children: "Save 2FA Settings" })] })] })) })] }));
};
