
import React, { useState } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import BatchEditHeader from '@/components/BatchEditHeader';
import BatchEditDescription from '@/components/BatchEditDescription';
import WineLabelsTable from '@/components/WineLabelsTable';

const defaultWineInfo: WineInfo = {
  type: 'Cabernet Sauvignon',
  origin: 'França',
  taste: 'Seco',
  corkType: 'Rolha'
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
    
    // Obtém o próximo ID disponível
    let nextId = Math.max(0, ...labels.map(label => parseInt(label.id))) + 1;
    
    // Cria novos rótulos de vinho a partir dos dados importados
    const newLabels = importedLabels.map(imported => {
      // Logs para depuração
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
    
    // Adiciona os novos rótulos aos existentes
    setLabels(prevLabels => [...prevLabels, ...newLabels]);
    
    // Informa ao usuário sobre a importação
    toast.success(`${newLabels.length} rótulos importados com sucesso`, {
      description: 'Você pode editar os detalhes de cada rótulo individualmente.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport} 
        />

        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-up">
          <BatchEditDescription />
          <WineLabelsTable 
            labels={labels} 
            onUpdate={setLabels} 
          />
        </div>
      </div>
    </div>
  );
};

export default BatchEdit;
