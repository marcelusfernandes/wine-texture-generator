
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CsvImportButton from '@/components/CsvImportButton';
import { WineInfo } from '@/components/TextInputs';

interface BatchEditHeaderProps {
  onAddNew: () => void;
  onImport: (labels: { name: string; wineInfo: WineInfo }[]) => void;
}

const BatchEditHeader: React.FC<BatchEditHeaderProps> = ({ onAddNew, onImport }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Batch Edit Wine Labels</h1>
      </div>
      <div className="flex gap-2">
        <CsvImportButton onImport={onImport} />
        <Button onClick={onAddNew} className="gap-1">
          <Plus className="h-4 w-4" />
          Add New Label
        </Button>
      </div>
    </header>
  );
};

export default BatchEditHeader;
