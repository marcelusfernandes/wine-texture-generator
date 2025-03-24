
import React, { useState } from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const handleImageClick = () => {
    if (!imageUrl || hasError) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      // Create a canvas element to draw the image (can bypass CORS issues)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx?.drawImage(img, 0, 0);
        
        try {
          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png');
          
          // Create download link
          const link = document.createElement('a');
          link.href = dataUrl;
          
          // Extract filename from URL or use alt text
          const filename = imageUrl.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.download = filename;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`Imagem "${alt}" baixada com sucesso`);
        } catch (e) {
          console.error("Error creating download from canvas:", e);
          fallbackDownload();
        }
      };
      
      img.onerror = fallbackDownload;
      
      // Set image source to trigger loading
      img.src = imageUrl;
      
      // Fallback method using direct link
      function fallbackDownload() {
        const link = document.createElement('a');
        link.href = imageUrl;
        
        const filename = imageUrl.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Imagem "${alt}" baixada com sucesso`);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Erro ao baixar a imagem");
    }
  };

  return (
    <div className="flex items-center justify-center">
      {imageUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={handleImageClick}
          title="Clique para baixar a imagem"
        >
          <img 
            src={imageUrl} 
            alt={alt}
            className={cn(
              "h-10 w-10 object-cover rounded",
              isLoading && "opacity-0"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.log(`Error loading thumbnail for "${alt}"`);
              setHasError(true);
              setIsLoading(false);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
              <ImageIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
            <Download className="h-4 w-4 text-white" />
          </div>
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
