
import React from 'react';

const PlaceholderDisplay: React.FC = () => {
  return (
    <div className="aspect-[1/1] bg-muted flex items-center justify-center p-6">
      <p className="text-muted-foreground text-center">Upload an image to preview</p>
    </div>
  );
};

export default PlaceholderDisplay;
