import { useState, useEffect, useCallback } from "react";

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export function useApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function usePaginatedApi<T>(
  baseUrl: string,
  params: Record<string, string | number | boolean> = {}
): ApiResponse<ApiPaginatedResponse<T>> & {
  loadMore: () => void;
  hasMore: boolean;
  allItems: T[];
} {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, value.toString()])
    ),
  });

  const url = `${baseUrl}?${queryParams}`;
  const { data, loading, error, refetch } =
    useApi<ApiPaginatedResponse<T>>(url);

  useEffect(() => {
    if (data && data.success) {
      if (currentPage === 1) {
        setAllItems(data.data || []);
      } else {
        setAllItems((prev) => [...prev, ...(data.data || [])]);
      }
      setHasMore(data.pagination?.hasMore || false);
    }
  }, [data, currentPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const resetAndRefetch = useCallback(() => {
    setCurrentPage(1);
    setAllItems([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch: resetAndRefetch,
    loadMore,
    hasMore,
    allItems,
  };
}
