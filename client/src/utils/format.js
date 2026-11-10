import { format, formatDistanceToNow, parseISO } from 'date-fns';
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
export function formatAccountNumber(accountNumber, visibleDigits = 4) {
    if (accountNumber.length <= visibleDigits)
        return accountNumber;
    const masked = '*'.repeat(accountNumber.length - visibleDigits);
    return masked + accountNumber.slice(-visibleDigits);
}
export function formatRoutingNumber(routingNumber) {
    if (routingNumber.length !== 9)
        return routingNumber;
    return `${routingNumber.slice(0, 3)} ${routingNumber.slice(3, 6)} ${routingNumber.slice(6)}`;
}
export function formatDate(date, formatStr = 'MMM d, yyyy') {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr);
}
export function formatDateTime(date) {
    return formatDate(date, 'MMM d, yyyy h:mm a');
}
export function formatRelativeTime(date) {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}
export function getTransactionTypeColor(type) {
    switch (type) {
        case 'credit':
        case 'transfer_in':
            return 'text-green-600';
        case 'debit':
        case 'transfer_out':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
}
export function getTransactionTypeLabel(type) {
    switch (type) {
        case 'credit':
            return 'Deposit';
        case 'debit':
            return 'Withdrawal';
        case 'transfer_in':
            return 'Transfer In';
        case 'transfer_out':
            return 'Transfer Out';
        default:
            return type;
    }
}
export function getTransactionTypeIcon(type) {
    switch (type) {
        case 'credit':
            return 'arrow-down';
        case 'debit':
            return 'arrow-up';
        case 'transfer_in':
            return 'arrow-down-left';
        case 'transfer_out':
            return 'arrow-up-right';
        default:
            return 'help-circle';
    }
}
export function truncate(str, length) {
    if (str.length <= length)
        return str;
    return str.slice(0, length) + '...';
}
export function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
export function debounce(fn, ms) {
    let timeoutId;
    return ((...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    });
}
export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
