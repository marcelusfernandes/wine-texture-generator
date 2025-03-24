import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import BatchEditHeader from '@/components/BatchEditHeader';
import BatchEditDescription from '@/components/BatchEditDescription';
import WineLabelsTable from '@/components/WineLabelsTable';
import { drawWineLabel, drawErrorState } from '@/utils/canvasUtils';

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
  const [exporting, setExporting] = useState(false);
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

  const getPlaceholderImage = (): HTMLImageElement => {
    const placeholderImg = new Image();
    placeholderImg.src = '/placeholder.svg';
    return placeholderImg;
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => resolve(img);
      
      img.onerror = () => {
        console.error(`Error loading image from URL: ${url}`);
        reject(new Error(`Failed to load image from ${url}`));
      };
      
      img.src = url;
      
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Image load timeout'));
        }
      }, 8000);
    });
  };

  const exportSelectedLabels = async () => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um rótulo para exportar');
      return;
    }

    if (!canvasRef.current) {
      console.error('Canvas reference not found');
      toast.error('Erro ao preparar exportação');
      return;
    }

    setExporting(true);
    toast.info(`Preparando ${selectedLabels.length} rótulos para exportação...`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      toast.error('Erro ao preparar exportação');
      setExporting(false);
      return;
    }

    let exportCount = 0;
    const totalToExport = selectedLabels.length;
    const failedExports: string[] = [];
    
    for (const labelId of selectedLabels) {
      const label = labels.find(l => l.id === labelId);
      if (!label) continue;

      const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
      if (!imageUrl) {
        toast.error(`Rótulo "${label.name}" não possui imagem para exportar`);
        failedExports.push(label.name);
        continue;
      }

      try {
        let img: HTMLImageElement;
        try {
          console.log(`Attempting to load image for "${label.name}" from: ${imageUrl}`);
          img = await loadImage(imageUrl);
          console.log(`Successfully loaded image for "${label.name}"`);
        } catch (error) {
          console.warn(`Failed to load image for "${label.name}", using placeholder instead:`, error);
          toast.warning(`Erro ao carregar imagem para "${label.name}". Usando imagem padrão.`);
          img = getPlaceholderImage();
        }

        drawWineLabel(ctx, img, label.wineInfo);
        
        const link = document.createElement('a');
        const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        exportCount++;
      } catch (error) {
        console.error(`Export error for "${label.name}":`, error);
        toast.error(`Erro ao exportar "${label.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        failedExports.push(label.name);
      }
    }

    setExporting(false);
    
    if (exportCount > 0) {
      if (failedExports.length > 0) {
        toast.success(`${exportCount} de ${totalToExport} rótulos exportados com sucesso`);
      } else {
        toast.success(`${exportCount} rótulos exportados com sucesso`);
      }
    } else if (failedExports.length > 0) {
      toast.error('Nenhum rótulo foi exportado devido a erros');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport}
          onExport={exportSelectedLabels}
          isExportDisabled={selectedLabels.length === 0 || exporting}
          isExporting={exporting}
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

