
import React, { useState, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageClick = () => {
    // Se temos uma imagem local (que foi carregada pelo usuário), use-a diretamente
    if (localImage) {
      generateAndDownloadImage(localImage);
      return;
    }

    // Se não há imagem ou houve erro, exiba o seletor de arquivos
    if (!imageUrl || hasError) {
      document.getElementById(`file-upload-${alt}`)?.click();
      return;
    }

    // Caso contrário, tente gerar e baixar uma nova imagem a partir da miniatura
    generateAndDownloadImage(imageUrl);
  };

  const generateAndDownloadImage = (imgSrc: string) => {
    try {
      // Criamos uma nova imagem a partir da fonte
      const img = new Image();
      
      // Se for uma data URL, podemos carregá-la diretamente
      if (imgSrc.startsWith('data:')) {
        img.onload = () => renderAndDownloadCanvas(img);
        img.src = imgSrc;
        return;
      }
      
      // Se for URL remota, tentamos criar uma cópia local primeiro
      img.crossOrigin = "anonymous";
      
      const timeoutId = setTimeout(() => {
        toast.error("Tempo esgotado ao tentar carregar a imagem");
        useFallbackImage();
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        renderAndDownloadCanvas(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Erro ao carregar imagem para exportação:", imgSrc);
        useFallbackImage();
      };
      
      img.src = imgSrc;
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      toast.error("Erro ao exportar imagem");
      useFallbackImage();
    }
  };
  
  const renderAndDownloadCanvas = (img: HTMLImageElement) => {
    if (!canvasRef.current) {
      toast.error("Erro ao preparar tela para exportação");
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Erro ao criar contexto para exportação");
      return;
    }
    
    // Definir as dimensões do canvas
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Desenhar apenas a imagem de fundo (sem sobreposições)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Criar link de download
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Erro ao converter a imagem");
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
        
        toast.success(`Imagem "${alt}" exportada com sucesso`);
      }, 'image/png');
    } catch (error) {
      console.error("Erro ao exportar canvas:", error);
      toast.error("Erro ao exportar imagem");
    }
  };
  
  const useFallbackImage = () => {
    // Usar imagem local de amostra quando CORS bloqueia
    toast.error("Não foi possível carregar a imagem remota devido a restrições CORS", {
      description: "Clique novamente para fazer upload de uma imagem local"
    });
    setHasError(true);
    document.getElementById(`file-upload-${alt}`)?.click();
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
      {/* Canvas escondido para exportação */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {effectiveImageUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={handleImageClick}
          title={localImage ? "Clique para exportar a imagem (carregada localmente)" : "Clique para gerar e exportar uma nova imagem"}
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
