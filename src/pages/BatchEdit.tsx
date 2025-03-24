
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import BatchEditHeader from '@/components/BatchEditHeader';
import BatchEditDescription from '@/components/BatchEditDescription';
import WineLabelsTable from '@/components/WineLabelsTable';
import { drawWineLabel } from '@/utils/canvasUtils';

const defaultWineInfo: WineInfo = {
  type: 'Cabernet Sauvignon',
  origin: 'França',
  taste: 'Seco',
  corkType: 'Rolha',
  info_base: ''
};

interface WineLabel {
  id: string;
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}

const BatchEdit = () => {
  const [labels, setLabels] = useState<WineLabel[]>([
    {
      id: '1',
      name: 'Rótulo de Vinho Tinto',
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    }
  ]);
  
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const addNewLabel = () => {
    const newId = (Math.max(0, ...labels.map(label => parseInt(label.id))) + 1).toString();
    const newLabel: WineLabel = {
      id: newId,
      name: `Rótulo de Vinho ${newId}`,
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    };
    
    setLabels([...labels, newLabel]);
    toast.success('Novo rótulo adicionado');
  };
  
  const handleCsvImport = (importedLabels: { name: string; imageUrl: string | null; wineInfo: WineInfo }[]) => {
    if (importedLabels.length === 0) {
      toast.error('Nenhum dado válido encontrado no CSV');
      return;
    }
    
    let nextId = Math.max(0, ...labels.map(label => parseInt(label.id))) + 1;
    
    const newLabels = importedLabels.map(imported => {
      console.log(`Processando rótulo importado: ${imported.name}`);
      if (imported.imageUrl) {
        console.log(`Imagem URL para ${imported.name}: ${imported.imageUrl}`);
      }
      
      return {
        id: (nextId++).toString(),
        name: imported.name,
        imageUrl: imported.imageUrl,
        wineInfo: imported.wineInfo
      };
    });
    
    setLabels(prevLabels => [...prevLabels, ...newLabels]);
    
    toast.success(`${newLabels.length} rótulos importados com sucesso`, {
      description: 'Você pode editar os detalhes de cada rótulo individualmente.'
    });
  };

  // Use a local image for export if available, fall back to placeholder image
  const getPlaceholderImage = (): HTMLImageElement => {
    const placeholderImg = new Image();
    placeholderImg.src = '/placeholder.svg';
    return placeholderImg;
  };

  const exportSelectedLabels = async () => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um rótulo para exportar');
      return;
    }

    // Setup canvas for exporting
    if (!canvasRef.current) {
      console.error('Canvas reference not found');
      toast.error('Erro ao preparar exportação');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      toast.error('Erro ao preparar exportação');
      return;
    }

    let exportCount = 0;
    const totalToExport = selectedLabels.length;
    
    // Process each selected label
    for (const labelId of selectedLabels) {
      const label = labels.find(l => l.id === labelId);
      if (!label) continue;

      // Skip labels with known image errors
      if (imageErrors[labelId]) {
        toast.error(`Rótulo "${label.name}" possui erro na imagem e não pode ser exportado`);
        continue;
      }

      const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
      if (!imageUrl) {
        toast.error(`Rótulo "${label.name}" não possui imagem para exportar`);
        continue;
      }

      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            // Draw the wine label
            drawWineLabel(ctx, img, label.wineInfo);
            
            // Create a download link
            const link = document.createElement('a');
            const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            exportCount++;
            resolve();
          };
          
          img.onerror = () => {
            console.error(`Error loading image for label "${label.name}"`);
            reject(new Error(`Erro ao carregar imagem para "${label.name}"`));
          };
          
          // Try to load the image with CORS proxy if needed
          let urlToTry = imageUrl;
          console.log(`Attempting to load image from: ${urlToTry}`);
          
          // Set a short timeout to catch CORS errors quickly
          const timeoutId = setTimeout(() => {
            console.log(`Timeout loading image for "${label.name}"`);
            
            // Fall back to a placeholder image rather than failing completely
            console.log(`Using placeholder image for "${label.name}"`);
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
            resolve();
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeoutId);
            
            // Draw the wine label
            drawWineLabel(ctx, img, label.wineInfo);
            
            // Create a download link
            const link = document.createElement('a');
            const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            exportCount++;
            resolve();
          };
          
          img.onerror = () => {
            clearTimeout(timeoutId);
            console.error(`Error loading image for label "${label.name}"`);
            
            // Use placeholder instead of failing
            console.log(`Using placeholder image after error for "${label.name}"`);
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
            resolve();
          };
          
          img.src = urlToTry;
        });
      } catch (error) {
        console.error('Export error:', error);
        
        // Even if there's an error, try to use placeholder
        try {
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
        } catch (fallbackError) {
          toast.error(`Erro ao exportar "${label.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }

    if (exportCount > 0) {
      toast.success(`${exportCount} de ${totalToExport} rótulos exportados com sucesso`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport}
          onExport={exportSelectedLabels}
          isExportDisabled={selectedLabels.length === 0}
        />

        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-up">
          <BatchEditDescription />
          <WineLabelsTable 
            labels={labels} 
            onUpdate={setLabels}
            selectedLabels={selectedLabels}
            onSelectionChange={setSelectedLabels}
          />
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas 
        ref={canvasRef} 
        width={1080} 
        height={1080} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BatchEdit;
