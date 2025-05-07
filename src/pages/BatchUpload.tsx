import React, { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WineInfo } from '@/components/TextInputs';
import WineLabelsTable from '@/components/WineLabelsTable';
import JSZip from 'jszip';
import { processCsvFile } from '@/utils/csv/csvProcessor';

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

interface BatchUploadProps {
  onLabelsProcessed?: (labels: { name: string; imageUrl: string | null; wineInfo: WineInfo }[]) => void;
}

const BatchUpload: React.FC<BatchUploadProps> = ({ onLabelsProcessed }) => {
  const [labels, setLabels] = useState<WineLabel[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const extractInfoFromFilename = (filename: string): { name: string; wineInfo: WineInfo } => {
    // Remove a extensão do arquivo
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Divide o nome em partes usando pontos como separador
    const parts = nameWithoutExt.split('.');
    
    // Extrai as informações na ordem: nome.uva.origem.sabor.tampa
    const [name, type, origin, taste, corkType] = parts;
    
    return {
      name: name.replace(/-/g, ' '),
      wineInfo: {
        type: type?.replace(/-/g, ' ') || 'Desconhecido',
        origin: origin?.replace(/-/g, ' ') || 'Desconhecido',
        taste: taste?.replace(/-/g, ' ') || 'Desconhecido',
        corkType: corkType?.replace(/-/g, ' ') || 'Desconhecido',
        info_base: ''
      }
    };
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newLabels: WineLabel[] = [];
    let nextId = Math.max(0, ...labels.map(label => parseInt(label.id))) + 1;

    for (const file of files) {
      try {
        // Extrair informações do nome do arquivo
        const { name, wineInfo } = extractInfoFromFilename(file.name);
        
        // Criar URL da imagem
        const imageUrl = URL.createObjectURL(file);
        
        // Criar novo rótulo
        const newLabel: WineLabel = {
          id: (nextId++).toString(),
          name,
          imageUrl,
          wineInfo
        };
        
        newLabels.push(newLabel);
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error);
        toast.error(`Erro ao processar arquivo ${file.name}`);
      }
    }

    if (newLabels.length > 0) {
      setLabels(prevLabels => [...prevLabels, ...newLabels]);
      toast.success(`${newLabels.length} rótulos importados com sucesso`);
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

      // Coletar URLs de todas as imagens válidas
      const imageUrlsPromises = labels
        .filter(label => {
          if (!label.imageUrl) {
            toast.error(`Rótulo "${label.name}" não possui imagem para baixar`);
            return false;
          }
          return true;
        })
        .map(async label => {
          try {
            // Usar a URL correta do proxy (porta 3002)
            const proxyUrl = `http://localhost:3002/proxy?url=${encodeURIComponent(label.imageUrl)}`;
            console.log('Tentando acessar:', proxyUrl);
            
            const response = await fetch(proxyUrl);
            if (!response.ok) {
              throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const base64Data = await blobToBase64(blob);
            
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

      const imageData = (await Promise.all(imageUrlsPromises)).filter(Boolean);

      if (imageData.length === 0) {
        toast.dismiss(toastId);
        toast.error('Nenhuma imagem válida encontrada para download');
        return;
      }

      // Criar um arquivo ZIP contendo todas as imagens
      const zip = new JSZip();
      
      for (const { data, filename } of imageData) {
        // Remover o prefixo data:image/...;base64,
        const base64Data = data.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
      }

      // Gerar o arquivo ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Criar URL do blob e link para download
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
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      toast.error('Erro ao baixar imagens: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    try {
      const toastId = toast.loading('Processando arquivo CSV...');
      
      // Processar o CSV
      const processedLabels = await processCsvFile(file);
      
      // Enviar os dados processados para o proxy-server
      const imagesToDownload = processedLabels
        .filter(label => label.imageUrl)
        .map(label => ({
          url: label.imageUrl,
          filename: `${label.name.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.type.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.taste.toLowerCase().replace(/\s+/g, '-')}.${
            label.wineInfo.corkType.toLowerCase().replace(/\s+/g, '-')}.png`
        }));

      // Enviar para o proxy-server baixar as imagens
      const response = await fetch('http://localhost:3000/download-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: imagesToDownload })
      });

      if (!response.ok) {
        throw new Error(`Erro ao baixar imagens: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success(`${result.totalProcessed} imagens baixadas com sucesso`);
        
        // Notificar o componente pai com os dados processados
        if (onLabelsProcessed) {
          onLabelsProcessed(processedLabels);
        }
      } else {
        throw new Error('Falha ao processar imagens');
      }
    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Upload em Lote</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={downloadAllLabels}
              disabled={labels.length === 0}
              variant="outline"
              className="gap-1"
            >
              <Upload className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-up">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2">Upload de Imagens</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload das imagens dos rótulos. O nome do arquivo deve seguir o formato:
              <br />
              <code className="bg-muted px-2 py-1 rounded">nome-do-produto.uva.origem.sabor.tampa.png</code>
            </p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="gap-1">
                    <Upload className="h-4 w-4" />
                    Selecionar Imagens
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <WineLabelsTable 
            labels={labels} 
            onUpdate={setLabels}
            selectedLabels={selectedLabels}
            onSelectionChange={setSelectedLabels}
          />
        </div>

        <div className="p-6 rounded-xl glass-panel animate-fade-up">
          <h2 className="text-xl font-medium mb-4">Upload de CSV</h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">Arraste e solte seu arquivo CSV</h3>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar o arquivo</p>
              <p className="text-xs text-muted-foreground mt-4">
                O arquivo CSV deve conter as colunas: nome, tipo, origem, sabor, tampa e URL da imagem
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload; 