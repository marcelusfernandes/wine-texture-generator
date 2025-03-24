
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageClick = () => {
    if (!imageUrl || hasError) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      // Create a new image from the thumbnail using canvas
      if (imgRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Set canvas dimensions to match the original image
          canvas.width = imgRef.current.naturalWidth || 300;
          canvas.height = imgRef.current.naturalHeight || 300;
          
          // Draw the image onto the canvas
          ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png');
          
          // Create download link
          const link = document.createElement('a');
          link.href = dataUrl;
          const filename = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.download = filename;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`Imagem "${alt}" gerada e baixada com sucesso`);
        }
      } else {
        throw new Error("Referência à imagem ou canvas não encontrada");
      }
    } catch (error) {
      console.error("Error generating and downloading image:", error);
      toast.error("Erro ao gerar e baixar a imagem");
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
            ref={imgRef}
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
            crossOrigin="anonymous"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
              <ImageIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
            <Download className="h-4 w-4 text-white" />
          </div>
          
          {/* Hidden canvas for image generation */}
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }}
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
