import { useState } from "react";
import { PlayCircle, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramMediaThumbnailProps {
  src: string;
  alt?: string;
  className?: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export default function InstagramMediaThumbnail({ 
  src, 
  alt = "", 
  className = "",
  onRemove,
  showRemoveButton = true
}: InstagramMediaThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Detect file type from URL or blob
  const getFileType = (url: string) => {
    if (!url) return 'unknown';
    
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp', '.flv', '.wmv', '.m4v'];
    const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];
    
    const lowerUrl = url.toLowerCase();
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) return 'video';
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) return 'audio';
    
    return 'image'; // Default to image for blobs and unknown types
  };

  const fileType = getFileType(src);

  if (hasError || !src) {
    return (
      <div className={cn(
        "aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative",
        className
      )}>
        <span className="text-sm text-gray-500 font-medium">
          Failed to load
        </span>
        {showRemoveButton && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200", className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Media content */}
      {fileType === 'video' ? (
        <div className="relative w-full h-full">
          <video
            src={src}
            className="w-full h-full object-cover"
            onError={handleError}
            onLoadedData={handleLoad}
            muted
            playsInline
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>
      ) : fileType === 'audio' ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
          <Volume2 className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
      
      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}