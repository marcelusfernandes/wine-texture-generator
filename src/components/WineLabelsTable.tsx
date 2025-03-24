
import React, { useState } from 'react';
import { toast } from 'sonner';
import { WineInfo } from '@/components/TextInputs';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import WineTableRow from './wine-table/WineTableRow';

interface WineLabel {
  id: string;
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}

interface WineLabelsTableProps {
  labels: WineLabel[];
  onUpdate: (updatedLabels: WineLabel[]) => void;
}

const WineLabelsTable: React.FC<WineLabelsTableProps> = ({ labels, onUpdate }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleLabelUpdate = (id: string, updatedProperties: Partial<WineLabel>) => {
    const updatedLabels = labels.map(label => 
      label.id === id ? { ...label, ...updatedProperties } : label
    );
    
    onUpdate(updatedLabels);
  };

  const duplicateLabel = (id: string) => {
    const labelToDuplicate = labels.find(label => label.id === id);
    if (!labelToDuplicate) return;
    
    const newId = (Math.max(0, ...labels.map(label => parseInt(label.id))) + 1).toString();
    const duplicatedLabel: WineLabel = {
      ...labelToDuplicate,
      id: newId,
      name: `${labelToDuplicate.name} (Cópia)`
    };
    
    const updatedLabels = [...labels, duplicatedLabel];
    onUpdate(updatedLabels);
    toast.success('Rótulo duplicado');
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const deleteLabel = (id: string) => {
    const updatedLabels = labels.filter(label => label.id !== id);
    onUpdate(updatedLabels);
    setDeleteConfirmId(null);
    toast.success('Rótulo excluído');
  };

  if (labels.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum rótulo de vinho disponível. Adicione um novo ou importe via CSV.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">URL da Imagem</TableHead>
            <TableHead className="w-[200px]">Nome do Rótulo</TableHead>
            <TableHead>Tipo de Uva</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Sabor</TableHead>
            <TableHead>Tipo de Tampa</TableHead>
            <TableHead>Info Base</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.map(label => (
            <WineTableRow
              key={label.id}
              label={label}
              deleteConfirmId={deleteConfirmId}
              onUpdate={handleLabelUpdate}
              onDuplicate={duplicateLabel}
              onDeleteRequest={confirmDelete}
              onDeleteConfirm={deleteLabel}
              onDeleteCancel={cancelDelete}
              setImageErrors={setImageErrors}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WineLabelsTable;
