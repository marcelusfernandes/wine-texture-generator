
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

  return (
    <div className="flex items-center justify-center">
      {imageUrl && !hasError ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={alt}
            className="h-10 w-10 object-cover rounded" 
            onError={() => {
              console.log(`Error loading thumbnail for "${alt}"`);
              setHasError(true);
            }}
          />
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
