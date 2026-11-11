import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { AlertCircle, CheckCircle, Receipt } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { TransactionReceiptModal } from '../data-display';
import { transferSchema, type TransferFormData } from '../../utils/validation';
import { useTransfer } from '../../hooks';
import { useAccounts } from '../../hooks';
import { formatCurrency, formatAccountNumber } from '../../utils';
import { useState } from 'react';
import type { Transaction } from '../../types/api';

export const TransferForm: React.FC = () => {
  const { accounts } = useAccounts();
  const { transfer, isLoading } = useTransfer();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: accounts[0]?.id || 0,
      toAccountNumber: '',
      amount: 0,
      description: '',
    },
  });

  const fromAccountId = watch('fromAccountId');
  const amount = watch('amount');
  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);

  const onSubmit = async (data: TransferFormData) => {
    setSubmitStatus('idle');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await transfer(data);
      setSubmitStatus('success');
      setCompletedTransaction(result.transaction);
      setSuccessMessage(`Successfully transferred ${formatCurrency(data.amount)} to account ending in ${data.toAccountNumber.slice(-4)}`);
      // Reset form
      setValue('toAccountNumber', '');
      setValue('amount', 0);
      setValue('description', '');
    } catch (err: unknown) {
      setSubmitStatus('error');
      const message = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
      setErrorMessage(message);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No accounts available</h3>
        <p className="mt-2 text-sm text-gray-600">You need at least one account to make transfers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" role="alert">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
          {completedTransaction && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowReceipt(true)}
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              View Receipt
            </Button>
          )}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <label className="label">
            From Account
            <Select
              value={fromAccountId?.toString() || ''}
              onChange={(e) => setValue('fromAccountId', parseInt(e.target.value, 10))}
              options={accounts.map((acc) => ({
                value: acc.id.toString(),
                label: `${acc.nickname || acc.accountType} ••••${acc.accountNumber.slice(-4)} (${formatCurrency(acc.availableBalance)} available)`,
              }))}
              disabled={isLoading}
              error={errors.fromAccountId ? true : false}
            />
          </label>
          {errors.fromAccountId && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.fromAccountId.message}</p>
          )}
        </div>

        {fromAccount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(fromAccount.availableBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="text-sm font-mono text-gray-900">{formatAccountNumber(fromAccount.accountNumber)}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Input
            {...register('toAccountNumber')}
            label="To Account Number"
            placeholder="1234567890"
            type="text"
            inputMode="numeric"
            maxLength={10}
            error={errors.toAccountNumber?.message}
            disabled={isLoading}
            helperText="Enter the 10-digit account number"
          />
        </div>

        <div>
          <Input
            {...register('amount', { valueAsNumber: true })}
            label="Amount"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            error={errors.amount?.message}
            disabled={isLoading}
            helperText="Maximum $10,000 per transfer"
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Description (Optional)</label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="input resize-none"
            placeholder="What's this transfer for?"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.description.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={submitStatus === 'success'}>
          Transfer
        </Button>

        <p className="text-center text-xs text-gray-500">
          Transfers between Chase accounts are typically instant. Transfers to external accounts may take 1-3 business days.
        </p>
      </form>

      <TransactionReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={completedTransaction}
        accounts={accounts}
      />
    </div>
  );
};