
import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Log the image URL for debugging
  console.log(`WineImageDisplay rendering: URL=${imageUrl}, alt=${alt}`);

  return (
    <div className="flex items-center justify-center">
      {imageUrl && !hasError ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={alt}
            crossOrigin="anonymous"
            className={cn(
              "h-10 w-10 object-cover rounded",
              isLoading && "opacity-0"
            )}
            onLoad={() => {
              console.log(`Thumbnail loaded successfully: ${alt}`);
              setIsLoading(false);
            }}
            onError={() => {
              console.log(`Error loading thumbnail for "${alt}" from URL: ${imageUrl}`);
              setHasError(true);
              setIsLoading(false);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
              <ImageIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default WineImageDisplay;
