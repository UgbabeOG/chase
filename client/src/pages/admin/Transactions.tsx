import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, Download, ChevronDown, ChevronUp, Plus, Edit, Trash2, DollarSign, CreditCard, Receipt } from 'lucide-react';
import { useAdminUsers, useAdminTransactions } from '../../hooks';
import { api } from '../../services/api';
import { Table, Pagination, Button, Input, Modal, Badge, Select, Card, SkeletonCard } from '../../components/ui';
import { TransactionReceiptModal } from '../../components/data-display';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils';
import { useToast } from '../../store/ToastContext';
import { ROUTES, TRANSACTION_CATEGORIES, TRANSACTION_TYPES, TRANSACTION_STATUSES } from '../../utils/constants';
import * as zod from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminAccount } from '../../types/api';

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

type CreateTransactionFormData = zod.infer<typeof createTransactionSchema>;

export const AdminTransactions: React.FC = () => {
  const { users } = useAdminUsers({ limit: 100 });
  const { transactions, pagination, isLoading, refetch } = useAdminTransactions();
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<typeof transactions[0] | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<typeof transactions[0] | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<typeof transactions[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    watch: createWatch,
    setValue: createSetValue,
    control: createControl,
    formState: { errors: createErrors },
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: 'debit', status: 'completed' },
  });

  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    control: updateControl,
    formState: { errors: updateErrors },
  } = useForm<Partial<CreateTransactionFormData>>({
    resolver: zodResolver(createTransactionSchema.partial()),
  });

  const watchedType = createWatch('type');
  const watchedAccountId = createWatch('accountId');

  useEffect(() => {
    let active = true;
    api.getAdminAccounts()
      .then((data) => {
        if (active) setAccounts(data);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load accounts';
        showToast({ type: 'error', title: 'Error', message });
      })
      .finally(() => {
        if (active) setIsAccountsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showToast]);

  const handleCreate = async (data: CreateTransactionFormData) => {
    setIsSubmitting(true);
    try {
      const account = accounts.find((item) => item.id === data.accountId);
      if (!account) {
        throw new Error('Select a valid account for this transaction.');
      }
      await api.createTransaction(account.userId, data);
      showToast({ type: 'success', title: 'Transaction Created', message: 'Transaction has been created successfully' });
      createReset();
      setIsCreateOpen(false);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Partial<CreateTransactionFormData>) => {
    if (!editingTransaction) return;
    setIsSubmitting(true);
    try {
      await api.updateTransaction(editingTransaction.id, data);
      showToast({ type: 'success', title: 'Transaction Updated', message: 'Transaction has been updated successfully' });
      setEditingTransaction(null);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setIsSubmitting(true);
    try {
      await api.deleteTransaction(deletingTransaction.id);
      showToast({ type: 'success', title: 'Transaction Deleted', message: 'Transaction has been deleted successfully' });
      setDeletingTransaction(null);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        render: (row: typeof transactions[0]) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{formatDate(row.createdAt)}</p>
            <p className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</p>
          </div>
        ),
      },
      {
        key: 'user',
        header: 'User',
        render: (row: typeof transactions[0]) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-gray-500">@{row.username}</p>
          </div>
        ),
      },
      {
        key: 'account',
        header: 'Account',
        render: (row: typeof transactions[0]) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.accountNickname || row.accountType}</p>
            <p className="text-xs text-gray-500 font-mono">••••{row.accountNickname ? '' : '****'}</p>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (row: typeof transactions[0]) => {
          const typeLabels: Record<string, string> = {
            credit: 'Deposit',
            debit: 'Withdrawal',
            transfer_in: 'Transfer In',
            transfer_out: 'Transfer Out',
          };
          const typeColors: Record<string, 'success' | 'error' | 'info' | 'warning' | 'gray'> = {
            credit: 'success',
            debit: 'error',
            transfer_in: 'info',
            transfer_out: 'warning',
          };
          return (
            <Badge variant={typeColors[row.type] || 'gray'} size="sm">
              {typeLabels[row.type] || row.type}
            </Badge>
          );
        },
      },
      {
        key: 'category',
        header: 'Category',
        render: (row: typeof transactions[0]) => (
          <p className="text-sm text-gray-500">{row.category || '-'}</p>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (row: typeof transactions[0]) => (
          <p className="text-sm text-gray-900 max-w-xs truncate" title={row.description}>{row.description}</p>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row: typeof transactions[0]) => {
          const isCredit = row.type === 'credit' || row.type === 'transfer_in';
          return (
            <span className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
              {isCredit ? '+' : '-'}{formatCurrency(Math.abs(row.amount))}
            </span>
          );
        },
      },
      {
        key: 'balance',
        header: 'Balance',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row: typeof transactions[0]) => (
          <span className="text-sm font-mono text-gray-900">{formatCurrency(row.balanceAfter)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: typeof transactions[0]) => {
          const statusColors: Record<string, 'success' | 'warning' | 'error' | 'gray'> = {
            completed: 'success',
            pending: 'warning',
            failed: 'error',
            cancelled: 'gray',
          };
          return <Badge variant={statusColors[row.status] || 'gray'} size="sm">{row.status}</Badge>;
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row: typeof transactions[0]) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(row)} title="View Receipt">
              <Receipt className="w-4 h-4 text-chase-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingTransaction(row)} disabled={isSubmitting} title="Edit Transaction">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeletingTransaction(row)} disabled={isSubmitting} title="Delete Transaction">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    [transactions, isSubmitting]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-sm text-gray-600 mt-1">View, create, and manage all transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={ROUTES.ADMIN_USERS}>
            <Button variant="secondary" className="w-full">User Management</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...TRANSACTION_TYPES,
              ]}
              className="w-40"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                ...TRANSACTION_STATUSES,
              ]}
              className="w-40"
            />
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: '', label: 'All Users' },
                ...users.map((u) => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName} (${u.username})` })),
              ]}
              className="w-48"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={transactions}
          keyExtractor={(row) => row.id.toString()}
          isLoading={isLoading}
          emptyMessage="No transactions found"
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
        title="Create Transaction"
        size="lg"
      >
        <form onSubmit={createHandleSubmit(handleCreate)} className="space-y-4" noValidate>
          <Controller
            control={createControl}
            name="accountId"
            render={({ field }) => (
              <Select
                ref={field.ref}
                label="Account"
                value={field.value?.toString() || ''}
                placeholder="Select an account"
                onChange={(event) => field.onChange(Number(event.target.value))}
                onBlur={field.onBlur}
                options={accounts.map((account) => ({
                  value: account.id.toString(),
                  label: `${account.nickname || account.accountType} ••••${account.accountNumber.slice(-4)} (${account.username})`,
                }))}
                disabled={isSubmitting || isAccountsLoading || accounts.length === 0}
              />
            )}
          />
          <Controller
            control={createControl}
            name="type"
            render={({ field }) => (
              <Select
                ref={field.ref}
                label="Type"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                options={TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                disabled={isSubmitting}
              />
            )}
          />
          <Controller
            control={createControl}
            name="category"
            render={({ field }) => (
              <Select
                ref={field.ref}
                label="Category (Optional)"
                value={field.value || ''}
                placeholder="No category"
                onChange={(event) => field.onChange(event.target.value || undefined)}
                onBlur={field.onBlur}
                options={[
                  { value: '', label: 'No category' },
                  ...TRANSACTION_CATEGORIES.map((category) => ({ value: category, label: category })),
                ]}
                disabled={isSubmitting}
              />
            )}
          />
          <Input
            {...createRegister('description')}
            label="Description"
            placeholder="Transaction description"
            disabled={isSubmitting}
          />
          <Input
            {...createRegister('amount', { valueAsNumber: true })}
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled={isSubmitting}
          />
          <Controller
            control={createControl}
            name="status"
            render={({ field }) => (
              <Select
                ref={field.ref}
                label="Status"
                value={field.value || 'completed'}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                options={TRANSACTION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                disabled={isSubmitting}
              />
            )}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Transaction
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        size="lg"
      >
        {editingTransaction && (
          <form onSubmit={updateHandleSubmit(handleUpdate)} className="space-y-4" noValidate>
            <Input
              {...updateRegister('description')}
              label="Description"
              defaultValue={editingTransaction.description}
              disabled={isSubmitting}
            />
            <Input
              {...updateRegister('amount', { valueAsNumber: true })}
              label="Amount"
              type="number"
              step="0.01"
              defaultValue={editingTransaction.amount}
              disabled={isSubmitting}
            />
            <Controller
              control={updateControl}
              name="status"
              defaultValue={editingTransaction.status}
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  label="Status"
                  value={field.value || editingTransaction.status}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  options={TRANSACTION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                  disabled={isSubmitting}
                />
              )}
            />
            <Controller
              control={updateControl}
              name="category"
              defaultValue={editingTransaction.category || ''}
              render={({ field }) => (
                <Select
                  ref={field.ref}
                  label="Category"
                  value={field.value || ''}
                  placeholder="No category"
                  onChange={(event) => field.onChange(event.target.value || undefined)}
                  onBlur={field.onBlur}
                  options={[
                    { value: '', label: 'No category' },
                    ...TRANSACTION_CATEGORIES.map((category) => ({ value: category, label: category })),
                  ]}
                  disabled={isSubmitting}
                />
              )}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setEditingTransaction(null)} disabled={isSubmitting}>
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
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        title="Delete Transaction"
        size="sm"
      >
        {deletingTransaction && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this transaction?
              <br />
              <strong className="text-gray-900">{deletingTransaction.description}</strong>
              ({formatCurrency(Math.abs(deletingTransaction.amount))})
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingTransaction(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
                Delete Transaction
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <TransactionReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
      />
    </div>
  );
};