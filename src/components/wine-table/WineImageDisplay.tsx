
import React from "react";
import { Image, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
  onImageError: () => void;
  onViewImage: () => void;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt, 
  onImageError, 
  onViewImage 
}) => {
  // Para diagnóstico - vamos logar a URL da imagem
  console.log(`[WineImageDisplay] Recebeu URL para "${alt}": ${imageUrl || 'null'}`);
  
  React.useEffect(() => {
    if (imageUrl) {
      // Verifica se a URL parece válida
      console.log(`[WineImageDisplay] Analisando URL da imagem para "${alt}": ${imageUrl}`);
      
      try {
        new URL(imageUrl);
        console.log(`[WineImageDisplay] URL válida para "${alt}"`);
      } catch (error) {
        console.error(`[WineImageDisplay] URL inválida para "${alt}": ${imageUrl}`, error);
      }
    }
  }, [imageUrl, alt]);
  
  if (!imageUrl) {
    console.log(`[WineImageDisplay] Sem URL definida para "${alt}", mostrando fallback`);
    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          <Image className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
    );
  }

  const handleImageLoadSuccess = () => {
    console.log(`[WineImageDisplay] Imagem carregada com sucesso para "${alt}": ${imageUrl}`);
  };

  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`[WineImageDisplay] Erro ao carregar imagem para "${alt}": ${imageUrl}`, e);
    onImageError();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary">
          <AvatarImage 
            src={imageUrl} 
            alt={alt} 
            onError={handleImageLoadError}
            onLoad={handleImageLoadSuccess}
          />
          <AvatarFallback>
            <Image className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={alt} 
            className="w-full h-auto max-h-64 object-contain"
            onError={handleImageLoadError}
            onLoad={handleImageLoadSuccess}
          />
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={onViewImage}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WineImageDisplay;

