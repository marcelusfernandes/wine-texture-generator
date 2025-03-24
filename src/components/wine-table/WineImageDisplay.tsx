
import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProxiedImageUrl } from "@/utils/imageUtils";

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
  const [proxiedUrl, setProxiedUrl] = useState<string | null>(null);

  // When imageUrl changes, try to proxy it
  useEffect(() => {
    if (!imageUrl) {
      setProxiedUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Try to get a proxied version of the image
    getProxiedImageUrl(imageUrl)
      .then(url => {
        setProxiedUrl(url);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error proxying image:", err);
        setProxiedUrl(imageUrl); // Fallback to original URL
        setIsLoading(false);
      });
  }, [imageUrl]);

  const handleImageClick = () => {
    if (!proxiedUrl || hasError) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      // The image should already be a data URL from the proxy
      // so we can download it directly
      const link = document.createElement('a');
      link.href = proxiedUrl;
      
      const filename = imageUrl?.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Imagem "${alt}" baixada com sucesso`);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Erro ao baixar a imagem");
    }
  };

  return (
    <div className="flex items-center justify-center">
      {proxiedUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={handleImageClick}
          title="Clique para baixar a imagem"
        >
          <img 
            src={proxiedUrl} 
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
