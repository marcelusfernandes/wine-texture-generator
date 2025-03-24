
import React from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { WineInfo } from "@/components/TextInputs";
import EditableName from "./EditableName";
import WineImageDisplay from "./WineImageDisplay";
import WineTableActions from "./WineTableActions";

interface WineLabel {
  id: string;
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}

interface WineTableRowProps {
  label: WineLabel;
  deleteConfirmId: string | null;
  onUpdate: (id: string, updatedLabel: Partial<WineLabel>) => void;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
  setImageErrors: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const WineTableRow: React.FC<WineTableRowProps> = ({
  label,
  deleteConfirmId,
  onUpdate,
  onDuplicate,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  setImageErrors
}) => {
  const handleNameUpdate = (newName: string) => {
    onUpdate(label.id, { name: newName });
    toast.success('Nome do rótulo atualizado');
  };

  const handleImageError = () => {
    setImageErrors(prev => ({ ...prev, [label.id]: true }));
    console.error(`❌ Falha ao carregar imagem para o rótulo ID: ${label.id}`);
  };

  const handleViewImage = () => {
    if (!label.imageUrl) {
      toast.error('Nenhuma imagem disponível para este rótulo');
      return;
    }
    
    console.log("Abrindo URL em nova aba:", label.imageUrl);
    window.open(label.imageUrl, '_blank');
  };

  return (
    <TableRow>
      <TableCell>
        <WineImageDisplay 
          imageUrl={label.imageUrl} 
          alt={label.name}
          onImageError={handleImageError}
          onViewImage={handleViewImage}
        />
      </TableCell>
      <TableCell>
        <EditableName 
          name={label.name} 
          onSave={handleNameUpdate} 
        />
      </TableCell>
      <TableCell>{label.wineInfo.type}</TableCell>
      <TableCell>{label.wineInfo.origin}</TableCell>
      <TableCell>{label.wineInfo.taste}</TableCell>
      <TableCell>{label.wineInfo.corkType}</TableCell>
      <TableCell className="text-right">
        <WineTableActions 
          id={label.id}
          showDeleteConfirm={deleteConfirmId === label.id}
          imageUrl={label.imageUrl}
          onViewImage={handleViewImage}
          onDuplicate={() => onDuplicate(label.id)}
          onDeleteRequest={() => onDeleteRequest(label.id)}
          onDeleteConfirm={() => onDeleteConfirm(label.id)}
          onDeleteCancel={onDeleteCancel}
        />
      </TableCell>
    </TableRow>
  );
};

export default WineTableRow;
