import { useState } from "react";
import { ImageIcon, PlayCircle, Volume2 } from "lucide-react";
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
  fallbackText = "MEDIA" 
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

  // Detect file type from URL or blob
  const getFileType = (url: string) => {
    if (!url) return 'unknown';
    
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp', '.flv', '.wmv', '.m4v'];
    const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.tiff', '.bmp', '.svg'];
    
    const lowerUrl = url.toLowerCase();
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) return 'video';
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) return 'audio';
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) return 'image';
    
    return 'image'; // Default to image for blobs and unknown types
  };

  const fileType = getFileType(src);

  if (hasError || !src) {
    return (
      <div className={cn(
        "bg-gray-300 flex items-center justify-center flex-col gap-1",
        className
      )}>
        <span className="text-[8px] text-gray-500 font-medium">
          {fallbackText}
        </span>
      </div>
    );
  }

  // Handle blob URLs (show preview with play icon for videos)
  if (src.startsWith('blob:')) {
    return (
      <div className={cn("relative overflow-hidden bg-gray-200 flex items-center justify-center", className)}>
        {fileType === 'video' ? (
          <>
            <PlayCircle className="w-6 h-6 text-gray-600" />
            <span className="absolute bottom-1 right-1 text-[6px] bg-black bg-opacity-50 text-white px-1 rounded">
              VIDEO
            </span>
          </>
        ) : fileType === 'audio' ? (
          <>
            <Volume2 className="w-6 h-6 text-gray-600" />
            <span className="absolute bottom-1 right-1 text-[6px] bg-black bg-opacity-50 text-white px-1 rounded">
              AUDIO
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-600 font-medium">IMG</span>
            <span className="absolute bottom-1 right-1 text-[6px] bg-black bg-opacity-50 text-white px-1 rounded">
              IMAGE
            </span>
          </>
        )}
      </div>
    );
  }

  // Render video element for video files
  if (fileType === 'video') {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-gray-600" />
          </div>
        )}
        <video
          src={src}
          className="w-full h-full object-cover"
          onError={handleError}
          onLoadedData={handleLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PlayCircle className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        <span className="absolute bottom-1 right-1 text-[6px] bg-black bg-opacity-50 text-white px-1 rounded">
          VIDEO
        </span>
      </div>
    );
  }

  // Render audio placeholder for audio files
  if (fileType === 'audio') {
    return (
      <div className={cn("relative overflow-hidden bg-gray-300 flex items-center justify-center", className)}>
        <Volume2 className="w-6 h-6 text-gray-600" />
        <span className="absolute bottom-1 right-1 text-[6px] bg-black bg-opacity-50 text-white px-1 rounded">
          AUDIO
        </span>
      </div>
    );
  }

  // Default image rendering
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