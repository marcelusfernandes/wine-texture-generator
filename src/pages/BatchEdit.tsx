
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Download, Edit, Plus, Trash2 } from 'lucide-react';
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
import CsvImportButton from '@/components/CsvImportButton';

const defaultWineInfo: WineInfo = {
  type: 'Cabernet Sauvignon',
  origin: 'France',
  taste: 'Dry',
  corkType: 'Cork'
};

interface WineLabel {
  id: string;
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}

const BatchEdit = () => {
  const [labels, setLabels] = useState<WineLabel[]>([
    {
      id: '1',
      name: 'Red Wine Label',
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    }
  ]);
  
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const addNewLabel = () => {
    const newId = (Math.max(0, ...labels.map(label => parseInt(label.id))) + 1).toString();
    const newLabel: WineLabel = {
      id: newId,
      name: `Wine Label ${newId}`,
      imageUrl: null,
      wineInfo: { ...defaultWineInfo }
    };
    
    setLabels([...labels, newLabel]);
    toast.success('New label added');
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
    
    setLabels([...labels, duplicatedLabel]);
    toast.success('Label duplicated');
  };

  const deleteLabel = (id: string) => {
    setLabels(labels.filter(label => label.id !== id));
    toast.success('Label deleted');
  };

  const startEditingName = (id: string, currentName: string) => {
    setEditingName(id);
    setNewName(currentName);
  };

  const saveName = (id: string) => {
    if (!newName.trim()) {
      toast.error('Label name cannot be empty');
      return;
    }
    
    setLabels(labels.map(label => 
      label.id === id ? { ...label, name: newName } : label
    ));
    setEditingName(null);
    toast.success('Label name updated');
  };
  
  const handleCsvImport = (importedLabels: { name: string; wineInfo: WineInfo }[]) => {
    // Get the next available ID
    let nextId = Math.max(0, ...labels.map(label => parseInt(label.id))) + 1;
    
    // Create new wine labels from imported data
    const newLabels = importedLabels.map(imported => ({
      id: (nextId++).toString(),
      name: imported.name,
      imageUrl: null,
      wineInfo: imported.wineInfo
    }));
    
    // Add new labels to existing ones
    setLabels(prevLabels => [...prevLabels, ...newLabels]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
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
            <CsvImportButton onImport={handleCsvImport} />
            <Button onClick={addNewLabel} className="gap-1">
              <Plus className="h-4 w-4" />
              Add New Label
            </Button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-up">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Manage multiple wine labels at once. Add, edit, duplicate, or remove labels from your collection.
              You can also import labels from a CSV file.
            </p>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default BatchEdit;
