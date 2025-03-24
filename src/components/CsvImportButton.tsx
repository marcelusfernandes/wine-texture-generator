
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processCsvFile } from '@/utils/csvUtils';
import { WineInfo } from './TextInputs';

interface CsvImportButtonProps {
  onImport: (labels: { name: string; imageUrl: string | null; wineInfo: WineInfo }[]) => void;
  className?: string;
}

const CsvImportButton: React.FC<CsvImportButtonProps> = ({ onImport, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor, faça upload de um arquivo CSV', {
        description: 'O arquivo deve ter a extensão .csv'
      });
      return;
    }

    try {
      setIsLoading(true);
      toast.info('Processando arquivo CSV...', {
        description: 'Analisando cabeçalhos e dados do arquivo.'
      });
      
      console.log(`Iniciando processamento do arquivo: ${file.name} (${file.size} bytes)`);
      const wineLabels = await processCsvFile(file);
      
      if (wineLabels.length === 0) {
        toast.error('Nenhum dado válido encontrado no arquivo CSV', {
          description: 'Verifique se o arquivo contém dados válidos no formato correto.',
          icon: <AlertCircle className="h-5 w-5" />
        });
        return;
      }

      // Log imported labels for debugging
      console.log('Rótulos de vinho importados:', wineLabels);
      
      // Count how many have image URLs
      const withImageUrls = wineLabels.filter(label => label.imageUrl !== null).length;
      console.log(`${withImageUrls} de ${wineLabels.length} rótulos têm URLs de imagem`);
      
      // Show a sample of what was imported
      const firstLabel = wineLabels[0];
      toast.success(`${wineLabels.length} rótulos de vinho importados com sucesso`, {
        description: `Amostra: "${firstLabel.name}" (Uva: ${firstLabel.wineInfo.type}, Origem: ${firstLabel.wineInfo.origin})`,
        duration: 5000
      });

      if (withImageUrls > 0) {
        toast.info(`${withImageUrls} rótulos contêm URLs de imagem`, {
          description: 'As imagens serão carregadas se as URLs forem válidas e acessíveis.'
        });
      }

      onImport(wineLabels);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error);
      toast.error('Falha ao importar arquivo CSV', {
        description: error.message || 'Verifique se o formato está correto e tente novamente.',
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 7000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleImportClick} 
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4 mr-2" />
        )}
        Importar CSV
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
      />
    </>
  );
};

export default CsvImportButton;
