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
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um rótulo para exportar');
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
        // Mostrar toast de processamento
        toast.loading(`Processando imagem "${label.name}"...`, {
          id: `processing-${labelId}`,
          duration: 5000
        });

        // Usar o mesmo mecanismo do WineImageDisplay
        // Criar iframe para download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Configurar URL com parâmetros usando o mesmo mecanismo do WineImageDisplay
        const fileName = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        const proxiedUrl = await getProxiedImageUrl(imageUrl);
        const editUrl = getProxyWithEditParams(proxiedUrl, label.wineInfo, fileName);
        
        // Acionar o download via iframe
        iframe.src = editUrl;
        
        // Remover iframe após o download começar
        setTimeout(() => {
          document.body.removeChild(iframe);
          toast.dismiss(`processing-${labelId}`);
          exportCount++;
          
          // Mostrar sucesso só quando terminar de processar todos
          if (exportCount >= totalToExport) {
            toast.success(`${exportCount} de ${totalToExport} rótulos exportados com sucesso`);
          }
        }, 2000);
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

      // Coletar URLs de todas as imagens válidas
      const imageUrlsPromises = labels
        .filter(label => {
          if (imageErrors[label.id]) {
            console.log('Pulando imagem com erro:', label.name);
            toast.error(`Rótulo "${label.name}" possui erro na imagem e não pode ser baixado`);
            return false;
          }
          const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
          if (!imageUrl) {
            console.log('Pulando imagem sem URL:', label.name);
            toast.error(`Rótulo "${label.name}" não possui imagem para baixar`);
            return false;
          }
          return true;
        })
        .map(async label => {
          try {
            const imageUrl = label.imageUrl || label.wineInfo.imageUrl;
            if (!imageUrl) return null;

            console.log('Processando imagem:', label.name);
            
            // Usar o proxy na porta correta (3002)
            const fileName = `${label.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            const proxiedUrl = await getProxiedImageUrl(imageUrl);
            const editUrl = getProxyWithEditParams(proxiedUrl, label.wineInfo, fileName);
            
            // Fazer a requisição através do proxy
            const response = await fetch(editUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const base64Data = await blobToBase64(blob);
            
            console.log('Imagem processada com sucesso:', label.name);
            
            return {
              data: base64Data,
              filename: `${label.name.toLowerCase().replace(/\s+/g, '-')}.${label.wineInfo.type.toLowerCase().replace(/\s+/g, '-')}.${label.wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.${label.wineInfo.taste.toLowerCase().replace(/\s+/g, '-')}.${label.wineInfo.corkType.toLowerCase().replace(/\s+/g, '-')}.png`
            };
          } catch (error) {
            console.error(`Erro ao processar imagem do rótulo ${label.name}:`, error);
            toast.error(`Erro ao processar imagem do rótulo "${label.name}": ${error.message}`);
            return null;
          }
        });

      console.log('Aguardando processamento de todas as imagens...');
      const imageData = (await Promise.all(imageUrlsPromises)).filter(Boolean);

      if (imageData.length === 0) {
        console.error('Nenhuma imagem válida após processamento');
        toast.dismiss(toastId);
        toast.error('Nenhuma imagem válida encontrada para download');
        return;
      }

      console.log('Total de imagens válidas:', imageData.length);

      // Criar um arquivo ZIP contendo todas as imagens
      const zip = new JSZip();
      
      for (const { data, filename } of imageData) {
        console.log('Adicionando ao ZIP:', filename);
        // Remover o prefixo data:image/...;base64,
        const base64Data = data.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
      }

      // Gerar o arquivo ZIP
      console.log('Gerando arquivo ZIP...');
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Criar URL do blob e link para download
      console.log('Criando link para download...');
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wine-labels.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(toastId);
      toast.success(`${imageData.length} imagens baixadas com sucesso`);
      console.log('Download concluído com sucesso');
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
