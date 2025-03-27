import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import TextInputs, { WineInfo } from '@/components/TextInputs';
import ImagePreview from '@/components/ImagePreview';
import { isImageFile } from '@/utils/imageUtils';

const EditLabel = () => {
  const { id } = useParams<{ id: string }>();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wineInfo, setWineInfo] = useState<WineInfo>({
    type: '',
    origin: '',
    taste: '',
    corkType: '',
    info_base: ''
  });
  const [labelName, setLabelName] = useState(`Wine Label ${id}`);

  useEffect(() => {
    toast.info(`Editing label #${id}`);
  }, [id]);

  const extractInfoFromFilename = (filename: string): WineInfo => {
    // Remove a extensão do arquivo
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Divide o nome em partes usando pontos como separador
    const parts = nameWithoutExt.split('.');
    
    // Extrai as informações na ordem: nome.uva.origem.sabor.tampa
    const [name, type = '', origin = '', taste = '', corkType = ''] = parts;
    
    // Atualiza o nome do rótulo
    setLabelName(name.replace(/-/g, ' '));
    
    return {
      type: type.replace(/-/g, ' ') || wineInfo.type,
      origin: origin.replace(/-/g, ' ') || wineInfo.origin,
      taste: taste.replace(/-/g, ' ') || wineInfo.taste,
      corkType: corkType.replace(/-/g, ' ') || wineInfo.corkType,
      info_base: wineInfo.info_base
    };
  };

  const handleImageUpload = (file: File, preview: string) => {
    if (!isImageFile(file)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WEBP)');
      return;
    }
    
    setImageUrl(preview);

    // Extrair informações do nome do arquivo
    const extractedInfo = extractInfoFromFilename(file.name);
    setWineInfo(extractedInfo);
    
    toast.success('Imagem carregada e informações extraídas do nome do arquivo');
  };

  const handleInfoChange = (newInfo: WineInfo) => {
    setWineInfo(newInfo);
  };

  const handleSave = () => {
    // In a real app, this would save to an API or storage
    toast.success('Label saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/batch">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Editing: {labelName}</h1>
          </div>
          <Button onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </header>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-8">
            <div className="p-6 rounded-xl glass-panel animate-fade-up">
              <h2 className="text-xl font-medium mb-4">Upload Wine Image</h2>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                helpText="Nome do arquivo deve seguir o formato: nome.uva.origem.sabor.tampa.png"
              />
            </div>

            <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-medium mb-4">Wine Information</h2>
              <TextInputs wineInfo={wineInfo} onChange={handleInfoChange} />
            </div>
          </div>

          <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '200ms' }}>
            <ImagePreview imageUrl={imageUrl} wineInfo={wineInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLabel;
