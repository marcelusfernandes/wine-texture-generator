
import React from 'react';
import { cn } from '@/lib/utils';
import { WineInfo } from './TextInputs';
import ErrorDisplay from './wine-card/ErrorDisplay';
import PlaceholderDisplay from './wine-card/PlaceholderDisplay';
import { useWineCanvas } from '@/hooks/useWineCanvas';

interface WineCardProps {
  imageUrl: string | null;
  wineInfo: WineInfo;
  className?: string;
}

const WineCard: React.FC<WineCardProps> = ({ imageUrl, wineInfo, className }) => {
  // Utiliza a imageUrl passada como prop ou a do wineInfo como fallback
  const effectiveImageUrl = imageUrl || wineInfo.imageUrl || null;
  const { canvasRef, loadError } = useWineCanvas(effectiveImageUrl, wineInfo);

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-white shadow-xl animate-fade-in", className)}>
      {effectiveImageUrl ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[600px] object-contain"
          />
          {loadError && <ErrorDisplay imageUrl={effectiveImageUrl} />}
        </div>
      ) : (
        <PlaceholderDisplay />
      )}
    </div>
  );
};

export default WineCard;
