import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import BatchEditDescription from '@/components/BatchEditDescription';
import BatchEditHeader from '@/components/BatchEditHeader';
import CsvImportButton from '@/components/CsvImportButton';
import { WineInfo } from '@/components/TextInputs';
import WineLabelsTable from '@/components/WineLabelsTable';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { getProxyWithEditParams } from '@/components/wine-table/WineImageDisplay';
import JSZip from 'jszip';

const defaultWineInfo: WineInfo = {
  type: 'Cabernet Sauvignon',
  origin: 'França',
  taste: 'Seco',
  corkType: 'Rolha',
  info_base: ''
};

// Função auxiliar para converter Blob para Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface WineLabel {
  id: string;
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}

interface BatchEditHeaderProps {
  onAddNew: () => void;
  onImport: (labels: { name: string; wineInfo: WineInfo }[]) => void;
  onExport: () => void;
  onDownloadAll: () => void;
  isExportDisabled: boolean;
  isDownloadAllDisabled: boolean;
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

  const exportSelectedLabels = async () => {
    // Verifica se há rótulos carregados
    if (labels.length === 0) {
      toast.error('Não há rótulos para exportar');
      return;
    }

    let exportCount = 0;
    const totalToExport = labels.length;
    
    // Processa cada rótulo
    for (const label of labels) {
      // Verifica se tem URL da imagem
      const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
      if (!imageUrl) {
        toast.error(`Rótulo "${label.name}" não possui imagem para exportar`);
        continue;
      }

      try {
        // Mostra mensagem de processamento
        toast.loading(`Processando imagem "${label.name}"...`, {
          id: `processing-${label.id}`,
          duration: 5000
        });

        // Faz o download direto da imagem original
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Criar blob da imagem
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.dismiss(`processing-${label.id}`);
        exportCount++;
          
        // Mostrar sucesso só quando terminar de processar todos
        if (exportCount >= totalToExport) {
          toast.success(`${exportCount} de ${totalToExport} rótulos exportados com sucesso`);
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error(`Erro ao exportar "${label.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const downloadAllLabels = async () => {
    if (labels.length === 0) {
      toast.error('Não há rótulos para baixar');
      return;
    }

    try {
      const toastId = toast.loading('Processando todas as imagens...', {
        duration: 10000
      });

      console.log('Iniciando processamento de', labels.length, 'imagens');

      // Preparar dados para enviar ao servidor
      const imagesToDownload = labels
        .filter(label => {
          const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
          if (!imageUrl) {
            console.log('Pulando imagem sem URL:', label.name);
            toast.error(`Rótulo "${label.name}" não possui imagem para baixar`);
            return false;
          }
          return true;
        })
        .map(label => {
          // Formatar o nome do arquivo seguindo a estrutura:
          // nome.tipo-uva.origem.sabor.tipo-tampa
          const filename = `${label.name.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.type.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.taste.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.corkType.toLowerCase().replace(/\s+/g, '-')}.png`;

          return {
            url: label.imageUrl || label.wineInfo.imageUrl,
            filename: filename
          };
        });

      if (imagesToDownload.length === 0) {
        toast.dismiss(toastId);
        toast.error('Nenhuma imagem válida para download');
        return;
      }

      // Chamar o endpoint do servidor
      const response = await fetch('http://localhost:3000/download-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: imagesToDownload })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.dismiss(toastId);
        toast.success(`${result.totalProcessed} imagens baixadas com sucesso`);
        console.log('Download concluído com sucesso');
      } else {
        throw new Error(result.error || 'Erro desconhecido ao baixar imagens');
      }
    } catch (error) {
      console.error('Erro detalhado no download:', error);
      toast.error('Erro ao baixar imagens: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <BatchEditHeader 
          onAddNew={addNewLabel} 
          onImport={handleCsvImport}
          onExport={exportSelectedLabels}
          onDownloadAll={downloadAllLabels}
          isExportDisabled={selectedLabels.length === 0}
          isDownloadAllDisabled={labels.length === 0}
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
    </div>
  );
};

export default BatchEdit;
