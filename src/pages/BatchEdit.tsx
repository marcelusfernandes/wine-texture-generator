
import React, { useState } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import BatchEditHeader from '@/components/BatchEditHeader';
import BatchEditDescription from '@/components/BatchEditDescription';
import WineLabelsTable from '@/components/WineLabelsTable';
import WineExporter from '@/components/WineExporter';

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
  const [isExporting, setIsExporting] = useState(false);
  
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

  const handleExportRequest = () => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um rótulo para exportar');
      return;
    }
    
    // Check for labels with image errors
    const labelsWithErrors = selectedLabels.filter(id => imageErrors[id]);
    if (labelsWithErrors.length > 0) {
      const errorLabels = labelsWithErrors.map(id => {
        const label = labels.find(l => l.id === id);
        return label ? label.name : `ID: ${id}`;
      }).join(', ');
      
      toast.error(`Rótulos com erros na imagem não podem ser exportados: ${errorLabels}`);
      return;
    }
    
    // Filter the selected labels for export
    const labelsToExport = selectedLabels.map(id => 
      labels.find(label => label.id === id)
    ).filter((label): label is WineLabel => label !== undefined);
    
    if (labelsToExport.length === 0) {
      toast.error('Nenhum rótulo válido para exportar');
      return;
    }
    
    setIsExporting(true);
    toast.info(`Iniciando exportação de ${labelsToExport.length} rótulos...`);
  };

  const handleExportComplete = () => {
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport}
          onExport={handleExportRequest}
          isExportDisabled={selectedLabels.length === 0 || isExporting}
          isExporting={isExporting}
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

      {/* Separate component for wine export */}
      <WineExporter 
        selectedLabels={selectedLabels.map(id => 
          labels.find(label => label.id === id)
        ).filter((label): label is WineLabel => label !== undefined)}
        isExporting={isExporting}
        onExportComplete={handleExportComplete}
      />
    </div>
  );
};

export default BatchEdit;
