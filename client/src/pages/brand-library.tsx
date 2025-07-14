import React, { useState } from "react";
import BrandLibrary from "@/components/brands/brand-library";

export default function BrandLibraryPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-full">
      <BrandLibrary open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}