import React, { useEffect, useRef } from 'react';
import { WineInfo } from './TextInputs';

interface ImagePreviewProps {
  imageUrl: string | null;
  wineInfo: WineInfo;
}

const PREVIEW_SIZE = 380;
const EXPORT_SIZE = 1520;

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, wineInfo }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderToCanvas = async (canvas: HTMLCanvasElement, size: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageUrl) return;

    // Configurar o canvas com o tamanho desejado
    canvas.width = size;
    canvas.height = size;

    // Preencher o fundo com branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Carregar e desenhar a imagem original
    const image = new Image();
    await new Promise((resolve) => {
      image.onload = resolve;
      image.src = imageUrl;
    });

    // Calcular as dimensões para centralizar a imagem mantendo a proporção
    const scale = Math.min(size / image.width, size / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;

    // Desenhar a imagem centralizada
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Desenhar container do sabor
    const taste = wineInfo.taste.toUpperCase();
    // Definir cor do background baseado no sabor
    const tasteColors: { [key: string]: string } = {
      'NATURE': '#FFDB49',
      'DOCE': '#7CAD84',
      'SECO': '#8A0046',
      'DEMI-SEC': '#9F336B',
      'BRUT': '#1A7028',
      'SUAVE': '#B6678B'
    };
    ctx.fillStyle = tasteColors[taste] || '#8B1F5B'; // Cor padrão se não encontrar
    const tasteContainerWidth = size * (339/1520); // 339px em 1520px
    const tasteContainerHeight = size * (824/1520); // 824px em 1520px
    const tasteContainerX = size * (119/1520); // 119px em 1520px
    const tasteContainerY = 0; // 0px em 1520px
    ctx.fillRect(tasteContainerX, tasteContainerY, tasteContainerWidth, tasteContainerHeight);

    // Configurar fonte para o sabor
    const tasteFontSize = size * (152/1520); // 152px em 1520px
    ctx.font = `900 ${tasteFontSize}px "Nunito"`; // Nunito Black (weight 900)
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    // Desenhar texto do sabor
    ctx.save();
    ctx.translate(tasteContainerX + tasteContainerWidth/2, tasteContainerY + tasteContainerHeight/2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(taste, 0, 0);
    ctx.restore();

    // Desenhar container da uva
    ctx.fillStyle = '#666666'; // Cor cinza para o container da uva
    const grapeContainerWidth = size * (267/1520); // 267px em 1520px
    const grapeContainerHeight = size * (696/1520); // 696px em 1520px
    const grapeContainerX = size * (153/1520); // 153px em 1520px
    const grapeContainerY = size * (823/1520); // 823px em 1520px
    ctx.fillRect(grapeContainerX, grapeContainerY, grapeContainerWidth, grapeContainerHeight);

    // Configurar fonte para a uva
    const type = wineInfo.type.toUpperCase();
    const fontSize = size * (100/1520); // 100px em 1520px
    const smallerFontSize = size * (90/1520); // 90px em 1520px
    ctx.font = `900 ${fontSize}px "Nunito"`; // Nunito Black (weight 900)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Medir o texto para verificar se precisa quebrar em duas linhas
    const words = type.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < grapeContainerHeight * 0.8) { // 80% da altura do container para margem
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    // Desenhar texto da uva com possível quebra de linha
    ctx.save();
    ctx.translate(grapeContainerX + grapeContainerWidth/2, grapeContainerY + grapeContainerHeight/2);
    ctx.rotate(-Math.PI / 2);
    
    // Ajustar tamanho da fonte se houver mais de uma linha
    if (lines.length > 1) {
      ctx.font = `900 ${smallerFontSize}px "Nunito"`;
    }
    
    const lineHeight = lines.length > 1 ? smallerFontSize * 1.2 : 0;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = -totalHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, startY + (index * lineHeight));
    });
    ctx.restore();

    // Carregar e desenhar ícone da uva
    const grapeImg = new Image();
    let normalizedGrape = wineInfo.type
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, ' ') // Mantém espaços normais
      .replace(/^./, str => str.toUpperCase()) // Primeira letra maiúscula
      .trim(); // Remove espaços extras
    
    const grapeMap: { [key: string]: string } = {
      // Casos especiais com acentos
      'Albarino': 'Albariño',
      'Carmenere': 'Carménère',
      'Fernao Pires': 'Fernão Pires',
      'Niagara': 'Niágara',
      
      // Casos com espaços e combinações
      'Bordo e Isabel': 'Blend',
      'Isabel e Niagara': 'Blend',
      'Petit Verdot': 'Petit verdot',
      'Ugni Blanc': 'Ugni blanc',
      'Sauvignon Blanc': 'Sauvignon blanc',
      'Pinot Grigio': 'Pinot Grigio',
      'Pinot Gris': 'Pinot Grigio', // Mesmo ícone que Pinot Grigio
      'Pinot Noir': 'Pinot Noir',
      'Pinot Noir Merlot': 'Blend', // Combinação usa ícone de Blend
      'Chenin Blanc': 'Chenin Blanc',
      'Cabernet Franc': 'Cabernet Franc',
      'Cabernet Sauvignon': 'Cabernet Sauvignon',
      'Corvina Veronese': 'Corvina Veronese',
      'Malsavia Bianca': 'Malsavia bianca',
      'Melon de Bourgogne': 'Melon de bourgogne',
      'Negroamaro Malvasia Nera': 'Negroamaro', // Combinação usa ícone de Negroamaro
      'Bobal Tempranillo': 'Tempranillo', // Combinação usa ícone de Tempranillo
      'Airen Macabeo': 'Blend', // Combinação usa ícone de Blend
      
      // Casos especiais com prefixo Property 1=
      'Tannat': 'Tannat',
      'Torrontes': 'Torrontés',
      'Torrontés': 'Torrontés',
      
      // Sinônimos
      'Shiraz': 'Syrah', // Mesmo que Syrah
      'Outras': 'Blend', // Usa ícone de Blend
      'Viura': 'Blend', // Não tem ícone específico
      'Cinsault': 'Blend', // Não tem ícone específico
      'Pinotage': 'Blend', // Não tem ícone específico
      'Verdejo': 'Blend', // Não tem ícone específico
      'Nero d\'Avola': 'Blend', // Não tem ícone específico
      
      // Casos simples (mantém exatamente como está no arquivo)
      'Assemblage': 'Assemblage',
      'Baga': 'Baga',
      'Barbera': 'Barbera',
      'Blend': 'Blend',
      'Bobal': 'Bobal',
      'Bonarda': 'Bonarda',
      'Bordo': 'Bordô',
      'Chardonnay': 'Chardonnay',
      'Dornfelder': 'Dornfelder',
      'Garnacha': 'Garnacha',
      'Grenache': 'Grenache',
      'Isabel': 'Isabel',
      'Lambrusco': 'Lambrusco',
      'Lorena': 'Lorena',
      'Malbec': 'Malbec',
      'Marselan': 'Marselan',
      'Merlot': 'Merlot',
      'Montepulciano': 'Montepulciano',
      'Moscato': 'Moscato',
      'Nacionais': 'Nacionais',
      'Nativas': 'Nativas',
      'Negroamaro': 'Negroamaro',
      'Primitivo': 'Primitivo',
      'Prosecco': 'Prosecco',
      'Riesling': 'Riesling',
      'Sangiovese': 'Sangiovese',
      'Syrah': 'Syrah',
      'Viognier': 'Viognier',
      'Zinfandel': 'Zinfandel'
    };
    
    // Tentar encontrar o nome exato primeiro
    normalizedGrape = grapeMap[normalizedGrape] || 
                     // Se não encontrar, tentar com a primeira letra maiúscula
                     grapeMap[normalizedGrape.charAt(0).toUpperCase() + normalizedGrape.slice(1)] ||
                     // Se ainda não encontrar, usar o nome normalizado
                     normalizedGrape;
    
    let grapeLoaded = false;
    await new Promise((resolve) => {
      grapeImg.onload = () => {
        grapeLoaded = true;
        resolve(null);
      };
      grapeImg.onerror = () => {
        console.error('Erro ao carregar ícone da uva:', normalizedGrape);
        resolve(null);
      };
      grapeImg.src = `/images/icons/uva/${normalizedGrape}.png`;
    });

    /* Código comentado - Desenho do ícone da uva
    if (grapeLoaded && grapeImg.complete) {
      const grapeIconWidth = size * (200/1520); // 200px em 1520px
      const grapeIconHeight = size * (200/1520); // 200px em 1520px
      const grapeIconX = size * (1115/1520); // 1115px em 1520px
      const grapeIconY = size * (159/1520); // 159px em 1520px
      ctx.drawImage(grapeImg, grapeIconX, grapeIconY, grapeIconWidth, grapeIconHeight);
    }
    */

    // Carregar e desenhar ícone do sabor
    const tasteImg = new Image();
    let normalizedTaste = wineInfo.taste
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '') // Remove espaços
      .replace(/^./, str => str.toUpperCase()); // Primeira letra maiúscula
    
    const tasteMap: { [key: string]: string } = {
      'Brut': 'Brut',
      'Demisec': 'DEMI-SEC',
      'Demi-sec': 'DEMI-SEC',
      'Demiseco': 'DEMI-SEC',
      'Demi': 'DEMI-SEC',
      'Doce': 'Doce',
      'Nature': 'Nature',
      'Seco': 'Seco',
      'Suave': 'Suave'
    };
    
    normalizedTaste = tasteMap[normalizedTaste] || normalizedTaste;
    
    await new Promise((resolve) => {
      tasteImg.onload = resolve;
      tasteImg.onerror = () => {
        console.error('Erro ao carregar ícone do sabor:', normalizedTaste);
        resolve(null);
      };
      tasteImg.src = `/images/icons/${normalizedTaste}.png`;
    });

    /* Código comentado - Desenho do ícone do sabor
    if (tasteImg.complete) {
      const tasteIconWidth = size * (200/1520); // 200px em 1520px
      const tasteIconHeight = size * (200/1520); // 200px em 1520px
      const tasteIconX = size * (1115/1520); // 1115px em 1520px
      const tasteIconY = size * (400/1520); // 400px em 1520px
      ctx.drawImage(tasteImg, tasteIconX, tasteIconY, tasteIconWidth, tasteIconHeight);
    }
    */

    // Carregar e desenhar ícone da tampa
    const corkImg = new Image();
    let tampaSrc = '';
    switch(wineInfo.corkType.toLowerCase()) {
      case 'rolha': tampaSrc = '/images/icons/rolha.png'; break;
      case 'rosca': tampaSrc = '/images/icons/rosca.png'; break;
      case 'lata': tampaSrc = '/images/icons/lata.png'; break;
      default: tampaSrc = '/images/icons/rolha.png';
    }

    await new Promise((resolve) => {
      corkImg.onload = resolve;
      corkImg.onerror = () => {
        console.error('Erro ao carregar ícone da tampa:', tampaSrc);
        resolve(null);
      };
      corkImg.src = tampaSrc;
    });

    if (corkImg.complete) {
      // Dimensões e posições proporcionais ao tamanho do canvas
      const corkWidth = size * (405/1520); // 405px em 1520px
      const corkHeight = size * (437/1520); // 437px em 1520px
      const corkX = size * (1013/1520); // 1013px em 1520px
      const corkY = size * (159/1520); // 159px em 1520px
      ctx.drawImage(corkImg, corkX, corkY, corkWidth, corkHeight);
    }

    // Carregar e desenhar bandeira
    const flagImg = new Image();
    let normalizedCountry = wineInfo.origin
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toUpperCase());
    
    const countryMap: { [key: string]: string } = {
      'Franca': 'França',
      'Eua': 'Eua',
    };
    
    normalizedCountry = countryMap[normalizedCountry] || normalizedCountry;
    
    await new Promise((resolve) => {
      flagImg.onload = resolve;
      flagImg.onerror = () => {
        console.error('Erro ao carregar bandeira:', normalizedCountry);
        resolve(null);
      };
      flagImg.src = `/images/icons/${normalizedCountry}.png`;
    });

    if (flagImg.complete) {
      // Dimensões e posições proporcionais ao tamanho do canvas
      const flagWidth = size * (575/1520); // 575px em 1520px
      const flagHeight = size * (529/1520); // 529px em 1520px
      const flagX = size * (928/1520); // 928px em 1520px
      const flagY = size * (906/1520); // 906px em 1520px
      ctx.drawImage(flagImg, flagX, flagY, flagWidth, flagHeight);
    }
  };

  useEffect(() => {
    const loadFonts = async () => {
      // Carregar fonte Nunito Bold (700)
      const fontBold = new FontFace('Nunito', 'url(https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5tU1E.woff2)', {
        weight: '700',
        style: 'normal'
      });

      // Carregar fonte Nunito Black (900)
      const fontBlack = new FontFace('Nunito', 'url(https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5tU1E.woff2)', {
        weight: '900',
        style: 'normal'
      });

      try {
        // Carregar ambas as fontes
        const [loadedBold, loadedBlack] = await Promise.all([fontBold.load(), fontBlack.load()]);
        document.fonts.add(loadedBold);
        document.fonts.add(loadedBlack);
        
        // Renderizar preview
        if (canvasRef.current) {
          await renderToCanvas(canvasRef.current, PREVIEW_SIZE);
        }
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
      }
    };

    loadFonts();
  }, [imageUrl, wineInfo]);

  const handleDownload = async () => {
    // Criar canvas temporário para exportação
    const exportCanvas = document.createElement('canvas');
    await renderToCanvas(exportCanvas, EXPORT_SIZE);
    
    // Fazer download da imagem
    const filename = `${wineInfo.type.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.origin.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.taste.toLowerCase().replace(/\s+/g, '-')}.${wineInfo.corkType.toLowerCase().replace(/\s+/g, '-')}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = exportCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <button
          onClick={handleDownload} 
          disabled={!imageUrl}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          Download Image
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
        width={PREVIEW_SIZE}
        height={PREVIEW_SIZE}
      />
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-muted-foreground">Upload an image to preview</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
