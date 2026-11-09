import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { Transaction } from '../../types/api';
import { formatCurrency, formatDate, formatRelativeTime, getTransactionTypeColor, getTransactionTypeLabel, getTransactionTypeIcon } from '../../utils';
import { Badge } from '../ui';

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
  showAccount?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onClick, showAccount = false }) => {
  const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
  const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isCredit ? '+' : '-';

  const typeIcons = {
    credit: ArrowDown,
    debit: ArrowUp,
    transfer_in: ArrowDownLeft,
    transfer_out: ArrowUpRight,
  };

  const Icon = typeIcons[transaction.type] || ArrowUp;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      <div className={`p-3 rounded-xl ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">{transaction.description}</h4>
          <span className={`text-sm font-semibold ${amountColor} whitespace-nowrap`}>
            {amountPrefix}{formatCurrency(Math.abs(transaction.amount))}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="gray" size="sm">{getTransactionTypeLabel(transaction.type)}</Badge>
          {transaction.category && (
            <span className="text-xs text-gray-500">{transaction.category}</span>
          )}
          {showAccount && transaction.accountNickname && (
            <span className="text-xs text-gray-500">{transaction.accountNickname}</span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(transaction.createdAt)}</span>
        </div>
      </div>

      {onClick && (
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
      )}
    </div>
  );
};

interface TransactionTableRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionTableRow: React.FC<TransactionTableRowProps> = ({ transaction, onClick }) => {
  const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
  const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isCredit ? '+' : '-';

  return (
    <tr className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`} onClick={onClick}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {getTransactionTypeIcon(transaction.type) && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {transaction.type === 'credit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />}
                {transaction.type === 'debit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7v-18" />}
                {transaction.type === 'transfer_in' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />}
                {transaction.type === 'transfer_out' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />}
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{transaction.category || '-'}</td>
      <td className="px-4 py-3">
        <Badge variant="gray" size="sm">{getTransactionTypeLabel(transaction.type)}</Badge>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-right {amountColor}">{amountPrefix}{formatCurrency(Math.abs(transaction.amount))}</td>
      <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatCurrency(transaction.balanceAfter)}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{formatRelativeTime(transaction.createdAt)}</td>
    </tr>
  );
};