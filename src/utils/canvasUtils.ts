
/**
 * Utility functions for canvas drawing operations
 */

// Base configuration for wine card dimensions
export const CANVAS_CONFIG = {
  width: 1080,
  height: 1080,
  panels: {
    sweetnessPanel: {
      x: 84,
      y: 0,
      width: 240,
      height: 587,
      color: '#890045'
    },
    grapePanel: {
      x: 109,
      y: 587,
      width: 190,
      height: 492,
      color: '#666666'
    },
    closureType: {
      x: 700 + (336 - 209) / 2,
      y: 151,
      width: 209,
      height: 210,
      color: '#D9D9D9'
    },
    countryIcon: {
      x: 668 + (412 - 209) / 2,
      y: 708,
      width: 209,
      height: 210,
      color: '#D9D9D9'
    }
  },
  fonts: {
    sweetness: 'bold 110px "Arial Rounded MT Bold", Arial, sans-serif',
    grape: 'bold 62px "Arial Rounded MT Bold", Arial, sans-serif',
    closure: 'bold 56px "Arial Rounded MT Bold", Arial, sans-serif',
    country: 'bold 56px "Arial Rounded MT Bold", Arial, sans-serif'
  }
};

/**
 * Draws the background image on the canvas
 */
export const drawBackgroundImage = (
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Calculate dimensions for the background image
  let imgWidth = img.width;
  let imgHeight = img.height;
  let x = 0;
  let y = 0;
  
  // Make sure the image covers the entire canvas
  const canvasRatio = canvasWidth / canvasHeight;
  const imgRatio = img.width / img.height;
  
  if (imgRatio > canvasRatio) {
    // Image is wider than canvas
    imgHeight = canvasHeight;
    imgWidth = img.width * (canvasHeight / img.height);
    x = (canvasWidth - imgWidth) / 2;
  } else {
    // Image is taller than canvas
    imgWidth = canvasWidth;
    imgHeight = img.height * (canvasWidth / img.width);
    y = (canvasHeight - imgHeight) / 2;
  }
  
  // Draw the image
  ctx.drawImage(img, x, y, imgWidth, imgHeight);
};

/**
 * Draws the sweetness panel and text
 */
export const drawSweetnessPanel = (
  ctx: CanvasRenderingContext2D,
  sweetnessText: string
): void => {
  const { sweetnessPanel } = CANVAS_CONFIG.panels;
  
  // Draw the panel
  ctx.fillStyle = sweetnessPanel.color;
  ctx.fillRect(
    sweetnessPanel.x, 
    sweetnessPanel.y, 
    sweetnessPanel.width, 
    sweetnessPanel.height
  );
  
  // Draw the text
  ctx.save();
  ctx.translate(
    sweetnessPanel.x + sweetnessPanel.width / 2, 
    sweetnessPanel.y + sweetnessPanel.height / 2
  );
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = CANVAS_CONFIG.fonts.sweetness;
  ctx.fillStyle = 'white';
  ctx.fillText(sweetnessText.toUpperCase() || 'SWEET', 0, 0);
  ctx.restore();
};

/**
 * Word wraps text for canvas rendering
 */
export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const testWidth = ctx.measureText(testLine).width;
    
    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine); // Add the last line
  
  return lines;
};

/**
 * Draws the grape variety panel and text
 */
