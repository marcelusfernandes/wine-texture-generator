
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WineInfo } from '@/components/TextInputs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

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
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const startEditingName = (id: string, currentName: string) => {
    setEditingName(id);
    setNewName(currentName);
  };

  const saveName = (id: string) => {
    if (!newName.trim()) {
      toast.error('Label name cannot be empty');
      return;
    }
    
    const updatedLabels = labels.map(label => 
      label.id === id ? { ...label, name: newName } : label
    );
    
    onUpdate(updatedLabels);
    setEditingName(null);
    toast.success('Label name updated');
  };

  const duplicateLabel = (id: string) => {
    const labelToDuplicate = labels.find(label => label.id === id);
    if (!labelToDuplicate) return;
    
    const newId = (Math.max(0, ...labels.map(label => parseInt(label.id))) + 1).toString();
    const duplicatedLabel: WineLabel = {
      ...labelToDuplicate,
      id: newId,
      name: `${labelToDuplicate.name} (Copy)`
    };
    
    const updatedLabels = [...labels, duplicatedLabel];
    onUpdate(updatedLabels);
    toast.success('Label duplicated');
  };

  const deleteLabel = (id: string) => {
    const updatedLabels = labels.filter(label => label.id !== id);
    onUpdate(updatedLabels);
    toast.success('Label deleted');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Label Name</TableHead>
          <TableHead>Grape Variety</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>Taste</TableHead>
          <TableHead>Closure Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {labels.map(label => (
          <TableRow key={label.id}>
            <TableCell>
              {editingName === label.id ? (
                <div className="flex gap-2">
                  <Input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="h-8"
                    onKeyDown={e => e.key === 'Enter' && saveName(label.id)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2" 
                    onClick={() => saveName(label.id)}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {label.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => startEditingName(label.id, label.name)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </TableCell>
            <TableCell>{label.wineInfo.type}</TableCell>
            <TableCell>{label.wineInfo.origin}</TableCell>
            <TableCell>{label.wineInfo.taste}</TableCell>
            <TableCell>{label.wineInfo.corkType}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link to={`/edit/${label.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => duplicateLabel(label.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteLabel(label.id)}>
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      <span className="text-destructive">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WineLabelsTable;
