import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', size = 'md', className = '' }) => {
  const variantClasses = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'gray',
  active: 'success',
  inactive: 'gray',
  processing: 'info',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const variant = statusVariantMap[status.toLowerCase()] || 'gray';
  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return <Badge variant={variant} className={className}>{label}</Badge>;
};

interface TransactionTypeBadgeProps {
  type: string;
  className?: string;
}

const typeVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
  credit: 'success',
  debit: 'error',
  transfer_in: 'info',
  transfer_out: 'warning',
};

export const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({ type, className = '' }) => {
  const variant = typeVariantMap[type] || 'gray';
  const labels: Record<string, string> = {
    credit: 'Deposit',
    debit: 'Withdrawal',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
  };
  const label = labels[type] || type;

  return <Badge variant={variant} className={className}>{label}</Badge>;
};