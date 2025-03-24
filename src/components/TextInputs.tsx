
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface WineInfo {
  type: string;
  origin: string;
  taste: string;
  corkType: string;
}

interface TextInputsProps {
  wineInfo: WineInfo;
  onChange: (info: WineInfo) => void;
  className?: string;
  disabled?: boolean;
}

const TextInputs: React.FC<TextInputsProps> = ({ wineInfo, onChange, className, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...wineInfo,
      [name]: value,
    });
  };

  return (
    <div className={cn("space-y-6 animate-fade-up", className)}>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Uva</Label>
        <Input
          id="type"
          name="type"
          value={wineInfo.type}
          onChange={handleChange}
          placeholder="ex., Cabernet Sauvignon"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="origin">País de Origem</Label>
        <Input
          id="origin"
          name="origin"
          value={wineInfo.origin}
          onChange={handleChange}
          placeholder="ex., Argentina"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="taste">Nível de Doçura</Label>
        <Input
          id="taste"
          name="taste"
          value={wineInfo.taste}
          onChange={handleChange}
          placeholder="ex., Seco"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Nota: Sua entrada será exibida no lado esquerdo do rótulo
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="corkType">Tipo de Tampa</Label>
        <Input
          id="corkType"
          name="corkType"
          value={wineInfo.corkType}
          onChange={handleChange}
          placeholder="ex., Rolha"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default TextInputs;
