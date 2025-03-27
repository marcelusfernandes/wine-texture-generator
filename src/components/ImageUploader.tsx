import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void;
  helpText?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, helpText }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        onImageUpload(file, preview);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium">
          {isDragActive ? 'Drop the image here' : 'Drag and drop your wine image'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse your files
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: JPG, PNG, GIF, WEBP
        </p>
        {helpText && (
          <p className="text-xs text-muted-foreground mt-2">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
