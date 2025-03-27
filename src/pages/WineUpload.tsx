import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import TextInputs, { WineInfo } from '@/components/TextInputs';
import ImagePreview from '@/components/ImagePreview';
import { isImageFile } from '@/utils/imageUtils';
import { Input } from '@/components/ui/input';

const EditLabel = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, this would fetch the label data from an API or storage
  // For now, we'll just use placeholder data
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wineInfo, setWineInfo] = useState<WineInfo>({
    type: 'Cabernet Sauvignon',
    origin: 'France',
    taste: 'Dry',
    corkType: 'Cork'
  });
  const [labelName, setLabelName] = useState(`Wine Label ${id}`);

  useEffect(() => {
    // Simulating a data fetch
    toast.info(`Editing label #${id}`);
  }, [id]);

  const extractInfoFromFilename = (filename: string): WineInfo => {
    // Remove a extensão do arquivo
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Divide o nome em partes usando pontos como separador
    const parts = nameWithoutExt.split('.');
    
    // Extrai as informações na ordem: nome.uva.origem.sabor.tampa
    const [_, type = '', origin = '', taste = '', corkType = ''] = parts;
    
    return {
      type: type.replace(/-/g, ' ') || wineInfo.type,
      origin: origin.replace(/-/g, ' ') || wineInfo.origin,
      taste: taste.replace(/-/g, ' ') || wineInfo.taste,
      corkType: corkType.replace(/-/g, ' ') || wineInfo.corkType,
      info_base: wineInfo.info_base
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Extrair informações do nome do arquivo
      const extractedInfo = extractInfoFromFilename(file.name);
      setWineInfo(extractedInfo);
      
      toast.success('Imagem carregada e informações extraídas do nome do arquivo');
    }
  };

  const handleImageUrlChange = (url: string) => {
    if (url) {
      setImageUrl(url);
      
      // Extrair informações do nome do arquivo da URL
      const filename = url.split('/').pop() || '';
      const extractedInfo = extractInfoFromFilename(filename);
      setWineInfo(extractedInfo);
    }
  };

  const handleInfoChange = (newInfo: WineInfo) => {
    setWineInfo(newInfo);
  };

  const handleSave = () => {
    // In a real app, this would save to an API or storage
    toast.success('Label saved successfully');
  };

  const handleDownload = async () => {
    if (!imageUrl) {
      toast.error('Por favor, faça upload de uma imagem primeiro');
      return;
    }

    try {
      // Criar o nome do arquivo baseado nas informações do vinho
      const filename = `${wineInfo.type.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.taste.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.corkType.toLowerCase().replace(/\s+/g, '-')}.png`;

      // Fazer download da imagem
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Imagem baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      toast.error('Erro ao baixar imagem');
    }
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
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">Drag and drop your wine image</h3>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse your files</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: JPG, PNG, GIF, WEBP
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Nome do arquivo deve seguir o formato: nome.uva.origem.sabor.tampa.png
                  </p>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Or add a URL in the Wine Information section below
              </p>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Wine Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">URL da Imagem (opcional)</label>
                    <Input
                      type="text"
                      placeholder="ex., https://example.com/wine-image.jpg"
                      className="w-full"
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Insira uma URL de imagem para exibir no preview
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Tipo de Uva</label>
                    <Input
                      type="text"
                      placeholder="ex., Cabernet Sauvignon"
                      className="w-full"
                      value={wineInfo.type}
                      onChange={(e) => handleInfoChange({ ...wineInfo, type: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Origem</label>
                    <Input
                      type="text"
                      placeholder="ex., França"
                      className="w-full"
                      value={wineInfo.origin}
                      onChange={(e) => handleInfoChange({ ...wineInfo, origin: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Sabor</label>
                    <Input
                      type="text"
                      placeholder="ex., Seco"
                      className="w-full"
                      value={wineInfo.taste}
                      onChange={(e) => handleInfoChange({ ...wineInfo, taste: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Tipo de Tampa</label>
                    <Input
                      type="text"
                      placeholder="ex., Rolha"
                      className="w-full"
                      value={wineInfo.corkType}
                      onChange={(e) => handleInfoChange({ ...wineInfo, corkType: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Informações Base</label>
                    <Input
                      type="text"
                      placeholder="Informações adicionais"
                      className="w-full"
                      value={wineInfo.info_base}
                      onChange={(e) => handleInfoChange({ ...wineInfo, info_base: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={handleDownload}
                disabled={!imageUrl}
              >
                <Download className="h-4 w-4" />
                Download Image
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg">
              <ImagePreview imageUrl={imageUrl} wineInfo={wineInfo} />
            </div>
            {imageUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Informações do Rótulo</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Tipo:</strong> {wineInfo.type || 'Não especificado'}</p>
                  <p><strong>Origem:</strong> {wineInfo.origin || 'Não especificado'}</p>
                  <p><strong>Sabor:</strong> {wineInfo.taste || 'Não especificado'}</p>
                  <p><strong>Tampa:</strong> {wineInfo.corkType || 'Não especificado'}</p>
                  {wineInfo.info_base && (
                    <p><strong>Info Base:</strong> {wineInfo.info_base}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLabel;
