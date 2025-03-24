
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import { drawWineLabel } from '@/utils/canvasUtils';

interface WineExporterProps {
  selectedLabels: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    wineInfo: WineInfo;
  }>;
  isExporting: boolean;
  onExportComplete: () => void;
}

const WineExporter: React.FC<WineExporterProps> = ({
  selectedLabels,
  isExporting,
  onExportComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // This function is called from the parent component when export is requested
  React.useEffect(() => {
    if (isExporting && selectedLabels.length > 0) {
      exportSelectedLabels();
    }
  }, [isExporting, selectedLabels]);

  const getPlaceholderImage = (): HTMLImageElement => {
    const placeholderImg = new Image();
    placeholderImg.src = '/placeholder.svg';
    return placeholderImg;
  };

  const exportSelectedLabels = async () => {
    if (!canvasRef.current) {
      console.error('Canvas reference not found');
      toast.error('Erro ao preparar exportação');
      onExportComplete();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      toast.error('Erro ao preparar exportação');
      onExportComplete();
      return;
    }

    let exportCount = 0;
    const totalToExport = selectedLabels.length;
    setProgress({ current: 0, total: totalToExport });
    
    for (const label of selectedLabels) {
      const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
      if (!imageUrl) {
        toast.error(`Rótulo "${label.name}" não possui imagem para exportar`);
        continue;
      }

      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          const timeoutId = setTimeout(() => {
            console.log(`Timeout loading image for "${label.name}"`);
            toast.warning(`Tempo esgotado ao carregar imagem para "${label.name}". Usando imagem padrão.`);
            
            const placeholderImg = getPlaceholderImage();
            drawWineLabel(ctx, placeholderImg, label.wineInfo);
            
            const link = document.createElement('a');
            const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            exportCount++;
            setProgress(prev => ({ ...prev, current: exportCount }));
            resolve();
          }, 5000);
          
          img.onload = () => {
            clearTimeout(timeoutId);
            console.log(`Successfully loaded image for "${label.name}"`);
            
            drawWineLabel(ctx, img, label.wineInfo);
            
            const link = document.createElement('a');
            const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            exportCount++;
            setProgress(prev => ({ ...prev, current: exportCount }));
            resolve();
          };
          
          img.onerror = () => {
            clearTimeout(timeoutId);
            console.error(`Error loading image for label "${label.name}" from URL: ${imageUrl}`);
            toast.warning(`Erro ao carregar imagem para "${label.name}". Usando imagem padrão.`);
            
            const placeholderImg = getPlaceholderImage();
            drawWineLabel(ctx, placeholderImg, label.wineInfo);
            
            const link = document.createElement('a');
            const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            exportCount++;
            setProgress(prev => ({ ...prev, current: exportCount }));
            resolve();
          };
          
          img.src = imageUrl;
        });
      } catch (error) {
        console.error('Export error:', error);
        toast.error(`Erro ao exportar "${label.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    if (exportCount > 0) {
      toast.success(`${exportCount} de ${totalToExport} rótulos exportados com sucesso`);
    }
    
    onExportComplete();
  };

  return (
    <div className="hidden">
      <canvas 
        ref={canvasRef} 
        width={1080} 
        height={1080} 
      />
      {isExporting && progress.total > 0 && (
        <div aria-live="polite" className="sr-only">
          Exportando {progress.current} de {progress.total} rótulos
        </div>
      )}
    </div>
  );
};

export default WineExporter;
