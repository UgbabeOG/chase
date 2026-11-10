import { jsx as _jsx } from "react/jsx-runtime";
export const Badge = ({ children, variant = 'gray', size = 'md', className = '' }) => {
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
    return (_jsx("span", { className: `inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`, children: children }));
};
const statusVariantMap = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    cancelled: 'gray',
    active: 'success',
    inactive: 'gray',
    processing: 'info',
};
export const StatusBadge = ({ status, className = '' }) => {
    const variant = statusVariantMap[status.toLowerCase()] || 'gray';
    const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return _jsx(Badge, { variant: variant, className: className, children: label });
};
const typeVariantMap = {
    credit: 'success',
    debit: 'error',
    transfer_in: 'info',
    transfer_out: 'warning',
};
export const TransactionTypeBadge = ({ type, className = '' }) => {
    const variant = typeVariantMap[type] || 'gray';
    const labels = {
        credit: 'Deposit',
        debit: 'Withdrawal',
        transfer_in: 'Transfer In',
        transfer_out: 'Transfer Out',
    };
    const label = labels[type] || type;
    return _jsx(Badge, { variant: variant, className: className, children: label });
};
