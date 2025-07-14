import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Brand, InsertBrand } from "@shared/schema";

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    queryFn: async () => {
      const response = await fetch("/api/brands", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      
      return response.json();
    },
  });
}

export function useBrand(id: number) {
  return useQuery<Brand>({
    queryKey: ["/api/brands", id],
    queryFn: async () => {
      const response = await fetch(`/api/brands/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch brand");
      }
      
      return response.json();
    },
  });
}

export function useCreateBrand() {
  return useMutation({
    mutationFn: async (brandData: InsertBrand) => {
      const response = await apiRequest("POST", "/api/brands", brandData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}

export function useUpdateBrand() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Brand> }) => {
      const response = await apiRequest("PATCH", `/api/brands/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}

export function useDeleteBrand() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/brands/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}