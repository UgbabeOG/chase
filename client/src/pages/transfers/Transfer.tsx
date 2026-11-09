import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CreditCard, AlertCircle } from 'lucide-react';
import { TransferForm } from '../../components/forms';
import { Card, Button } from '../../components/ui';
import { useAccounts } from '../../hooks';
import { ROUTES } from '../../utils/constants';

export const Transfer: React.FC = () => {
  const { accounts, isLoading } = useAccounts();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
          </div>
        </div>
        <div className="card animate-pulse p-8">
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Money</h1>
            <p className="text-sm text-gray-600 mt-1">Move money between accounts</p>
          </div>
        </div>
        <div className="card p-8 text-center">
          <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No accounts available</h3>
          <p className="mt-2 text-sm text-gray-600">You need at least one account to make transfers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Money</h1>
          <p className="text-sm text-gray-600 mt-1">Move money between your Chase accounts or to another account</p>
        </div>
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 text-sm font-medium text-chase-600 hover:text-chase-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="card p-8">
        <TransferForm />
      </div>

      <div className="mt-6 card p-6 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Transfer Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900">Chase to Chase</p>
            <p>Transfers between Chase accounts are typically instant.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">External Transfers</p>
            <p>Transfers to other banks may take 1-3 business days.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Daily Limit</p>
            <p>Maximum $10,000 per day for online transfers.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Cut-off Time</p>
            <p>Transfers after 8 PM ET process the next business day.</p>
          </div>
        </div>
      </div>
    </div>
  );
};