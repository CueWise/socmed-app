import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaThumbnailProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackText?: string;
}

export default function MediaThumbnail({ 
  src, 
  alt = "", 
  className = "", 
  fallbackText = "IMG" 
}: MediaThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError || !src || src.startsWith('blob:')) {
    return (
      <div className={cn(
        "bg-gray-300 flex items-center justify-center",
        className
      )}>
        <span className="text-[6px] text-gray-500 font-medium">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}