
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void;
  className?: string;
  currentImageUrl?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  className,
  currentImageUrl 
}) => {
  const [dragging, setDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error('Por favor, faça upload de um arquivo de imagem');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const preview = e.target.result as string;
        setHasError(false);
        onImageUpload(file, preview);
        toast.success(`Imagem "${file.name}" carregada com sucesso`);
      }
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo de imagem');
      setHasError(true);
    };
    reader.readAsDataURL(file);
  };

  // Tentar recarregar imagem remota atual
  const handleReloadCurrentImage = async () => {
    if (!currentImageUrl) return;
    
    try {
      // Tenta fazer fetch da imagem como blob
      const response = await fetch(currentImageUrl, { mode: 'no-cors' });
      const blob = await response.blob();
      
      // Cria um objeto File do blob
      const filename = currentImageUrl.split('/').pop() || 'image.jpg';
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      
      // Processa o arquivo como um upload normal
      processFile(file);
      toast.success('Imagem carregada do servidor com sucesso');
    } catch (error) {
      console.error('Erro ao carregar imagem do servidor:', error);
      toast.error('Erro ao carregar imagem do servidor. Tente fazer upload manual.', {
        description: 'A imagem pode estar protegida por CORS ou indisponível.'
      });
      setHasError(true);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-60 transition-all duration-300",
        "border-2 border-dashed rounded-xl p-6",
        dragging ? "border-primary bg-primary/5" : hasError ? "border-destructive/50 bg-destructive/5" : "border-border bg-secondary/50",
        "animate-fade-in", 
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {hasError ? (
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileWarning className="h-8 w-8 text-destructive" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
        )}
        <div>
          {hasError ? (
            <>
              <p className="font-medium text-lg text-destructive">Erro ao carregar imagem</p>
              <p className="text-sm text-muted-foreground">Tente fazer upload manual de uma imagem local</p>
            </>
          ) : (
            <>
              <p className="font-medium text-lg">Arraste e solte sua imagem de vinho</p>
              <p className="text-sm text-muted-foreground">ou clique para navegar em seus arquivos</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos suportados: JPG, PNG, GIF, WEBP</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="mt-2">
            Selecionar Imagem
          </Button>
          {currentImageUrl && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleReloadCurrentImage}
              type="button"
            >
              Recarregar URL atual
            </Button>
          )}
        </div>
      </div>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/jpeg,image/png,image/gif,image/webp"
      />
    </div>
  );
};

export default ImageUploader;
