
import React from "react";
import { Link } from "react-router-dom";
import { Copy, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteConfirmation from "./DeleteConfirmation";

interface WineTableActionsProps {
  id: string;
  showDeleteConfirm: boolean;
  imageUrl: string | null;
  onViewImage: () => void;
  onDuplicate: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

const WineTableActions: React.FC<WineTableActionsProps> = ({
  id,
  showDeleteConfirm,
  imageUrl,
  onViewImage,
  onDuplicate,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel
}) => {
  if (showDeleteConfirm) {
    return <DeleteConfirmation onConfirm={onDeleteConfirm} onCancel={onDeleteCancel} />;
  }

  return (
    <div className="flex justify-end gap-2">
      <Link to={`/edit/${id}`}>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Mais
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onViewImage}
            disabled={!imageUrl}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver imagem
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteRequest}>
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            <span className="text-destructive">Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WineTableActions;
