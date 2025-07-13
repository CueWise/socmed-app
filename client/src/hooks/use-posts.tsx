import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { useBrand } from "./use-brand";

export function usePosts(brandId?: number, status?: string) {
  const { brandId: selectedBrandId } = useBrand();
  const effectiveBrandId = brandId || selectedBrandId;
  
  return useQuery<Post[]>({
    queryKey: ["/api/posts", effectiveBrandId, status].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (effectiveBrandId) params.set("brandId", effectiveBrandId.toString());
      if (status) params.set("status", status);
      
      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      return response.json();
    },
    staleTime: 0, // Always refetch for fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
}

export function usePost(id: number) {
  return useQuery<Post>({
    queryKey: ["/api/posts", id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      
      return response.json();
    },
  });
}

export function useCalendarPosts(startDate: Date, endDate: Date, brandId?: number) {
  const { brandId: selectedBrandId } = useBrand();
  const effectiveBrandId = brandId || selectedBrandId;
  
  return useQuery<Post[]>({
    queryKey: ["/api/calendar/posts", startDate.toISOString(), endDate.toISOString(), effectiveBrandId].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      
      if (effectiveBrandId) {
        params.set("brandId", effectiveBrandId.toString());
      }
      
      const response = await fetch(`/api/calendar/posts?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch calendar posts");
      }
      
      return response.json();
    },
  });
}
