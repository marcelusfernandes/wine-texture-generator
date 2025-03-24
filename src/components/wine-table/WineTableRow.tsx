
import React from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  isSelected: boolean;
  onToggleSelect: () => void;
}

const WineTableRow: React.FC<WineTableRowProps> = ({
  label,
  deleteConfirmId,
  onUpdate,
  onDuplicate,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  setImageErrors,
  isSelected,
  onToggleSelect
}) => {
  const handleNameUpdate = (newName: string) => {
    onUpdate(label.id, { name: newName });
    toast.success('Nome do rótulo atualizado');
  };

  // Para diagnóstico - vamos logar os dados do rótulo
  console.log(`[WineTableRow] Renderizando rótulo ${label.id}: "${label.name}" - URL imagem: ${label.imageUrl || 'SEM URL'}`);
  
  // Log detalhado do campo info_base
  if (label.wineInfo.info_base) {
    console.log(`[WineTableRow] Rótulo ${label.id} info_base: "${label.wineInfo.info_base}" (${label.wineInfo.info_base.length} caracteres)`);
  }

  // Determinar qual URL da imagem usar - primeiro tentar label.imageUrl, depois wineInfo.imageUrl
  const effectiveImageUrl = label.imageUrl || label.wineInfo.imageUrl || null;

  return (
    <TableRow>
      <TableCell className="px-4">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onToggleSelect}
          aria-label={`Selecionar ${label.name}`}
        />
      </TableCell>
      <TableCell>
        <WineImageDisplay 
          imageUrl={effectiveImageUrl} 
          alt={label.name}
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
          imageUrl={effectiveImageUrl}
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
