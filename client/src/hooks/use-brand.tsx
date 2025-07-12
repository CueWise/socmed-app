import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Brand } from "@shared/schema";

interface BrandStore {
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  clearBrand: () => void;
  brandId?: number;
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      selectedBrand: null,
      setSelectedBrand: (brand) => set({ selectedBrand: brand }),
      clearBrand: () => set({ selectedBrand: null }),
      get brandId() {
        return get().selectedBrand?.id;
      },
    }),
    {
      name: "brand-store",
    }
  )
);

export function useBrand() {
  return useBrandStore();
}