
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, className }) => {
  const [dragging, setDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(file, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-60 transition-all duration-300",
        "border-2 border-dashed rounded-xl p-6",
        dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/50",
        "animate-fade-in", 
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium text-lg">Drag and drop your wine image</p>
          <p className="text-sm text-muted-foreground">or click to browse your files</p>
          <p className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, GIF, WEBP</p>
        </div>
        <Button variant="secondary" className="mt-2">
          Select Image
        </Button>
      </div>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept="image/jpeg,image/png,image/gif,image/webp"
      />
    </div>
  );
};

export default ImageUploader;
