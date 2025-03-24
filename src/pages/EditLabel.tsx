
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

  const handleImageUpload = (file: File, preview: string) => {
    if (!isImageFile(file)) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    setImageUrl(preview);
    toast.success('Image uploaded successfully');
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
              <ImageUploader onImageUpload={handleImageUpload} />
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
