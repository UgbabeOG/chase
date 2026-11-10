import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Search, Plus, MoreHorizontal, Edit, Trash2, User, Shield, Eye, Mail, Phone, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAdminUsers } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select, Card, SkeletonCard } from '../../components/ui';
import { formatDate, formatRelativeTime } from '../../utils';
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
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [deletingUser, setDeletingUser] = useState<typeof users[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [twoFactorUser, setTwoFactorUser] = useState<typeof users[number] | null>(null);
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
        if (active) setBlockedMessage(policy.blockedMessage);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load transaction settings';
        showToast({ type: 'error', title: 'Error', message });
      })
      .finally(() => {
        if (active) setIsPolicyLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showToast]);

  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    control: createControl,
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
    control: updateControl,
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

  const handleToggleTransactions = useCallback(async (targetUser: typeof users[number]) => {
    setIsSubmitting(true);
    try {
      await api.updateUser(targetUser.id, { transactionsBlocked: !targetUser.transactionsBlocked });
      showToast({
        type: 'success',
        title: targetUser.transactionsBlocked ? 'Transactions Allowed' : 'Transactions Blocked',
        message: `Transaction access updated for ${targetUser.username}`,
      });
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction access';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  }, [refetch, showToast, users]);

  const handleSaveTwoFactor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!twoFactorUser) return;

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update two-factor authentication';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsTwoFactorSaving(false);
    }
  };

  const handleSavePolicy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPolicySaving(true);
    try {
      const policy = await api.updateTransactionPolicy({ blockedMessage: blockedMessage.trim() });
      setBlockedMessage(policy.blockedMessage);
      showToast({ type: 'success', title: 'Settings Saved', message: 'Transaction restriction message updated.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction settings';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsPolicySaving(false);
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
          <div className="flex items-center gap-2">
            <Badge variant={row.otpEnabled ? 'success' : 'gray'} size="sm">
              {row.otpEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTwoFactorUser(row);
                setTwoFactorEnabled(row.otpEnabled);
                setTwoFactorSecret('');
              }}
              disabled={isTwoFactorSaving}
              aria-label={`Manage 2FA for ${row.username}`}
            >
              <Shield className="w-4 h-4" />
            </Button>
          </div>
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
        key: 'transactionAccess',
        header: 'Transaction Access',
        render: (row: typeof users[0]) => (
          <div className="flex items-center gap-2">
            <Badge variant={row.transactionsBlocked ? 'error' : 'success'} size="sm">
              {row.transactionsBlocked ? 'Blocked' : 'Allowed'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleTransactions(row)}
              disabled={isSubmitting}
              aria-label={`${row.transactionsBlocked ? 'Allow' : 'Block'} transactions for ${row.username}`}
            >
              {row.transactionsBlocked ? 'Allow' : 'Block'}
            </Button>
          </div>
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
    [handleToggleTransactions, isSubmitting, isTwoFactorSaving]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and transaction access</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={ROUTES.ADMIN_TRANSACTIONS}>
            <Button variant="secondary" className="w-full">Manage Transactions</Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add User
          </Button>
        </div>
      </div>

      <form onSubmit={handleSavePolicy} className="card p-4 sm:p-6 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transaction restriction message</h2>
          <p className="text-sm text-gray-600 mt-1">
            Users with blocked transaction access will see this message when a transfer is denied.
          </p>
        </div>
        <label htmlFor="blocked-message" className="label">Fallback message</label>
        <textarea
          id="blocked-message"
          value={blockedMessage}
          onChange={(event) => setBlockedMessage(event.target.value)}
          maxLength={500}
          rows={3}
          className="input resize-y"
          disabled={isPolicyLoading || isPolicySaving}
          required
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">{blockedMessage.length}/500 characters</p>
          <Button type="submit" isLoading={isPolicySaving} disabled={isPolicyLoading || !blockedMessage.trim()}>
            Save Message
          </Button>
        </div>
      </form>

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
              onChange={handleRoleFilter}
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
          <Controller
            control={createControl}
            name="role"
            render={({ field }) => (
              <Select
                ref={field.ref}
                label="Role"
                value={field.value || 'user'}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                options={USER_ROLES.map((role) => ({ value: role.value, label: role.label }))}
                disabled={isSubmitting}
              />
            )}
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
            <Controller
              control={updateControl}
              name="role"
              defaultValue={editingUser.role}
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  label="Role"
                  value={field.value || editingUser.role}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  options={USER_ROLES.map((role) => ({ value: role.value, label: role.label }))}
                  disabled={isSubmitting}
                />
              )}
            />
            <Controller
              control={updateControl}
              name="isActive"
              defaultValue={editingUser.isActive}
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  label="Status"
                  value={field.value === false ? 'false' : 'true'}
                  onChange={(event) => field.onChange(event.target.value === 'true')}
                  onBlur={field.onBlur}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                  disabled={isSubmitting}
                />
              )}
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

      <Modal
        isOpen={!!twoFactorUser}
        onClose={() => {
          setTwoFactorUser(null);
          setTwoFactorSecret('');
        }}
        title="Manage Two-Factor Authentication"
        description={twoFactorUser ? `Configure OTP for ${twoFactorUser.username}.` : undefined}
        size="md"
      >
        {twoFactorUser && (
          <form onSubmit={handleSaveTwoFactor} className="space-y-5">
            <label className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                disabled={isTwoFactorSaving}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-chase-600 focus:ring-chase-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">Require OTP at sign in</span>
                <span className="mt-1 block text-sm text-gray-600">
                  When enabled, this user must provide a valid authenticator code after entering their password.
                </span>
              </span>
            </label>
            <Input
              label="Authenticator secret (Base32)"
              value={twoFactorSecret}
              onChange={(event) => setTwoFactorSecret(event.target.value.toUpperCase())}
              placeholder="Leave blank to keep the current secret"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={64}
              disabled={isTwoFactorSaving}
              helperText="Enter 16-64 Base32 characters (A-Z, 2-7) to set or replace the secret. Disabling 2FA with this field blank clears the saved secret. The secret is not displayed again after saving."
            />
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setTwoFactorUser(null);
                  setTwoFactorSecret('');
                }}
                disabled={isTwoFactorSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isTwoFactorSaving}>
                Save 2FA Settings
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};