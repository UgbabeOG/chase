import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../store/ToastContext';
export function useAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAccounts();
            setAccounts(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
            setError(message);
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);
    return { accounts, isLoading, error, refetch: fetchAccounts };
}
export function useAccount(id) {
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAccount = useCallback(async () => {
        if (!id)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAccount(id);
            setAccount(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch account';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    }, [id]);
    useEffect(() => {
        fetchAccount();
    }, [fetchAccount]);
    return { account, isLoading, error, refetch: fetchAccount };
}
export function useTransactions(params) {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const fetchTransactions = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getTransactions({ ...params, page, limit: params?.limit || 20 });
            setTransactions(data.data);
            setPagination(data.meta);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(message);
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
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
    const transfer = useCallback(async (data) => {
        setIsLoading(true);
        try {
            const result = await api.transfer(data);
            showToast({ type: 'success', title: 'Transfer Complete', message: `$${data.amount.toFixed(2)} transferred successfully` });
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Transfer failed';
            showToast({ type: 'error', title: 'Transfer Failed', message });
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }, [showToast]);
    return { transfer, isLoading };
}
export function useAdminUsers(params) {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const fetchUsers = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getUsers({ ...params, page, limit: params?.limit || 20 });
            setUsers(data.data);
            setPagination(data.meta);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(message);
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsLoading(false);
        }
    }, [params, showToast]);
    useEffect(() => {
        fetchUsers(params?.page || 1);
    }, [fetchUsers, params?.page, params?.search, params?.role]);
    return { users, pagination, isLoading, error, refetch: fetchUsers };
}
export function useAdminTransactions(params) {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const fetchTransactions = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAllTransactions({ ...params, page, limit: params?.limit || 20 });
            setTransactions(data.data);
            setPagination(data.meta);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(message);
            showToast({ type: 'error', title: 'Error', message });
        }
        finally {
            setIsLoading(false);
        }
    }, [params, showToast]);
    useEffect(() => {
        fetchTransactions(params?.page || 1);
    }, [fetchTransactions, params?.page, params?.userId, params?.accountId, params?.type, params?.status]);
    return { transactions, pagination, isLoading, error, refetch: fetchTransactions };
}
