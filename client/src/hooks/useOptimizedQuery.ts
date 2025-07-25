import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';

/**
 * Optimized query hook with performance enhancements
 * - Memoized query keys for better cache management
 * - Optimized stale time and cache time
 * - Smart refetch behavior
 */

interface OptimizedQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useOptimizedQuery<T>(
  queryKey: (string | number | undefined)[],
  queryFn?: () => Promise<T>,
  options: OptimizedQueryOptions = {}
) {
  const queryClient = useQueryClient();
  
  // Memoize query key to prevent unnecessary re-renders
  const memoizedKey = useMemo(() => 
    queryKey.filter(key => key !== undefined), 
    [queryKey]
  );
  
  // Smart cache invalidation
  const invalidateRelatedQueries = useCallback((pattern: string) => {
    queryClient.invalidateQueries({ 
      queryKey: [pattern],
      exact: false 
    });
  }, [queryClient]);
  
  return useQuery({
    queryKey: memoizedKey,
    queryFn,
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    gcTime: options.cacheTime ?? 1000 * 60 * 30, // 30 minutes default
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    retry: 1,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      invalidateRelatedQueries
    }
  });
}

// Optimized hooks for specific data types
export function useOptimizedPosts(brandId?: number, status?: string) {
  return useOptimizedQuery(
    ['/api/posts', brandId, status],
    undefined,
    { staleTime: 1000 * 60 * 2 } // 2 minutes for posts
  );
}

export function useOptimizedCalendarPosts(start?: string, end?: string, brandId?: number) {
  return useOptimizedQuery(
    ['/api/calendar/posts', start, end, brandId].filter(Boolean),
    undefined,
    { staleTime: 1000 * 60 * 1 } // 1 minute for calendar (more frequent updates)
  );
}

export function useOptimizedBrands() {
  return useOptimizedQuery(
    ['/api/brands'],
    undefined,
    { staleTime: 1000 * 60 * 10 } // 10 minutes for brands (rarely change)
  );
}