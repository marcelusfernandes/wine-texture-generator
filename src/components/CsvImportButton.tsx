
import React, { useRef } from 'react';
import { toast } from 'sonner';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processCsvFile } from '@/utils/csvUtils';
import { WineInfo } from './TextInputs';

interface CsvImportButtonProps {
  onImport: (labels: { name: string; wineInfo: WineInfo }[]) => void;
  className?: string;
}

const CsvImportButton: React.FC<CsvImportButtonProps> = ({ onImport, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      toast.info('Processing CSV file...');
      const wineLabels = await processCsvFile(file);
      
      if (wineLabels.length === 0) {
        toast.error('No valid data found in CSV file');
        return;
      }

      console.log('Imported wine labels:', wineLabels);
      
      // Show a sample of what was imported
      const firstLabel = wineLabels[0];
      toast.info(
        `Sample data: "${firstLabel.name}" (${firstLabel.wineInfo.type}, ${firstLabel.wineInfo.origin})`,
        { duration: 5000 }
      );

      onImport(wineLabels);
      toast.success(`Successfully imported ${wineLabels.length} wine labels`);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Failed to import CSV file. Please check the format.');
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleImportClick} 
        className={className}
      >
        <FileUp className="h-4 w-4 mr-2" />
        Import CSV
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
