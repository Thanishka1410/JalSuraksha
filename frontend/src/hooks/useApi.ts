import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

export const useFetch = <T>(url: string, immediate: boolean = true): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiGet<T>(url);
      setState({ data: response, loading: false, error: null });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { ...state, refetch: fetchData };
};

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseMutationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (data?: any) => Promise<T | null>;
  reset: () => void;
}

export const useMutation = <T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: UseMutationOptions
): UseMutationReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (data?: any): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        let response: T;
        switch (method) {
          case 'POST':
            response = await apiPost<T>(url, data);
            break;
          case 'PUT':
            response = await apiPut<T>(url, data);
            break;
          case 'PATCH':
            response = await apiPatch<T>(url, data);
            break;
          case 'DELETE':
            response = await apiDelete<T>(url);
            break;
          default:
            response = await apiPost<T>(url, data);
        }
        setState({ data: response, loading: false, error: null });
        options?.onSuccess?.(response);
        return response;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'An error occurred';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        options?.onError?.(err);
        return null;
      }
    },
    [url, method, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};
