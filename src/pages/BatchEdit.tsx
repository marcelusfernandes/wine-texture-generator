
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
  const [effectiveImageUrls, setEffectiveImageUrls] = useState<Record<string, string | null>>({});
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

  const handleSetEffectiveImageUrl = (id: string, url: string | null) => {
    setEffectiveImageUrls(prev => ({ ...prev, [id]: url }));
  };

  const exportImage = async () => {
    if (selectedLabels.length !== 1) {
      toast.error('Selecione exatamente um rótulo para exportar a imagem');
      return;
    }

    const selectedLabelId = selectedLabels[0];
    const imageUrl = effectiveImageUrls[selectedLabelId];

    if (!imageUrl) {
      toast.error('Rótulo selecionado não possui imagem para exportar');
      return;
    }

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const label = labels.find(l => l.id === selectedLabelId);
      const filename = label ? `${label.name.toLowerCase().replace(/\s+/g, '-')}-original.${blob.type.split('/')[1] || 'png'}` : 'image.png';
      
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Imagem exportada com sucesso');
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      toast.error(`Erro ao exportar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      toast.error('Erro ao preparar exportação');
      return;
    }

    let exportCount = 0;
    const totalToExport = selectedLabels.length;
    
    for (const labelId of selectedLabels) {
      const label = labels.find(l => l.id === labelId);
      if (!label) continue;

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport}
          onExport={exportSelectedLabels}
          onExportImage={exportImage}
          isExportDisabled={selectedLabels.length === 0}
          isExportImageDisabled={selectedLabels.length !== 1}
        />

        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-up">
          <BatchEditDescription />
          <WineLabelsTable 
            labels={labels} 
            onUpdate={setLabels}
            selectedLabels={selectedLabels}
            onSelectionChange={setSelectedLabels}
            onSetEffectiveImageUrl={handleSetEffectiveImageUrl}
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
