import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProxiedImageUrl } from "@/utils/imageUtils";
import { WineInfo } from "@/components/TextInputs";

// Exportar esta função para ser usada por outros componentes
export const getProxyWithEditParams = (url: string, wineInfo: WineInfo, fileName: string, wineName: string = ''): string => {
  // Se a URL já está sendo proxy, não adicionar outra camada
  let baseUrl = url;
  if (!url.includes('localhost:3000/proxy') && !url.startsWith('data:')) {
    baseUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Adicionar parâmetros de edição
  const editParams = new URLSearchParams();
  
  // Adicionar informações do vinho para processamento no servidor
  editParams.append('download', 'true');
  editParams.append('filename', fileName);
  editParams.append('edit', 'true');
  editParams.append('wineType', wineInfo.type || '');
  editParams.append('wineOrigin', wineInfo.origin || '');
  editParams.append('wineTaste', wineInfo.taste || '');
  editParams.append('wineName', wineName || '');
  editParams.append('corkType', wineInfo.corkType || '');
  editParams.append('grape_variety', wineInfo.type || 'GRAPE VARIETY');
  
  // Retornar URL completa com parâmetros
  return `${baseUrl}&${editParams.toString()}`;
};

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
  wineInfo: WineInfo;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt,
  wineInfo
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proxiedUrl, setProxiedUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        setHasError(true);
      });
  }, [imageUrl]);

  const handleImageClick = (e: React.MouseEvent) => {
    // Prevenir o comportamento padrão
    e.preventDefault();
    e.stopPropagation();
    
    if (!proxiedUrl) {
      toast.error("Não há imagem disponível para download");
      return;
    }

    const fileName = `${alt.toLowerCase().replace(/\s+/g, '-')}.png`;
    toast.loading(`Processando imagem "${alt}"...`, {
      id: "image-processing",
      duration: 5000
    });
    
    try {
      // Gerar URL com todos os parâmetros para edição no servidor
      const editUrl = getProxyWithEditParams(proxiedUrl, wineInfo, fileName, alt);
      console.log(`[Download] Usando URL com edição: ${editUrl}`);
      
      // Usar iframe oculto para forçar download
      if (!iframeRef.current) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframeRef.current = iframe;
      }
      
      if (iframeRef.current) {
        iframeRef.current.src = editUrl;
        
        // Mostrar toast de sucesso após alguns segundos
        setTimeout(() => {
          toast.dismiss("image-processing");
          toast.success(`Imagem "${alt}" baixada com edições aplicadas`);
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.dismiss("image-processing");
      toast.error("Erro ao processar imagem");
    }
  };

  return (
    <div className="flex items-center justify-center">
      {/* iframe oculto para downloads */}
      <iframe ref={iframeRef} style={{ display: 'none' }} title="download-frame" />
      
      {proxiedUrl && !hasError ? (
        <div 
          className="relative cursor-pointer group" 
          onClick={handleImageClick}
          title="Clique para baixar a imagem com edições"
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
