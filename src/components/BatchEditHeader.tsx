
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CsvImportButton from '@/components/CsvImportButton';
import { WineInfo } from '@/components/TextInputs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BatchEditHeaderProps {
  onAddNew: () => void;
  onImport: (labels: { name: string; wineInfo: WineInfo }[]) => void;
  onExport: () => void;
  isExportDisabled: boolean;
}

const BatchEditHeader: React.FC<BatchEditHeaderProps> = ({ 
  onAddNew, 
  onImport,
  onExport,
  isExportDisabled
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Rótulos de Vinho</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Nesta tela você pode gerenciar vários rótulos de vinho ao mesmo tempo.
                  Você pode importar dados em massa usando um arquivo CSV.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <Button 
          onClick={onExport} 
          disabled={isExportDisabled}
          variant="outline"
          className="gap-1"
        >
          <Download className="h-4 w-4" />
          Exportar Selecionados
        </Button>
        <CsvImportButton onImport={onImport} />
        <Button onClick={onAddNew} className="gap-1">
          <Plus className="h-4 w-4" />
          Novo Rótulo
        </Button>
      </div>
    </header>
  );
};

export default BatchEditHeader;
