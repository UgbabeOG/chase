import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowUpRight, Plus, Eye, EyeOff, Copy, Check, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useAccounts, useTransactions } from '../../hooks';
import { AccountCard } from '../../components/data-display';
import { BalanceDisplay } from '../../components/data-display';
import { TransactionRow } from '../../components/data-display';
import { Button, Card, Badge, SkeletonCard } from '../../components/ui';
import { formatCurrency, formatAccountNumber, formatRelativeTime, formatDate } from '../../utils';
import { ROUTES } from '../../utils/constants';
import { useState } from 'react';

export const Accounts: React.FC = () => {
  const { accounts, isLoading, refetch } = useAccounts();
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);

  const handleViewTransactions = (accountId: number) => {
    setSelectedAccount(accountId);
    setShowTransactions(true);
  };

  const handleCloseTransactions = () => {
    setSelectedAccount(null);
    setShowTransactions(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SkeletonCard className="w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage your accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => handleViewTransactions(account.id)}
            showActions={true}
          />
        ))}
      </div>

      {showTransactions && selectedAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseTransactions} aria-hidden="true" />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                <p className="text-sm text-gray-500">Recent transactions</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseTransactions}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <BalanceDisplay
                  balance={accounts.find((a) => a.id === selectedAccount)?.balance || 0}
                  availableBalance={accounts.find((a) => a.id === selectedAccount)?.availableBalance}
                  label="Available Balance"
                  showToggle={true}
                />
                <Link to={ROUTES.TRANSFER} className="text-sm font-medium text-chase-600 hover:text-chase-700">
                  Transfer
                </Link>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <AccountTransactions accountId={selectedAccount} onClose={handleCloseTransactions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AccountTransactionsProps {
  accountId: number;
  onClose: () => void;
}

const AccountTransactions: React.FC<AccountTransactionsProps> = ({ accountId, onClose }) => {
  const { transactions, isLoading, pagination, refetch } = useTransactions({ accountId, limit: 20 });
  const [page, setPage] = useState(1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">This account has no recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};