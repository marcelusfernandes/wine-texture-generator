
import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WineImageDisplayProps {
  imageUrl: string | null;
  alt: string;
}

const WineImageDisplay: React.FC<WineImageDisplayProps> = ({ 
  imageUrl, 
  alt 
}) => {
  return (
    <div className="flex items-center gap-2">
      {imageUrl ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={alt}
            className="h-10 w-10 object-cover rounded" 
            onError={(e) => {
              // Em caso de erro de carregamento, mostrar o ícone
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-muted rounded">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={imageUrl || 'Sem URL'}>
        {imageUrl ? 'URL da imagem' : 'Sem URL'}
      </span>
    </div>
  );
};

export default WineImageDisplay;
