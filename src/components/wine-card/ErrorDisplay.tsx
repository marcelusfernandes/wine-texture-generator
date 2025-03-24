
import React from 'react';

interface ErrorDisplayProps {
  imageUrl: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ imageUrl }) => {
  return (
    <div className="absolute inset-0 bg-muted bg-opacity-70 flex items-center justify-center">
      <div className="text-center p-4">
        <p className="text-muted-foreground">Failed to load image from URL:</p>
        <p className="text-xs mt-2 break-all">{imageUrl}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
