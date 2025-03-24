
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Edit, Trash2, Check, X, Image } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  // Estado para rastrear a operação de confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Track image loading errors
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const startEditingName = (id: string, currentName: string) => {
    setEditingName(id);
    setNewName(currentName);
  };

  const saveName = (id: string) => {
    if (!newName.trim()) {
      toast.error('O nome do rótulo não pode estar vazio');
      return;
    }
    
    const updatedLabels = labels.map(label => 
      label.id === id ? { ...label, name: newName } : label
    );
    
    onUpdate(updatedLabels);
    setEditingName(null);
    toast.success('Nome do rótulo atualizado');
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
  
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
    console.log(`Image failed to load for label ID: ${id}`);
  };
  
  // Helper to clean image URL
  const getCleanImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Remove quotes that might have been incorrectly parsed from CSV
    let cleanUrl = url.replace(/^["']|["']$/g, '');
    
    // Check if it's just a number (probably mistaken for a URL)
    if (/^\d+$/.test(cleanUrl)) {
      console.log(`Invalid image URL detected (just numbers): ${cleanUrl}`);
      return null;
    }
    
    // If it doesn't start with http/https, assume it's a relative URL or invalid
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      console.log(`URL without protocol detected: ${cleanUrl}`);
      // For demo purposes, we could prepend a default domain, but better to return null
      return null;
    }
    
    return cleanUrl;
  };

  // Se não houver rótulos, mostra uma mensagem
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
            <TableHead className="w-[50px]">Imagem</TableHead>
            <TableHead className="w-[200px]">Nome do Rótulo</TableHead>
            <TableHead>Tipo de Uva</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Sabor</TableHead>
            <TableHead>Tipo de Tampa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.map(label => (
            <TableRow key={label.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  {getCleanImageUrl(label.imageUrl) && !imageErrors[label.id] ? (
                    <AvatarImage 
                      src={getCleanImageUrl(label.imageUrl)} 
                      alt={label.name} 
                      onError={() => handleImageError(label.id)}
                    />
                  ) : (
                    <AvatarFallback>
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
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
                      <Check className="h-3 w-3 mr-1" />
                      Salvar
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
                      Editar
                    </Button>
                  </Link>
                  
                  {deleteConfirmId === label.id ? (
                    <div className="flex gap-1">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteLabel(label.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelDelete}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Mais
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => duplicateLabel(label.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(label.id)}>
                          <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                          <span className="text-destructive">Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WineLabelsTable;
