import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);

      if (entry.isIntersecting && enabled) {
        onLoadMore();
      }
    },
    [enabled, onLoadMore]
  );

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current && target) {
        observerRef.current.unobserve(target);
      }
    };
  }, [enabled, handleIntersection, threshold, rootMargin]);

  return {
    ref: targetRef,
    isIntersecting,
  };
}

export function useInfiniteScrollWithState<T>(
  fetchFunction: (page: number) => Promise<T[]>,
  options: UseInfiniteScrollOptions & {
    initialPage?: number;
    pageSize?: number;
  } = {}
) {
  const { initialPage = 1, pageSize = 20, ...scrollOptions } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const newData = await fetchFunction(page);
      
      if (newData.length === 0 || newData.length < pageSize) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, fetchFunction, pageSize]);

  const { ref, isIntersecting } = useInfiniteScroll(loadMore, {
    ...scrollOptions,
    enabled: scrollOptions.enabled !== false && hasMore && !isLoading,
  });

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setIsError(false);
  }, [initialPage]);

  return {
    data,
    isLoading,
    isError,
    hasMore,
    ref,
    isIntersecting,
    reset,
    loadMore,
  };
}

export function useInfiniteScrollCursor<T extends { id: string }>(
  fetchFunction: (cursor?: string) => Promise<{
    data: T[];
    nextCursor?: string;
  }>,
  options: UseInfiniteScrollOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const result = await fetchFunction(cursor);
      
      if (!result.nextCursor) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...result.data]);
      setCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading more data:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, hasMore, fetchFunction]);

  const { ref, isIntersecting } = useInfiniteScroll(loadMore, {
    ...options,
    enabled: options.enabled !== false && hasMore && !isLoading,
  });

  const reset = useCallback(() => {
    setData([]);
    setCursor(undefined);
    setHasMore(true);
    setIsError(false);
  }, []);

  return {
    data,
    isLoading,
    isError,
    hasMore,
    ref,
    isIntersecting,
    reset,
    loadMore,
  };
}
