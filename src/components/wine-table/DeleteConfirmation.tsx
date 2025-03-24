
import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="flex gap-1">
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={onConfirm}
      >
        <Check className="h-4 w-4 mr-1" />
        Confirmar
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCancel}
      >
        <X className="h-4 w-4 mr-1" />
        Cancelar
      </Button>
    </div>
  );
};

export default DeleteConfirmation;
