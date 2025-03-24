
import React, { useState } from "react";
import { Image as ImageIcon, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { drawWineLabel } from "@/utils/canvasUtils";

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
  const [localImage, setLocalImage] = useState<string | null>(null);

  const handleImageClick = () => {
    // Se temos uma imagem local (que foi carregada pelo usuário), use-a diretamente
    if (localImage) {
      downloadImage(localImage);
      return;
    }

    // Se não há imagem ou houve erro, exiba o seletor de arquivos
    if (!imageUrl || hasError) {
      document.getElementById(`file-upload-${alt}`)?.click();
      return;
    }

    // Caso contrário, tente baixar a imagem remota
    downloadImage(imageUrl);
  };

  const downloadImage = (imgSrc: string) => {
    try {
      // Create a temporary canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Não foi possível criar o contexto de canvas");
        return;
      }

      // Set initial canvas size (will be adjusted when image loads)
      canvas.width = 500;
      canvas.height = 500;

      const img = new Image();
      img.crossOrigin = "anonymous"; // Try to handle CORS
      
      img.onload = () => {
        // Resize canvas to match the loaded image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error("Erro ao converter a imagem");
            return;
          }

          // Create download link
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Extract filename from URL or use alt text
          const filename = imgSrc.split('/').pop() || `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.download = filename;
          link.href = blobUrl;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(link);
          
          toast.success(`Imagem "${alt}" exportada com sucesso`);
        }, 'image/png');
      };
      
      img.onerror = () => {
        console.error("Erro ao carregar imagem para exportação:", imgSrc);
        
        if (!localImage && imgSrc === imageUrl) {
          toast.error("Erro ao carregar a imagem. Tente fazer upload manual.", {
            description: "Clique novamente para selecionar um arquivo local."
          });
          setHasError(true);
          return;
        }
        
        // Alternative approach for CORS-restricted images
        // Create a new canvas to draw just a basic representation
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Imagem não disponível devido a restrições de CORS', canvas.width/2, canvas.height/2);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error("Erro ao gerar a imagem alternativa");
            return;
          }
          
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.href = blobUrl;
          
          document.body.appendChild(link);
          link.click();
          
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(link);
          
          toast.warning(`Exportada versão alternativa da imagem devido a restrições de CORS`);
        }, 'image/png');
      };
      
      // Attempt to load the image
      img.src = imgSrc;
      
      // Timeout for slow-loading images
      setTimeout(() => {
        if (!img.complete) {
          img.src = ''; // Cancel the image load
          toast.error("Tempo esgotado ao tentar carregar a imagem");
        }
      }, 10000);
    } catch (error) {
      console.error("Error initiating export:", error);
      toast.error("Erro ao iniciar a exportação da imagem");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLocalImage(result);
        setHasError(false);
        toast.success(`Imagem "${file.name}" carregada com sucesso`);
      }
    };
    
    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo de imagem");
    };
    
    reader.readAsDataURL(file);
  };

  const effectiveImageUrl = localImage || imageUrl;

  return (
    <div className="flex items-center justify-center">
      {effectiveImageUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={handleImageClick}
          title={localImage ? "Clique para exportar a imagem (carregada localmente)" : "Clique para exportar a imagem"}
        >
          <img 
            src={effectiveImageUrl}
            alt={alt}
            className={cn(
              "h-10 w-10 object-cover rounded",
              isLoading && !localImage && "opacity-0"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.log(`Error loading thumbnail for "${alt}"`);
              setHasError(true);
              setIsLoading(false);
            }}
          />
          {isLoading && !localImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
              <ImageIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
            <Download className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <div 
          className="h-10 w-10 flex items-center justify-center bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={handleImageClick}
          title="Clique para fazer upload de uma imagem"
        >
          {hasError ? (
            <Upload className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Input de arquivo escondido */}
      <input 
        type="file"
        id={`file-upload-${alt}`}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default WineImageDisplay;
