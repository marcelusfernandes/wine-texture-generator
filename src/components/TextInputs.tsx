
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
}

const TextInputs: React.FC<TextInputsProps> = ({ wineInfo, onChange, className }) => {
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
        <Label htmlFor="type">Grape Variety</Label>
        <Input
          id="type"
          name="type"
          value={wineInfo.type}
          onChange={handleChange}
          placeholder="e.g., Cabernet Sauvignon"
          className="transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="origin">Country of Origin</Label>
        <Input
          id="origin"
          name="origin"
          value={wineInfo.origin}
          onChange={handleChange}
          placeholder="e.g., Argentina"
          className="transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="taste">Sweetness Level</Label>
        <Input
          id="taste"
          name="taste"
          value={wineInfo.taste}
          onChange={handleChange}
          placeholder="e.g., Dry"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Note: This field is always displayed as "SWEET" on the label
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="corkType">Closure Type</Label>
        <Input
          id="corkType"
          name="corkType"
          value={wineInfo.corkType}
          onChange={handleChange}
          placeholder="e.g., Cork"
          className="transition-all focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default TextInputs;