export const drawGrapePanel = (
  ctx: CanvasRenderingContext2D,
  grapeText: string
): void => {
  const { grapePanel } = CANVAS_CONFIG.panels;
  
  // Draw the panel
  ctx.fillStyle = grapePanel.color;
  ctx.fillRect(
    grapePanel.x, 
    grapePanel.y, 
    grapePanel.width, 
    grapePanel.height
  );
  
  // Prepare for text drawing
  ctx.save();
  ctx.font = CANVAS_CONFIG.fonts.grape;
  ctx.fillStyle = 'white';
  
  // Word wrap the grape text
  const availableHeight = grapePanel.height - 32; // padding of 16px top and bottom
  const originalGrapeText = grapeText.toUpperCase() || 'GRAPE VARIETY';
  
  // Set up the context for measurement
  ctx.font = CANVAS_CONFIG.fonts.grape;
  
  // Get wrapped lines
  const lines = wrapText(ctx, originalGrapeText, availableHeight);
  
  // Position and draw the wrapped text
  ctx.translate(
    grapePanel.x + grapePanel.width / 2, 
    grapePanel.y + grapePanel.height / 2
  );
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw multi-line text centered vertically
  const lineHeight = 64; // Line height for 62px font
  const totalTextHeight = lines.length * lineHeight;
  const startY = -totalTextHeight / 2 + lineHeight / 2;
  
  // Draw each line of text
  lines.forEach((line, index) => {
    const yPos = startY + index * lineHeight;
    ctx.fillText(line, 0, yPos);
  });
  
  ctx.restore();
};

/**
 * Draws the closure type icon and text
 */
export const drawClosureType = (
  ctx: CanvasRenderingContext2D,
  closureText: string
): void => {
  const { closureType } = CANVAS_CONFIG.panels;
  
  // Draw the icon background
  ctx.fillStyle = closureType.color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.rect(
    closureType.x, 
    closureType.y, 
    closureType.width, 
    closureType.height
  );
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Draw closure type text
  ctx.font = CANVAS_CONFIG.fonts.closure;
  ctx.fillStyle = '#3F0E09';
  ctx.textAlign = 'center';
  
  // Process multi-line closure type text
  const closureLines = (closureText.toUpperCase() || 'CLOSURE\nTYPE').split('\n');
  
  if (closureLines.length === 1) {
    ctx.fillText(
      closureLines[0], 
      closureType.x + closureType.width / 2, 
      closureType.y + closureType.height + 34 + 56
    );
  } else {
    ctx.fillText(
      'CLOSURE', 
      closureType.x + closureType.width / 2, 
      closureType.y + closureType.height + 34 + 56
    );
    ctx.fillText(
      'TYPE', 
      closureType.x + closureType.width / 2, 
      closureType.y + closureType.height + 34 + 56 + 64
    );
  }
};

/**
 * Draws the country icon and text
 */
export const drawCountryIcon = (
  ctx: CanvasRenderingContext2D,
  countryText: string
): void => {
  const { countryIcon } = CANVAS_CONFIG.panels;
  
  // Draw the icon background
  ctx.fillStyle = countryIcon.color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.rect(
    countryIcon.x, 
    countryIcon.y, 
    countryIcon.width, 
    countryIcon.height
  );
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Draw country text
  ctx.font = CANVAS_CONFIG.fonts.country;
  ctx.fillStyle = '#3F0E09';
  ctx.textAlign = 'center';
  ctx.fillText(
    countryText.toUpperCase() || 'COUNTRY', 
    countryIcon.x + countryIcon.width / 2, 
    countryIcon.y + countryIcon.height + 18 + 56
  );
};

/**
 * Draws error state on canvas when image fails to load
 */
export const drawErrorState = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Clear canvas and draw error state
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#666';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Error loading image', canvasWidth / 2, canvasHeight / 2);
  ctx.font = 'normal 24px Arial, sans-serif';
  ctx.fillText('URL may be invalid or inaccessible', canvasWidth / 2, canvasHeight / 2 + 40);
};

/**
 * Draws the complete wine label on canvas
 */
export const drawWineLabel = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  wineInfo: {
    taste: string;
    type: string;
    corkType: string;
    origin: string;
  }
): void => {
  const { width, height } = CANVAS_CONFIG;
  
  // Set canvas dimensions
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  
  // Draw each component
  drawBackgroundImage(ctx, img, width, height);
  drawSweetnessPanel(ctx, wineInfo.taste);
  drawGrapePanel(ctx, wineInfo.type);
  drawClosureType(ctx, wineInfo.corkType);
  drawCountryIcon(ctx, wineInfo.origin);
};
