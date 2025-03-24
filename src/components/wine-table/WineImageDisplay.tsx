
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
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          // Create object URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create temporary link for download
          const link = document.createElement('a');
          link.href = blobUrl;
          
          // Extract filename from URL or use alt text
          const filename = imageUrl.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.download = filename;
          
          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(link);
          
          toast.success(`Imagem "${alt}" baixada com sucesso`);
        })
        .catch(error => {
          console.error("Error downloading image:", error);
          toast.error("Erro ao baixar a imagem");
        });
    } catch (error) {
      console.error("Error initiating download:", error);
      toast.error("Erro ao iniciar o download da imagem");
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
