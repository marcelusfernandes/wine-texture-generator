
import React, { useState } from "react";
import { Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableNameProps {
  name: string;
  onSave: (name: string) => void;
}

const EditableName: React.FC<EditableNameProps> = ({ name, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const startEditing = () => {
    setIsEditing(true);
    setNewName(name);
  };

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Input 
          value={newName} 
          onChange={e => setNewName(e.target.value)}
          className="h-8"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2" 
          onClick={handleSave}
        >
          <Check className="h-3 w-3 mr-1" />
          Salvar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {name}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6" 
        onClick={startEditing}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default EditableName;
