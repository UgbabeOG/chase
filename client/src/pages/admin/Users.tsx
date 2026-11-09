import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Search, Plus, MoreHorizontal, Edit, Trash2, User, Shield, Eye, Mail, Phone, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAdminUsers, useAdminTransactions } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select, Card, SkeletonCard } from '../../components/ui';
import { formatDate, formatRelativeTime } from '../../utils';
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

type CreateUserFormData = zod.infer<typeof createUserSchema>;

const updateUserSchema = zod.object({
  email: zod.string().email('Invalid email address').optional(),
  firstName: zod.string().min(1).max(50).optional(),
  lastName: zod.string().min(1).max(50).optional(),
  phone: zod.string().max(20).optional(),
  role: zod.enum(['user', 'admin']).optional(),
  isActive: zod.boolean().optional(),
});

type UpdateUserFormData = zod.infer<typeof updateUserSchema>;

export const AdminUsers: React.FC = () => {
  const { users, pagination, isLoading, refetch } = useAdminUsers();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [deletingUser, setDeletingUser] = useState<typeof users[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    formState: { errors: createErrors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' },
  });

  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    setValue: updateSetValue,
    formState: { errors: updateErrors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleCreate = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      await api.createUser(data);
      showToast({ type: 'success', title: 'User Created', message: `${data.username} has been created successfully` });
      createReset();
      setIsCreateOpen(false);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdateUserFormData) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await api.updateUser(editingUser.id, data);
      showToast({ type: 'success', title: 'User Updated', message: 'User has been updated successfully' });
      setEditingUser(null);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await api.deleteUser(deletingUser.id);
      showToast({ type: 'success', title: 'User Deleted', message: 'User has been deleted successfully' });
      setDeletingUser(null);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'username',
        header: 'Username',
        render: (row: typeof users[0]) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.username}</p>
            <p className="text-xs text-gray-500">{row.firstName} {row.lastName}</p>
          </div>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        render: (row: typeof users[0]) => (
          <p className="text-sm text-gray-900">{row.email}</p>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: (row: typeof users[0]) => (
          <Badge variant={row.role === 'admin' ? 'warning' : 'gray'} size="sm">
            {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: typeof users[0]) => (
          <Badge variant={row.isActive ? 'success' : 'error'} size="sm">
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'otp',
        header: '2FA',
        render: (row: typeof users[0]) => (
          <Badge variant={row.otpEnabled ? 'success' : 'gray'} size="sm">
            {row.otpEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        key: 'lastLogin',
        header: 'Last Login',
        render: (row: typeof users[0]) => (
          <p className="text-sm text-gray-500">
            {row.lastLogin ? formatRelativeTime(row.lastLogin) : 'Never'}
          </p>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row: typeof users[0]) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(row)} disabled={isSubmitting}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeletingUser(row)} disabled={isSubmitting}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    [isSubmitting]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add User
        </Button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="input pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
              className="w-40"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={users}
          keyExtractor={(row) => row.id.toString()}
          isLoading={isLoading}
          emptyMessage="No users found"
          hoverable
        />

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User"
        size="lg"
      >
        <form onSubmit={createHandleSubmit(handleCreate)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...createRegister('username')}
              label="Username"
              placeholder="johndoe"
              error={createErrors.username?.message}
              disabled={isSubmitting}
            />
            <Input
              {...createRegister('email')}
              label="Email"
              placeholder="john@example.com"
              type="email"
              error={createErrors.email?.message}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...createRegister('firstName')}
              label="First Name"
              placeholder="John"
              error={createErrors.firstName?.message}
              disabled={isSubmitting}
            />
            <Input
              {...createRegister('lastName')}
              label="Last Name"
              placeholder="Doe"
              error={createErrors.lastName?.message}
              disabled={isSubmitting}
            />
          </div>
          <Input
            {...createRegister('phone')}
            label="Phone (Optional)"
            placeholder="555-0123"
            disabled={isSubmitting}
          />
          <Input
            {...createRegister('password')}
            label="Password"
            placeholder="••••••••"
            type="password"
            error={createErrors.password?.message}
            disabled={isSubmitting}
            helperText="Minimum 8 characters"
          />
          <Select
            {...createRegister('role')}
            label="Role"
            options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))}
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="lg"
      >
        {editingUser && (
          <form onSubmit={updateHandleSubmit(handleUpdate)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...updateRegister('email')}
                label="Email"
                defaultValue={editingUser.email}
                disabled={isSubmitting}
              />
              <Input
                {...updateRegister('phone')}
                label="Phone"
                defaultValue={editingUser.phone || ''}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...updateRegister('firstName')}
                label="First Name"
                defaultValue={editingUser.firstName}
                disabled={isSubmitting}
              />
              <Input
                {...updateRegister('lastName')}
                label="Last Name"
                defaultValue={editingUser.lastName}
                disabled={isSubmitting}
              />
            </div>
            <Select
              {...updateRegister('role')}
              label="Role"
              options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))}
              defaultValue={editingUser.role}
              disabled={isSubmitting}
            />
            <Select
              {...updateRegister('isActive')}
              label="Status"
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              defaultValue={editingUser.isActive.toString()}
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setEditingUser(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete User"
        size="sm"
      >
        {deletingUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{deletingUser.username}</strong> ({deletingUser.firstName} {deletingUser.lastName})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingUser(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};