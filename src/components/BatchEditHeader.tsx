
import React from 'react';
import { Button } from './ui/button';
import { Loader2, PlusCircle, Download } from 'lucide-react';
import CsvImportButton from './CsvImportButton';
import { WineInfo } from './TextInputs';

interface BatchEditHeaderProps {
  onAddNew: () => void;
  onImport: (importedLabels: { name: string; imageUrl: string | null; wineInfo: WineInfo }[]) => void;
  onExport: () => void;
  isExportDisabled: boolean;
  isExporting?: boolean;
}

const BatchEditHeader: React.FC<BatchEditHeaderProps> = ({ 
  onAddNew, 
  onImport, 
  onExport,
  isExportDisabled,
  isExporting = false
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Rótulos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie múltiplos rótulos de vinhos em lote
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddNew} className="gap-2">
          <PlusCircle size={16} />
          Novo Rótulo
        </Button>
        
        <CsvImportButton onImport={onImport} />
        
        <Button 
          onClick={onExport} 
          disabled={isExportDisabled} 
          variant="outline" 
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download size={16} />
              Exportar Selecionados
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BatchEditHeader;
