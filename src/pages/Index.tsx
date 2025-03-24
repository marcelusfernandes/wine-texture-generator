
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Sparkles, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import TextInputs, { WineInfo } from '@/components/TextInputs';
import ImagePreview from '@/components/ImagePreview';
import { isImageFile, testImageUrl, urlToDataUrl } from '@/utils/imageUtils';

const Index = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wineInfo, setWineInfo] = useState<WineInfo>({
    type: '',
    origin: '',
    taste: '',
    corkType: '',
    imageUrl: ''
  });

  // Effect to handle URL changes from the form
  useEffect(() => {
    if (wineInfo.imageUrl && wineInfo.imageUrl !== imageUrl) {
      // Only update if the URLs are different
      const handleImageUrl = async () => {
        try {
          // Test if the URL is valid
          const isValid = await testImageUrl(wineInfo.imageUrl!);
          
          if (!isValid) {
            toast.error('A URL da imagem não é válida ou está inacessível');
            return;
          }
          
          // Try to convert to data URL to avoid CORS issues
          const dataUrl = await urlToDataUrl(wineInfo.imageUrl!);
          
          if (dataUrl) {
            // Use data URL instead of original URL
            setImageUrl(dataUrl);
            toast.success('Imagem carregada com sucesso');
          } else {
            // Fallback to original URL if conversion fails
            setImageUrl(wineInfo.imageUrl!);
            toast.warning('URL de imagem carregada, mas pode haver problemas com CORS');
          }
        } catch (error) {
          console.error("Error handling image URL:", error);
          toast.error('Erro ao processar a URL da imagem');
        }
      };
      
      handleImageUrl();
    }
  }, [wineInfo.imageUrl, imageUrl]);

  const handleImageUpload = (file: File, preview: string) => {
    if (!isImageFile(file)) {
      toast.error('Por favor, faça upload de um arquivo de imagem válido');
      return;
    }
    
    // Clear the URL field when uploading a file
    setWineInfo(prev => ({
      ...prev,
      imageUrl: ''
    }));
    
    setImageUrl(preview);
    toast.success('Imagem carregada com sucesso');
  };

  const handleInfoChange = (newInfo: WineInfo) => {
    setWineInfo(newInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-2 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Wine Label Generator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight animate-fade-up">
            Create Professional Wine Labels
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
            Upload your wine bottle image and add product information for your PIM system
          </p>
          <div className="flex justify-center mt-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Link to="/batch">
              <Button variant="outline" className="gap-2">
                <List className="h-4 w-4" />
                Batch Edit Mode
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-8">
            <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl font-medium mb-4">Upload Wine Image</h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>

            <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '300ms' }}>
              <h2 className="text-xl font-medium mb-4">Wine Information</h2>
              <TextInputs wineInfo={wineInfo} onChange={handleInfoChange} />
            </div>
          </div>

          <div className="p-6 rounded-xl glass-panel animate-fade-up" style={{ animationDelay: '400ms' }}>
            <ImagePreview imageUrl={imageUrl} wineInfo={wineInfo} />
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '500ms' }}>
          <p>Wine Label Generator &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
