import React from 'react';
import { Eye, EyeOff, Copy, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { useState } from 'react';

interface BalanceDisplayProps {
  balance: number;
  availableBalance?: number;
  label?: string;
  showToggle?: boolean;
  className?: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  availableBalance,
  label = 'Available Balance',
  showToggle = true,
  className = '',
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayBalance = isHidden ? '••••••' : formatCurrency(balance);
  const displayAvailable = availableBalance !== undefined && availableBalance !== balance
    ? (isHidden ? '••••••' : formatCurrency(availableBalance))
    : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formatCurrency(balance).replace(/[$,]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1">
          {showToggle && (
            <button
              onClick={() => setIsHidden(!isHidden)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isHidden ? 'Show balance' : 'Hide balance'}
              aria-pressed={isHidden}
            >
              {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={copied ? 'Copied!' : 'Copy balance'}
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-1 font-tabular-nums transition-all duration-200">
        {displayBalance}
      </p>
      {displayAvailable && (
        <p className="text-sm text-gray-500 mt-1">
          Current balance: <span className="font-medium text-gray-900 font-tabular-nums">{displayAvailable}</span>
        </p>
      )}
    </div>
  );
};

interface BalanceSummaryProps {
  totalBalance: number;
  totalAvailable: number;
  checkingBalance: number;
  savingsBalance: number;
  className?: string;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  totalBalance,
  totalAvailable,
  checkingBalance,
  savingsBalance,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Balance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 font-tabular-nums">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="p-3 rounded-xl bg-chase-100 text-chase-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Checking</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 font-tabular-nums">{formatCurrency(checkingBalance)}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Savings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 font-tabular-nums">{formatCurrency(savingsBalance)}</p>
          </div>
          <div className="p-3 rounded-xl bg-green-100 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};