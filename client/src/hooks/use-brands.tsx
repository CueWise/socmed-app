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
      return await apiRequest("/api/brands", {
        method: "POST",
        body: brandData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}

export function useUpdateBrand() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Brand> }) => {
      return await apiRequest(`/api/brands/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}

export function useDeleteBrand() {
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/brands/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}