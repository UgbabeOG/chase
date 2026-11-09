import React, { useMemo } from 'react';
import { Transaction } from '../../types/api';
import { Table, Pagination, Badge } from '../ui';
import { formatCurrency, formatDate, formatRelativeTime, getTransactionTypeColor, getTransactionTypeLabel } from '../../utils';

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (transaction: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  onPageChange,
  isLoading,
  onRowClick,
}) => {
  const columns = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        render: (row: Transaction) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{formatDate(row.createdAt)}</p>
            <p className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</p>
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (row: Transaction) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.description}</p>
            {row.category && <p className="text-xs text-gray-500">{row.category}</p>}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (row: Transaction) => (
          <Badge variant="gray" size="sm">{getTransactionTypeLabel(row.type)}</Badge>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row: Transaction) => {
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
        render: (row: Transaction) => (
          <span className="text-sm font-mono text-gray-900">{formatCurrency(row.balanceAfter)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: Transaction) => {
          const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
            completed: 'success',
            pending: 'warning',
            failed: 'error',
            cancelled: 'gray',
          };
          return <Badge variant={statusColors[row.status] || 'gray'} size="sm">{row.status}</Badge>;
        },
      },
    ],
    []
  );

  return (
    <div className="card overflow-hidden">
      <Table
        columns={columns}
        data={transactions}
        keyExtractor={(row) => row.id.toString()}
        isLoading={isLoading}
        emptyMessage="No transactions found"
        hoverable
        onRowClick={onRowClick}
      />
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

interface TransactionFiltersProps {
  filters: {
    accountId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  };
  onFiltersChange: (filters: typeof filters) => void;
  accounts: { id: number; nickname: string | null; accountType: string; accountNumber: string }[];
  isLoading?: boolean;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  accounts,
  isLoading,
}) => {
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

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="account-filter" className="label">Account</label>
          <select
            id="account-filter"
            value={filters.accountId?.toString() || ''}
            onChange={(e) => onFiltersChange({ ...filters, accountId: e.target.value ? parseInt(e.target.value) : undefined })}
            disabled={isLoading}
            className="input"
          >
            <option value="">All Accounts</option>
            {accountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="type-filter" className="label">Type</label>
          <select
            id="type-filter"
            value={filters.type || ''}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value || undefined })}
            disabled={isLoading}
            className="input"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="start-date" className="label">From</label>
          <input
            id="start-date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
            disabled={isLoading}
            className="input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex-1">
          <label htmlFor="end-date" className="label">To</label>
          <input
            id="end-date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
            disabled={isLoading}
            className="input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
};