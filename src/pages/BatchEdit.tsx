
import React, { useState } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import BatchEditHeader from '@/components/BatchEditHeader';
import BatchEditDescription from '@/components/BatchEditDescription';
import WineLabelsTable from '@/components/WineLabelsTable';

const defaultWineInfo: WineInfo = {
  type: 'Cabernet Sauvignon',
  origin: 'France',
  taste: 'Dry',
  corkType: 'Cork'
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
      name: 'Red Wine Label',
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    }
  ]);
  
  const addNewLabel = () => {
    const newId = (Math.max(0, ...labels.map(label => parseInt(label.id))) + 1).toString();
    const newLabel: WineLabel = {
      id: newId,
      name: `Wine Label ${newId}`,
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    };
    
    setLabels([...labels, newLabel]);
    toast.success('New label added');
  };
  
  const handleCsvImport = (importedLabels: { name: string; wineInfo: WineInfo }[]) => {
    // Get the next available ID
    let nextId = Math.max(0, ...labels.map(label => parseInt(label.id))) + 1;
    
    // Create new wine labels from imported data
    const newLabels = importedLabels.map(imported => ({
      id: (nextId++).toString(),
      name: imported.name,
      imageUrl: null,
      wineInfo: imported.wineInfo
    }));
    
    // Add new labels to existing ones
    setLabels(prevLabels => [...prevLabels, ...newLabels]);
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
