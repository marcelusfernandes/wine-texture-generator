
import React, { useState, useRef } from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import html2canvas from "html2canvas";

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
  const imageRef = useRef<HTMLImageElement>(null);

  const captureAndDownloadImage = async () => {
    if (!imageUrl || hasError || !imageRef.current) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    try {
      // Indicar que o processo começou
      setIsLoading(true);
      toast.info("Preparando a imagem para download...");
      
      // Usar html2canvas para capturar a imagem
      const canvas = await html2canvas(imageRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Melhor qualidade
        logging: false
      });
      
      // Converter para PNG
      const imageData = canvas.toDataURL('image/png');
      
      // Criar um link para download
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
      
      // Iniciar o download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Imagem "${alt}" capturada e baixada com sucesso`);
    } catch (error) {
      console.error("Erro ao capturar imagem:", error);
      toast.error("Erro ao capturar e baixar a imagem");
      
      // Tentativa de fallback com método anterior
      try {
        // Criar um canvas manualmente
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !imageRef.current) {
          throw new Error("Contexto de canvas indisponível");
        }
        
        // Configurar tamanho do canvas baseado na imagem
        canvas.width = imageRef.current.naturalWidth || imageRef.current.width;
        canvas.height = imageRef.current.naturalHeight || imageRef.current.height;
        
        // Desenhar a imagem no canvas
        ctx.drawImage(imageRef.current, 0, 0);
        
        try {
          // Exportar como PNG
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`Imagem "${alt}" baixada com sucesso (fallback)`);
        } catch (err) {
          console.error("Erro no fallback:", err);
          toast.error("Erro ao exportar imagem");
        }
      } catch (fallbackError) {
        console.error("Erro no método fallback:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    captureAndDownloadImage();
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
            ref={imageRef}
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
