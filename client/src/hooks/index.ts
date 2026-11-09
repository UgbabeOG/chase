import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../store/ToastContext';
import type { Account, Transaction, PaginatedResponse, User } from '../types/api';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(message);
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoading, error, refetch: fetchAccounts };
}

export function useAccount(id: number | null) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAccount(id);
      setAccount(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch account';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return { account, isLoading, error, refetch: fetchAccount };
}

export function useTransactions(params?: { accountId?: number; page?: number; limit?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions({ ...params, page, limit: params?.limit || 20 });
      setTransactions(data.data);
      setPagination(data.meta);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [params, showToast]);

  useEffect(() => {
    fetchTransactions(params?.page || 1);
  }, [fetchTransactions, params?.page, params?.accountId]);

  return { transactions, pagination, isLoading, error, refetch: fetchTransactions };
}

export function useTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const transfer = useCallback(async (data: { fromAccountId: number; toAccountNumber: string; amount: number; description?: string }) => {
    setIsLoading(true);
    try {
      const result = await api.transfer(data);
      showToast({ type: 'success', title: 'Transfer Complete', message: `$${data.amount.toFixed(2)} transferred successfully` });
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transfer failed';
      showToast({ type: 'error', title: 'Transfer Failed', message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return { transfer, isLoading };
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUsers({ ...params, page, limit: params?.limit || 20 });
      setUsers(data.data);
      setPagination(data.meta);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [params, showToast]);

  useEffect(() => {
    fetchUsers(params?.page || 1);
  }, [fetchUsers, params?.page, params?.search, params?.role]);

  return { users, pagination, isLoading, error, refetch: fetchUsers };
}

export function useAdminTransactions(params?: { page?: number; limit?: number; userId?: number; accountId?: number; type?: string; status?: string }) {
  const [transactions, setTransactions] = useState<(Transaction & { username: string; firstName: string; lastName: string })[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAllTransactions({ ...params, page, limit: params?.limit || 20 });
      setTransactions(data.data);
      setPagination(data.meta);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [params, showToast]);

  useEffect(() => {
    fetchTransactions(params?.page || 1);
  }, [fetchTransactions, params?.page, params?.userId, params?.accountId, params?.type, params?.status]);

  return { transactions, pagination, isLoading, error, refetch: fetchTransactions };
}