import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Printer, Download, Copy, Check, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency, getTransactionTypeLabel } from '../../utils/format';
import { downloadTransactionReceipt, printTransactionReceipt, formatReceiptDate } from '../../utils/receipt';
import { Button, Badge } from '../ui';
export const TransactionReceiptModal = ({ isOpen, onClose, transaction, accounts = [], account: propAccount, }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    if (!isOpen || !transaction)
        return null;
    // Resolve matching account if not passed directly
    const account = propAccount || accounts.find((a) => a.id === transaction.accountId) || null;
    const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
    const amountPrefix = isCredit ? '+' : '-';
    const amountText = `${amountPrefix}${formatCurrency(Math.abs(transaction.amount))}`;
    const referenceNumber = transaction.referenceNumber || `TXN-${transaction.id}`;
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Authorized Account Holder';
    const accountDisplay = account
        ? `${account.nickname || (account.accountType === 'checking' ? 'Checking' : 'Savings')} (•••• ${account.accountNumber.slice(-4)})`
        : transaction.accountNickname || (transaction.accountType ? `${transaction.accountType} Account` : 'Chase Account');
    const handleCopyReference = () => {
        navigator.clipboard.writeText(referenceNumber);
        setCopied(true);
        showToast({ type: 'success', title: 'Copied', message: 'Reference number copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
    };
    const handlePrint = () => {
        setIsPrinting(true);
        try {
            printTransactionReceipt({ transaction, account, user });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to print receipt';
            showToast({ type: 'error', title: 'Print Error', message });
        }
        finally {
            setIsPrinting(false);
        }
    };
    const handleDownload = () => {
        setIsDownloading(true);
        try {
            downloadTransactionReceipt({ transaction, account, user });
            showToast({ type: 'success', title: 'Download Started', message: 'Transaction receipt PDF downloaded successfully' });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to download receipt';
            showToast({ type: 'error', title: 'Download Error', message });
        }
        finally {
            setIsDownloading(false);
        }
    };
    const statusVariant = {
        completed: 'success',
        pending: 'warning',
        failed: 'error',
        cancelled: 'gray',
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", role: "dialog", "aria-modal": "true", "aria-labelledby": "receipt-modal-title", children: _jsxs("div", { className: "flex min-h-full items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", "aria-hidden": "true", onClick: onClose }), _jsxs("div", { className: "relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 my-8", children: [_jsxs("div", { className: "bg-[#002147] px-6 py-5 text-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center", children: _jsxs("svg", { className: "w-6 h-6 text-white", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "6", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }) }), _jsxs("div", { children: [_jsx("h2", { id: "receipt-modal-title", className: "text-lg font-bold tracking-tight", children: "Chase Bank" }), _jsx("p", { className: "text-xs text-blue-200", children: "Official Transaction Receipt" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors", "aria-label": "Close receipt", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Total Amount" }), _jsx("p", { className: `text-2xl font-bold mt-0.5 ${isCredit ? 'text-green-600' : 'text-gray-900'}`, children: amountText })] }), _jsx("div", { className: "text-right", children: _jsx(Badge, { variant: statusVariant[transaction.status] || 'gray', size: "md", children: transaction.status.toUpperCase() }) })] }), _jsxs("div", { className: "flex items-center justify-between px-3.5 py-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-sm", children: [_jsx("span", { className: "text-xs font-medium text-gray-500", children: "Ref #:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs font-semibold text-gray-800", children: referenceNumber }), _jsx("button", { onClick: handleCopyReference, className: "p-1 text-gray-400 hover:text-gray-600 rounded transition-colors", title: "Copy reference number", "aria-label": "Copy reference number", children: copied ? _jsx(Check, { className: "w-3.5 h-3.5 text-green-600" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }) })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm", children: [_jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-white", children: [_jsx("span", { className: "text-gray-500", children: "Date & Time" }), _jsx("span", { className: "font-medium text-gray-900", children: formatReceiptDate(transaction.createdAt) })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-gray-50/50", children: [_jsx("span", { className: "text-gray-500", children: "Transaction Type" }), _jsx("span", { className: "font-medium text-gray-900", children: getTransactionTypeLabel(transaction.type) })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-white", children: [_jsx("span", { className: "text-gray-500", children: "Description" }), _jsx("span", { className: "font-medium text-gray-900 text-right max-w-[240px] truncate", children: transaction.description })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-gray-50/50", children: [_jsx("span", { className: "text-gray-500", children: "Category" }), _jsx("span", { className: "font-medium text-gray-900", children: transaction.category || 'General' })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-white", children: [_jsx("span", { className: "text-gray-500", children: "Account" }), _jsx("span", { className: "font-medium text-gray-900", children: accountDisplay })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-gray-50/50", children: [_jsx("span", { className: "text-gray-500", children: "Balance After" }), _jsx("span", { className: "font-mono font-medium text-gray-900", children: formatCurrency(transaction.balanceAfter) })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-white", children: [_jsx("span", { className: "text-gray-500", children: "Account Holder" }), _jsx("span", { className: "font-medium text-gray-900", children: userName })] }), _jsxs("div", { className: "flex justify-between py-2.5 px-4 bg-gray-50/50", children: [_jsx("span", { className: "text-gray-500", children: "Channel" }), _jsx("span", { className: "font-medium text-gray-900", children: "Chase Online Banking" })] })] }), _jsxs("div", { className: "flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-chase-600 flex-shrink-0 mt-0.5" }), _jsx("p", { children: "This receipt is an electronic record of your transaction. For inquiries or disputes, contact Chase Customer Support at 1-800-935-9935." })] })] }), _jsxs("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: onClose, className: "w-full sm:w-auto", children: "Close" }), _jsx(Button, { variant: "secondary", onClick: handlePrint, isLoading: isPrinting, leftIcon: _jsx(Printer, { className: "w-4 h-4" }), className: "w-full sm:w-auto", children: "Print Receipt" }), _jsx(Button, { variant: "primary", onClick: handleDownload, isLoading: isDownloading, leftIcon: _jsx(Download, { className: "w-4 h-4" }), className: "w-full sm:w-auto", children: "Download PDF" })] })] })] }) }));
};
