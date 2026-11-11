import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowUpRight, TrendingUp, History, Plus, Eye, EyeOff, Copy, Check, MoreHorizontal } from 'lucide-react';
import { useAccounts, useTransactions } from '../../hooks';
import { BalanceSummary, BalanceDisplay, AccountCard, TransactionRow, TransactionReceiptModal } from '../../components/data-display';
import { Button, Badge, Card, SkeletonCard } from '../../components/ui';
import { formatCurrency, formatAccountNumber, formatRelativeTime, getTransactionTypeColor } from '../../utils';
import { ROUTES } from '../../utils/constants';
import { useState } from 'react';
import type { Transaction } from '../../types/api';

export const Dashboard: React.FC = () => {
  const { accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const [showBalances, setShowBalances] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const checkingBalance = accounts.filter((a) => a.accountType === 'checking').reduce((sum, acc) => sum + acc.balance, 0);
  const savingsBalance = accounts.filter((a) => a.accountType === 'savings').reduce((sum, acc) => sum + acc.balance, 0);

  const handleCopyAccount = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
  };

  if (accountsLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back! Here's an overview of your accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => refetchAccounts()}>
            Refresh
          </Button>
          <Link to={ROUTES.TRANSFER}>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Transfer
            </Button>
          </Link>
        </div>
      </div>

      <BalanceSummary
        totalBalance={totalBalance}
        totalAvailable={totalAvailable}
        checkingBalance={checkingBalance}
        savingsBalance={savingsBalance}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} onClick={() => {}} showActions={true} />
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500">Your latest account activity</p>
          </div>
          <Link to={ROUTES.TRANSACTIONS} className="text-sm font-medium text-chase-600 hover:text-chase-700">
            View all
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500">Your recent transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onClick={() => setSelectedTransaction(transaction)}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionReceiptModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        accounts={accounts}
      />
    </div>
  );
};