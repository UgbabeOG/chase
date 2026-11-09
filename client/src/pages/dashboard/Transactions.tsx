import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAccounts, useTransactions } from '../../hooks';
import { TransactionTable, TransactionFilters } from '../../components/data-display';
import { Button, Card, Badge, Select, SkeletonCard } from '../../components/ui';
import { formatRelativeTime } from '../../utils';
import { TRANSACTION_CATEGORIES } from '../../utils/constants';
import { useState } from 'react';

export const Transactions: React.FC = () => {
  const { accounts } = useAccounts();
  const [filters, setFilters] = useState({
    accountId: undefined as number | undefined,
    type: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const { transactions, pagination, isLoading, refetch } = useTransactions({
    ...filters,
    page,
    limit: 20,
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortConfig.key];
      const bVal = (b as Record<string, unknown>)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortConfig]);

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">View and filter your transaction history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        accounts={accounts}
        isLoading={isLoading}
      />

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.accountId && (
            <Badge variant="gray" onRemove={() => handleFiltersChange({ ...filters, accountId: undefined })}>
              Account
            </Badge>
          )}
          {filters.type && (
            <Badge variant="gray" onRemove={() => handleFiltersChange({ ...filters, type: undefined })}>
              Type: {filters.type}
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="gray" onRemove={() => handleFiltersChange({ ...filters, startDate: undefined })}>
              From: {filters.startDate}
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="gray" onRemove={() => handleFiltersChange({ ...filters, endDate: undefined })}>
              To: {filters.endDate}
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => handleFiltersChange({ accountId: undefined, type: undefined, startDate: undefined, endDate: undefined })}>
              Clear all
            </Button>
          )}
        </div>
      )}

      <TransactionTable
        transactions={sortedTransactions}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No transactions found matching your filters"
      />

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500">
          Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} transactions
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={`${sortConfig.key}:${sortConfig.direction}`}
            onChange={(value) => {
              const [key, direction] = value.split(':');
              setSortConfig({ key, direction: direction as 'asc' | 'desc' });
            }}
            options={[
              { value: 'createdAt:desc', label: 'Newest First' },
              { value: 'createdAt:asc', label: 'Oldest First' },
              { value: 'amount:desc', label: 'Amount: High to Low' },
              { value: 'amount:asc', label: 'Amount: Low to High' },
            ]}
            className="w-48"
          />
        </div>
      </div>
    </div>
  );
};