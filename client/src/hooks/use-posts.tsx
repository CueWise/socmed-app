import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";

export function usePosts(brandId?: number, status?: string) {
  return useQuery<Post[]>({
    queryKey: ["/api/posts", brandId, status].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (brandId) params.set("brandId", brandId.toString());
      if (status) params.set("status", status);
      
      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      return response.json();
    },
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
  return useQuery<Post[]>({
    queryKey: ["/api/calendar/posts", startDate.toISOString(), endDate.toISOString(), brandId].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      
      if (brandId) {
        params.set("brandId", brandId.toString());
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
