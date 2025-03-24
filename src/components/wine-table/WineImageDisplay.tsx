
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fetchAndDownloadImage = async () => {
    if (!imageUrl || hasError) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      setIsLoading(true);
      
      // Tentar fazer o fetch da imagem para contornar problemas de CORS
      const response = await fetch(imageUrl, { mode: 'cors' })
        .catch(() => {
          // Se falhar com cors, tentar sem cors (para imagens locais)
          return fetch(imageUrl);
        });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Converter a resposta em um blob
      const blob = await response.blob();
      
      // Criar uma URL para o blob
      const blobUrl = URL.createObjectURL(blob);
      setDownloadUrl(blobUrl);
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extrair nome do arquivo da URL ou usar o texto alt
      const filename = imageUrl.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.download = filename;
      
      // Acionar o download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar a URL do objeto após um curto atraso
      setTimeout(() => {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          setDownloadUrl(null);
        }
      }, 100);
      
      toast.success(`Imagem "${alt}" baixada com sucesso`);
    } catch (error) {
      console.error("Error downloading image:", error);
      
      // Alternativa: tentar renderizar em canvas se o fetch falhar
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Não foi possível criar contexto de canvas");
        }
        
        // Criar imagem temporária
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Configurar tamanho do canvas
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Desenhar a imagem no canvas
          ctx.drawImage(img, 0, 0);
          
          // Converter para data URL e iniciar download
          try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Imagem "${alt}" baixada com sucesso (via canvas)`);
          } catch (canvasError) {
            console.error("Canvas export error:", canvasError);
            toast.error("Erro ao exportar imagem do canvas");
          }
        };
        
        img.onerror = () => {
          toast.error("Não foi possível renderizar a imagem em canvas");
        };
        
        img.src = imageUrl;
      } catch (canvasError) {
        console.error("Canvas fallback error:", canvasError);
        toast.error("Erro ao baixar a imagem (CORS bloqueado)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fetchAndDownloadImage();
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
