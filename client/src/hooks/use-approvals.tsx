import { useQuery } from "@tanstack/react-query";
import type { Approval } from "@shared/schema";

export function useApprovals(postId?: number, status?: string) {
  return useQuery<Approval[]>({
    queryKey: ["/api/approvals", postId, status].filter(Boolean),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postId) params.set("postId", postId.toString());
      if (status) params.set("status", status);
      
      const response = await fetch(`/api/approvals?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch approvals");
      }
      
      return response.json();
    },
  });
}
