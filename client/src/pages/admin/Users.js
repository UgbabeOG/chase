import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminUsers } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select } from '../../components/ui';
import { formatRelativeTime } from '../../utils';
import { useToast } from '../../store/ToastContext';
import { USER_ROLES } from '../../utils/constants';
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
    const { users, pagination, isLoading, refetch } = useAdminUsers();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register: createRegister, handleSubmit: createHandleSubmit, reset: createReset, formState: { errors: createErrors }, } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: 'user' },
    });
    const { register: updateRegister, handleSubmit: updateHandleSubmit, reset: updateReset, setValue: updateSetValue, formState: { errors: updateErrors }, } = useForm({
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
            render: (row) => (_jsx(Badge, { variant: row.otpEnabled ? 'success' : 'gray', size: "sm", children: row.otpEnabled ? 'Enabled' : 'Disabled' })),
        },
        {
            key: 'lastLogin',
            header: 'Last Login',
            render: (row) => (_jsx("p", { className: "text-sm text-gray-500", children: row.lastLogin ? formatRelativeTime(row.lastLogin) : 'Never' })),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingUser(row), disabled: isSubmitting, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeletingUser(row), disabled: isSubmitting, children: _jsx(Trash2, { className: "w-4 h-4 text-red-600" }) })] })),
        },
    ], [isSubmitting]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "User Management" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage user accounts and permissions" })] }), _jsx(Button, { onClick: () => setIsCreateOpen(true), leftIcon: _jsx(Plus, { className: "w-4 h-4" }), children: "Add User" })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search users...", value: search, onChange: handleSearch, className: "input pl-10" })] }), _jsx(Select, { value: roleFilter, onChange: (value) => setRoleFilter(value), options: [
                                        { value: '', label: 'All Roles' },
                                        { value: 'user', label: 'User' },
                                        { value: 'admin', label: 'Admin' },
                                    ], className: "w-40" })] }) }), _jsx(Table, { columns: columns, data: users, keyExtractor: (row) => row.id.toString(), isLoading: isLoading, emptyMessage: "No users found", hoverable: true }), pagination.totalPages > 1 && (_jsx(Pagination, { currentPage: page, totalPages: pagination.totalPages, onPageChange: setPage }))] }), _jsx(Modal, { isOpen: isCreateOpen, onClose: () => setIsCreateOpen(false), title: "Create New User", size: "lg", children: _jsxs("form", { onSubmit: createHandleSubmit(handleCreate), className: "space-y-4", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...createRegister('username'), label: "Username", placeholder: "johndoe", error: createErrors.username?.message, disabled: isSubmitting }), _jsx(Input, { ...createRegister('email'), label: "Email", placeholder: "john@example.com", type: "email", error: createErrors.email?.message, disabled: isSubmitting })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...createRegister('firstName'), label: "First Name", placeholder: "John", error: createErrors.firstName?.message, disabled: isSubmitting }), _jsx(Input, { ...createRegister('lastName'), label: "Last Name", placeholder: "Doe", error: createErrors.lastName?.message, disabled: isSubmitting })] }), _jsx(Input, { ...createRegister('phone'), label: "Phone (Optional)", placeholder: "555-0123", disabled: isSubmitting }), _jsx(Input, { ...createRegister('password'), label: "Password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", type: "password", error: createErrors.password?.message, disabled: isSubmitting, helperText: "Minimum 8 characters" }), _jsx(Select, { ...createRegister('role'), label: "Role", options: USER_ROLES.map((r) => ({ value: r.value, label: r.label })), disabled: isSubmitting }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setIsCreateOpen(false), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Create User" })] })] }) }), _jsx(Modal, { isOpen: !!editingUser, onClose: () => setEditingUser(null), title: "Edit User", size: "lg", children: editingUser && (_jsxs("form", { onSubmit: updateHandleSubmit(handleUpdate), className: "space-y-4", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...updateRegister('email'), label: "Email", defaultValue: editingUser.email, disabled: isSubmitting }), _jsx(Input, { ...updateRegister('phone'), label: "Phone", defaultValue: editingUser.phone || '', disabled: isSubmitting })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { ...updateRegister('firstName'), label: "First Name", defaultValue: editingUser.firstName, disabled: isSubmitting }), _jsx(Input, { ...updateRegister('lastName'), label: "Last Name", defaultValue: editingUser.lastName, disabled: isSubmitting })] }), _jsx(Select, { ...updateRegister('role'), label: "Role", options: USER_ROLES.map((r) => ({ value: r.value, label: r.label })), defaultValue: editingUser.role, disabled: isSubmitting }), _jsx(Select, { ...updateRegister('isActive'), label: "Status", options: [
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ], defaultValue: editingUser.isActive.toString(), disabled: isSubmitting }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setEditingUser(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: isSubmitting, children: "Save Changes" })] })] })) }), _jsx(Modal, { isOpen: !!deletingUser, onClose: () => setDeletingUser(null), title: "Delete User", size: "sm", children: deletingUser && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-600", children: ["Are you sure you want to delete ", _jsx("strong", { children: deletingUser.username }), " (", deletingUser.firstName, " ", deletingUser.lastName, ")? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setDeletingUser(null), disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, isLoading: isSubmitting, children: "Delete User" })] })] })) })] }));
};
