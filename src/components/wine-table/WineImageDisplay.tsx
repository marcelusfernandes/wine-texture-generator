
import React, { useState, useRef } from "react";
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
  const imgRef = useRef<HTMLImageElement>(null);

  const captureAndDownloadImage = () => {
    if (!imageUrl || hasError) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      // If we have a reference to the loaded image
      if (imgRef.current) {
        // Create a canvas with the same dimensions as the image
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;
        
        // Draw the image onto the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgRef.current, 0, 0);
          
          // Convert the canvas to a data URL and trigger download
          try {
            const dataUrl = canvas.toDataURL('image/png');
            const filename = imageUrl.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            // Create a download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Imagem "${alt}" baixada com sucesso`);
          } catch (e) {
            console.error("Error generating data URL:", e);
            toast.error("Não foi possível processar a imagem devido a restrições de segurança");
          }
        }
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Erro ao processar a imagem");
    }
  };

  return (
    <div className="flex items-center justify-center">
      {imageUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={captureAndDownloadImage}
          title="Clique para baixar a imagem"
        >
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt={alt}
            className={cn(
              "h-10 w-10 object-cover rounded",
              isLoading && "opacity-0"
            )}
            onLoad={() => setIsLoading(false)}
            crossOrigin="anonymous"
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
