import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";
import { useBrand } from "./use-brand";

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
  brandId?: number, 
  startDate?: Date, 
  endDate?: Date
) {
  const { brandId: selectedBrandId } = useBrand();
  const effectiveBrandId = brandId || selectedBrandId;
  const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const defaultEndDate = endDate || new Date();
  
  return useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary", effectiveBrandId, defaultStartDate.toISOString(), defaultEndDate.toISOString()],
    queryFn: async () => {
      if (!effectiveBrandId) {
        return {
          totalReach: 0,
          totalEngagement: 0,
          totalPosts: 0,
          totalViews: 0
        };
      }
      
      const params = new URLSearchParams({
        start: defaultStartDate.toISOString(),
        end: defaultEndDate.toISOString(),
      });
      
      const response = await fetch(`/api/analytics/summary/${effectiveBrandId}?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics summary");
      }
      
      return response.json();
    },
    enabled: !!effectiveBrandId
  });
}
