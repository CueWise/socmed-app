import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// Optimized query hook with intelligent caching and performance enhancements
export function useOptimizedQuery<T>(
  queryKey: string | string[],
  queryFn?: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> & {
    staleTime?: number;
    cacheTime?: number;
    background?: boolean;
    priority?: 'high' | 'normal' | 'low';
  }
) {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  // Intelligent stale time based on data type
  const getStaleTime = () => {
    if (options?.staleTime) return options.staleTime;
    
    const keyStr = key.join(':');
    if (keyStr.includes('user')) return 5 * 60 * 1000; // 5 minutes for user data
    if (keyStr.includes('brand')) return 3 * 60 * 1000; // 3 minutes for brand data
    if (keyStr.includes('post')) return 2 * 60 * 1000; // 2 minutes for posts
    if (keyStr.includes('analytics')) return 10 * 60 * 1000; // 10 minutes for analytics
    return 1 * 60 * 1000; // 1 minute default
  };

  // Background prefetching for related data
  const prefetchRelated = useCallback(() => {
    if (!options?.background) return;

    const keyStr = key.join(':');
    
    // Clear existing timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Prefetch related queries with delay to avoid overwhelming the server
    prefetchTimeoutRef.current = setTimeout(() => {
      if (keyStr.includes('brands')) {
        // Prefetch posts when brands are loaded
        queryClient.prefetchQuery({
          queryKey: ['/api/posts'],
          staleTime: 2 * 60 * 1000
        });
      }
      
      if (keyStr.includes('posts')) {
        // Prefetch calendar data when posts are loaded
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        queryClient.prefetchQuery({
          queryKey: ['/api/calendar', startOfMonth.toISOString(), endOfMonth.toISOString()],
          staleTime: 5 * 60 * 1000
        });
      }
    }, 500);
  }, [key, options?.background, queryClient]);

  const query = useQuery({
    queryKey: key,
    queryFn,
    staleTime: getStaleTime(),
    gcTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes default
    retry: (failureCount, error: any) => {
      // Intelligent retry logic
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false; // Don't retry auth errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  // Trigger background prefetching when main query succeeds
  useEffect(() => {
    if (query.isSuccess && !query.isFetching) {
      prefetchRelated();
    }

    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [query.isSuccess, query.isFetching, prefetchRelated]);

  return query;
}

// Hook for batch queries with intelligent loading states
export function useBatchQueries<T extends Record<string, any>>(
  queries: Array<{
    key: string | string[];
    queryFn?: () => Promise<any>;
    options?: any;
  }>
) {
  const results = queries.map(({ key, queryFn, options }) =>
    useOptimizedQuery(key, queryFn, options)
  );

  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const isSuccess = results.every(result => result.isSuccess);
  const isFetching = results.some(result => result.isFetching);

  const data = results.reduce((acc, result, index) => {
    const key = Array.isArray(queries[index].key) 
      ? queries[index].key[0] 
      : queries[index].key as string;
    acc[key] = result.data;
    return acc;
  }, {} as T);

  const errors = results
    .filter(result => result.isError)
    .map(result => result.error);

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    errors,
    results
  };
}

// Hook for optimistic updates with rollback
export function useOptimisticMutation<T, V>(
  mutationKey: string[],
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V, context?: any) => void;
    optimisticUpdate?: (variables: V) => T;
    rollback?: (context: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return {
    mutate: async (variables: V) => {
      let previousData: any;

      try {
        // Optimistic update
        if (options?.optimisticUpdate) {
          await queryClient.cancelQueries({ queryKey: mutationKey });
          previousData = queryClient.getQueryData(mutationKey);
          
          const optimisticData = options.optimisticUpdate(variables);
          queryClient.setQueryData(mutationKey, optimisticData);
        }

        // Perform mutation
        const result = await mutationFn(variables);
        
        // Update cache with real result
        queryClient.setQueryData(mutationKey, result);
        
        // Invalidate related queries
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey[0] as string;
            return mutationKey.some(mutKey => key.includes(mutKey));
          }
        });

        options?.onSuccess?.(result, variables);
        return result;
      } catch (error) {
        // Rollback on error
        if (previousData) {
          queryClient.setQueryData(mutationKey, previousData);
        }
        
        options?.onError?.(error as Error, variables, previousData);
        throw error;
      }
    }
  };
}

// Performance monitoring hook
export function useQueryPerformance(queryKey: string | string[]) {
  const startTime = useRef<number>();
  const endTime = useRef<number>();

  const query = useOptimizedQuery(queryKey, undefined, {
    onSuccess: () => {
      endTime.current = Date.now();
      if (startTime.current && endTime.current) {
        const duration = endTime.current - startTime.current;
        console.log(`Query ${Array.isArray(queryKey) ? queryKey.join(':') : queryKey} completed in ${duration}ms`);
      }
    }
  });

  useEffect(() => {
    if (query.isFetching && !startTime.current) {
      startTime.current = Date.now();
    }
  }, [query.isFetching]);

  return {
    ...query,
    duration: startTime.current && endTime.current 
      ? endTime.current - startTime.current 
      : undefined
  };
}