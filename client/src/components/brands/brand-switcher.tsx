import { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrands } from "@/hooks/use-brands";
import { useBrand } from "@/hooks/use-brand";
import BrandCreateModal from "./brand-create-modal";

export default function BrandSwitcher() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: brands = [], isLoading } = useBrands();
  const { selectedBrand, setSelectedBrand } = useBrand();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const currentBrand = selectedBrand || brands[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-3 h-auto"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {currentBrand?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium truncate max-w-[120px]">
                  {currentBrand?.name || "Select Brand"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {brands.length} brand{brands.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Switch Brand</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {brands.map((brand) => (
            <DropdownMenuItem
              key={brand.id}
              className="flex items-center space-x-3 p-3"
              onClick={() => setSelectedBrand(brand)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {brand.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{brand.name}</div>
                {brand.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {brand.description}
                  </div>
                )}
              </div>
              {currentBrand?.id === brand.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center space-x-3 p-3"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <Plus className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-sm font-medium">Create new brand</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <BrandCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={(brand) => {
          setSelectedBrand(brand);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}