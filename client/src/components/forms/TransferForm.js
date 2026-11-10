import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { transferSchema } from '../../utils/validation';
import { useTransfer } from '../../hooks';
import { useAccounts } from '../../hooks';
import { formatCurrency, formatAccountNumber } from '../../utils';
import { useState } from 'react';
export const TransferForm = () => {
    const { accounts } = useAccounts();
    const { transfer, isLoading } = useTransfer();
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { register, handleSubmit, watch, setValue, formState: { errors }, } = useForm({
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
    const onSubmit = async (data) => {
        setSubmitStatus('idle');
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const result = await transfer(data);
            setSubmitStatus('success');
            setSuccessMessage(`Successfully transferred ${formatCurrency(data.amount)} to account ending in ${data.toAccountNumber.slice(-4)}`);
            // Reset form
            setValue('toAccountNumber', '');
            setValue('amount', 0);
            setValue('description', '');
        }
        catch (err) {
            setSubmitStatus('error');
            const message = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
            setErrorMessage(message);
        }
    };
    if (accounts.length === 0) {
        return (_jsxs("div", { className: "card p-8 text-center", children: [_jsx(AlertCircle, { className: "mx-auto w-12 h-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No accounts available" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "You need at least one account to make transfers." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [submitStatus === 'success' && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3", role: "alert", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500 flex-shrink-0" }), _jsx("p", { className: "text-sm text-green-700", children: successMessage })] })), submitStatus === 'error' && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3", role: "alert", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500 flex-shrink-0" }), _jsx("p", { className: "text-sm text-red-700", children: errorMessage })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", noValidate: true, children: [_jsxs("div", { children: [_jsxs("label", { className: "label", children: ["From Account", _jsx(Select, { value: fromAccountId?.toString() || '', onChange: (e) => setValue('fromAccountId', parseInt(e.target.value, 10)), options: accounts.map((acc) => ({
                                            value: acc.id.toString(),
                                            label: `${acc.nickname || acc.accountType} ••••${acc.accountNumber.slice(-4)} (${formatCurrency(acc.availableBalance)} available)`,
                                        })), disabled: isLoading, error: errors.fromAccountId ? true : false })] }), errors.fromAccountId && (_jsx("p", { className: "mt-1.5 text-sm text-red-600", role: "alert", children: errors.fromAccountId.message }))] }), fromAccount && (_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Available Balance" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(fromAccount.availableBalance) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Account Number" }), _jsx("p", { className: "text-sm font-mono text-gray-900", children: formatAccountNumber(fromAccount.accountNumber) })] })] }) })), _jsx("div", { children: _jsx(Input, { ...register('toAccountNumber'), label: "To Account Number", placeholder: "1234567890", type: "text", inputMode: "numeric", maxLength: 10, error: errors.toAccountNumber?.message, disabled: isLoading, helperText: "Enter the 10-digit account number" }) }), _jsx("div", { children: _jsx(Input, { ...register('amount', { valueAsNumber: true }), label: "Amount", placeholder: "0.00", type: "number", step: "0.01", min: "0.01", max: "10000", error: errors.amount?.message, disabled: isLoading, helperText: "Maximum $10,000 per transfer" }) }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "label", children: "Description (Optional)" }), _jsx("textarea", { ...register('description'), id: "description", rows: 3, className: "input resize-none", placeholder: "What's this transfer for?", disabled: isLoading }), errors.description && (_jsx("p", { className: "mt-1.5 text-sm text-red-600", role: "alert", children: errors.description.message }))] }), _jsxs(Button, { type: "submit", className: "w-full", size: "lg", isLoading: isLoading, disabled: submitStatus === 'success', children: [isLoading ? _jsx(Loader2, { className: "w-5 h-5 mr-2" }) : null, "Transfer"] }), _jsx("p", { className: "text-center text-xs text-gray-500", children: "Transfers between Chase accounts are typically instant. Transfers to external accounts may take 1-3 business days." })] })] }));
};
