import React, { useState } from 'react';
import { Printer, Download, Copy, Check, ShieldCheck, X, FileText } from 'lucide-react';
import { Transaction, Account } from '../../types/api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency, formatAccountNumber, getTransactionTypeLabel } from '../../utils/format';
import { downloadTransactionReceipt, printTransactionReceipt, formatReceiptDate } from '../../utils/receipt';
import { Button, Badge } from '../ui';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  accounts?: Account[];
  account?: Account | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  accounts = [],
  account: propAccount,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !transaction) return null;

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to print receipt';
      showToast({ type: 'error', title: 'Print Error', message });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadTransactionReceipt({ transaction, account, user });
      showToast({ type: 'success', title: 'Download Started', message: 'Transaction receipt PDF downloaded successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download receipt';
      showToast({ type: 'error', title: 'Download Error', message });
    } finally {
      setIsDownloading(false);
    }
  };

  const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'gray'> = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    cancelled: 'gray',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 my-8">
          {/* Header Banner - Chase Branded */}
          <div className="bg-[#002147] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="6" fill="#002147" />
                  <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                  <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
                </svg>
              </div>
              <div>
                <h2 id="receipt-modal-title" className="text-lg font-bold tracking-tight">Chase Bank</h2>
                <p className="text-xs text-blue-200">Official Transaction Receipt</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount & Status Card */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</p>
                <p className={`text-2xl font-bold mt-0.5 ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                  {amountText}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant[transaction.status] || 'gray'} size="md">
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Reference Number Banner */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-sm">
              <span className="text-xs font-medium text-gray-500">Ref #:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-gray-800">{referenceNumber}</span>
                <button
                  onClick={handleCopyReference}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Copy reference number"
                  aria-label="Copy reference number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Details Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
              <div className="flex justify-between py-2.5 px-4 bg-white">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium text-gray-900">{formatReceiptDate(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-gray-50/50">
                <span className="text-gray-500">Transaction Type</span>
                <span className="font-medium text-gray-900">{getTransactionTypeLabel(transaction.type)}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-white">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-gray-900 text-right max-w-[240px] truncate">{transaction.description}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-gray-50/50">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900">{transaction.category || 'General'}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-white">
                <span className="text-gray-500">Account</span>
                <span className="font-medium text-gray-900">{accountDisplay}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-gray-50/50">
                <span className="text-gray-500">Balance After</span>
                <span className="font-mono font-medium text-gray-900">{formatCurrency(transaction.balanceAfter)}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-white">
                <span className="text-gray-500">Account Holder</span>
                <span className="font-medium text-gray-900">{userName}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-gray-50/50">
                <span className="text-gray-500">Channel</span>
                <span className="font-medium text-gray-900">Chase Online Banking</span>
              </div>
            </div>

            {/* Verified Note */}
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-chase-600 flex-shrink-0 mt-0.5" />
              <p>
                This receipt is an electronic record of your transaction. For inquiries or disputes, contact Chase Customer Support at 1-800-935-9935.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={handlePrint}
              isLoading={isPrinting}
              leftIcon={<Printer className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              isLoading={isDownloading}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
