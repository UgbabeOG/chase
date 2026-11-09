import React from 'react';
import { CreditCard, TrendingUp, MoreHorizontal, Copy, Check } from 'lucide-react';
import { Account } from '../../types/api';
import { formatCurrency, formatAccountNumber } from '../../utils';
import { Button, Badge } from '../ui';
import { useState } from 'react';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  showActions?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onClick, showActions = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isChecking = account.accountType === 'checking';

  return (
    <div
      className={`card-hover p-6 relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isChecking ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            <CreditCard className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{account.nickname || (isChecking ? 'Checking' : 'Savings')}</h3>
            <p className="text-sm text-gray-500 font-mono">{formatAccountNumber(account.accountNumber)}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              aria-label={copied ? 'Copied!' : 'Copy account number'}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" aria-label="More options">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available Balance</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(account.availableBalance)}</p>
        {account.balance !== account.availableBalance && (
          <p className="text-sm text-gray-500 mt-1">
            Current balance: <span className="font-medium text-gray-900">{formatCurrency(account.balance)}</span>
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>Routing: <span className="font-mono font-medium text-gray-900">{account.routingNumber}</span></span>
        <Badge variant={isChecking ? 'info' : 'success'}>{isChecking ? 'Checking' : 'Savings'}</Badge>
      </div>
    </div>
  );
};

interface AccountCardSkeletonProps {
  className?: string;
}

export const AccountCardSkeleton: React.FC<AccountCardSkeletonProps> = ({ className = '' }) => (
  <div className={`card p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mt-2" />
      </div>
    </div>
    <div className="mt-6">
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
      <div className="h-8 w-full bg-gray-200 rounded mt-2" />
    </div>
    <div className="mt-6 flex justify-between">
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="h-5 w-20 bg-gray-200 rounded-full" />
    </div>
  </div>
);