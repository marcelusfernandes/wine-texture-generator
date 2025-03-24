
import React, { useState } from "react";
import { Image, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
  onImageError: () => void;
  onViewImage: () => void;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt, 
  onImageError, 
  onViewImage 
}) => {
  if (!imageUrl) {
    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          <Image className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary">
          <AvatarImage 
            src={imageUrl} 
            alt={alt} 
            onError={onImageError}
          />
          <AvatarFallback>
            <Image className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={alt} 
            className="w-full h-auto max-h-64 object-contain"
            onError={onImageError}
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={onViewImage}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WineImageDisplay;
