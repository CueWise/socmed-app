import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";

interface AnalyticsSummary {
  totalReach: number;
  totalEngagement: number;
  totalPosts: number;
  totalViews: number;
}

export function useAnalytics(postId?: number, platform?: string) {
  return useQuery<Analytics[]>({
    queryKey: ["/api/analytics", postId, platform].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postId) params.set("postId", postId.toString());
      if (platform) params.set("platform", platform);
      
      const response = await fetch(`/api/analytics?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      
      return response.json();
    },
  });
}

export function useAnalyticsSummary(
  brandId: number, 
  startDate: Date, 
  endDate: Date
) {
  return useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary", brandId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      
      const response = await fetch(`/api/analytics/summary/${brandId}?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics summary");
      }
      
      return response.json();
    },
  });
}
