
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processCsvFile } from '@/utils/csvUtils';
import { WineInfo } from './TextInputs';

interface CsvImportButtonProps {
  onImport: (labels: { name: string; wineInfo: WineInfo }[]) => void;
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
      toast.error('Por favor, faça upload de um arquivo CSV');
      return;
    }

    try {
      setIsLoading(true);
      toast.info('Processando arquivo CSV...');
      const wineLabels = await processCsvFile(file);
      
      if (wineLabels.length === 0) {
        toast.error('Nenhum dado válido encontrado no arquivo CSV');
        return;
      }

      // Log imported labels for debugging
      console.log('Rótulos de vinho importados:', wineLabels);
      
      // Show a sample of what was imported
      const firstLabel = wineLabels[0];
      toast.info(
        `Amostra: "${firstLabel.name}" (Uva: ${firstLabel.wineInfo.type}, Origem: ${firstLabel.wineInfo.origin}, Sabor: ${firstLabel.wineInfo.taste}, Tampa: ${firstLabel.wineInfo.corkType})`,
        { duration: 5000 }
      );

      onImport(wineLabels);
      toast.success(`${wineLabels.length} rótulos de vinho importados com sucesso`);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      toast.error('Falha ao importar arquivo CSV. Verifique o formato.');
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
