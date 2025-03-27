import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WineInfo } from '@/components/TextInputs';
import { isImageFile } from '@/utils/imageUtils';
import ImagePreview from '@/components/ImagePreview';
import JSZip from 'jszip';

interface WineItem {
  id: string;
  imageUrl: string;
  wineInfo: WineInfo;
  filename: string;
}

const Winemass = () => {
  const [wineItems, setWineItems] = useState<WineItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const extractInfoFromFilename = (filename: string): WineInfo => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('.');
    const [_, type = '', origin = '', taste = '', corkType = ''] = parts;
    
    return {
      type: type.replace(/-/g, ' ') || 'Não especificado',
      origin: origin.replace(/-/g, ' ') || 'Não especificado',
      taste: taste.replace(/-/g, ' ') || 'Não especificado',
      corkType: corkType.replace(/-/g, ' ') || 'Não especificado',
      info_base: 'Não especificado'
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newWineItems: WineItem[] = Array.from(files).map((file) => {
      if (!isImageFile(file)) {
        toast.error(`Arquivo ${file.name} não é uma imagem válida`);
        return null;
      }

      const url = URL.createObjectURL(file);
      const wineInfo = extractInfoFromFilename(file.name);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: url,
        wineInfo,
        filename: file.name
      };
    }).filter((item): item is WineItem => item !== null);

    setWineItems(prev => [...prev, ...newWineItems]);
    toast.success(`${newWineItems.length} imagens carregadas com sucesso`);
  };

  const handleDownload = async (item: WineItem) => {
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.filename;
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

  const handleDownloadAll = async () => {
    if (wineItems.length === 0) {
      toast.error('Não há imagens para baixar');
      return;
    }

    setIsDownloading(true);
    const zip = new JSZip();
    const toastId = toast.loading('Preparando download de todas as imagens...');

    try {
      // Processar cada imagem
      for (const item of wineItems) {
        try {
          // Criar um novo canvas para cada imagem
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) {
            console.error('Não foi possível obter o contexto do canvas');
            continue;
          }

          // Configurar o tamanho do canvas
          tempCanvas.width = 1520; // Tamanho de exportação
          tempCanvas.height = 1520;

          // Preencher o fundo com branco
          tempCtx.fillStyle = 'white';
          tempCtx.fillRect(0, 0, 1520, 1520);

          // Carregar a imagem original
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.imageUrl;
          });

          // Calcular as dimensões para centralizar a imagem mantendo a proporção
          const scale = Math.min(1520 / img.width, 1520 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (1520 - scaledWidth) / 2;
          const y = (1520 - scaledHeight) / 2;

          // Desenhar a imagem centralizada
          tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

          // Desenhar container do sabor
          const taste = item.wineInfo.taste.toUpperCase();
          // Definir cor do background baseado no sabor
          const tasteColors: { [key: string]: string } = {
            'NATURE': '#FFDB49',
            'DOCE': '#7CAD84',
            'SECO': '#8A0046',
            'DEMI-SEC': '#9F336B',
            'BRUT': '#1A7028',
            'SUAVE': '#B6678B'
          };
          tempCtx.fillStyle = tasteColors[taste] || '#8B1F5B'; // Cor padrão se não encontrar
          const tasteContainerWidth = 1520 * (339/1520); // 339px em 1520px
          const tasteContainerHeight = 1520 * (824/1520); // 824px em 1520px
          const tasteContainerX = 1520 * (119/1520); // 119px em 1520px
          const tasteContainerY = 0; // 0px em 1520px
          tempCtx.fillRect(tasteContainerX, tasteContainerY, tasteContainerWidth, tasteContainerHeight);

          // Configurar fonte para o sabor
          const tasteFontSize = 1520 * (152/1520); // 152px em 1520px
          tempCtx.font = `900 ${tasteFontSize}px "Nunito"`; // Nunito Black (weight 900)
          tempCtx.textBaseline = 'middle';
          tempCtx.fillStyle = 'white';
          tempCtx.textAlign = 'center';

          // Desenhar texto do sabor
          tempCtx.save();
          tempCtx.translate(tasteContainerX + tasteContainerWidth/2, tasteContainerY + tasteContainerHeight/2);
          tempCtx.rotate(-Math.PI / 2);
          const tasteLineHeight = tasteFontSize * 1.2;
          tempCtx.fillText(taste, 0, 0);
          tempCtx.restore();

          // Desenhar container da uva
          tempCtx.fillStyle = '#666666'; // Cor cinza para o container da uva
          const grapeContainerWidth = 1520 * (267/1520); // 267px em 1520px
          const grapeContainerHeight = 1520 * (696/1520); // 696px em 1520px
          const grapeContainerX = 1520 * (153/1520); // 153px em 1520px
          const grapeContainerY = 1520 * (823/1520); // 823px em 1520px
          tempCtx.fillRect(grapeContainerX, grapeContainerY, grapeContainerWidth, grapeContainerHeight);

          // Configurar fonte para a uva
          const type = item.wineInfo.type.toUpperCase();
          const fontSize = 1520 * (100/1520); // 100px em 1520px
          const smallerFontSize = 1520 * (90/1520); // 90px em 1520px
          tempCtx.font = `900 ${fontSize}px "Nunito"`; // Nunito Black (weight 900)
          tempCtx.fillStyle = 'white';
          tempCtx.textAlign = 'center';
          tempCtx.textBaseline = 'middle';
          
          // Medir o texto para verificar se precisa quebrar em duas linhas
          const words = type.split(' ');
          let lines = [];
          let currentLine = words[0];
          
          for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = tempCtx.measureText(currentLine + ' ' + word).width;
            if (width < grapeContainerHeight * 0.6) { // Reduzido para 60% para melhor ajuste
              currentLine += ' ' + word;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
          lines.push(currentLine);

          // Desenhar texto da uva com possível quebra de linha
          tempCtx.save();
          tempCtx.translate(grapeContainerX + grapeContainerWidth/2, grapeContainerY + grapeContainerHeight/2);
          tempCtx.rotate(-Math.PI / 2);
          
          // Ajustar tamanho da fonte se houver mais de uma linha
          if (lines.length > 1) {
            tempCtx.font = `900 ${smallerFontSize}px "Nunito"`;
          }
          
          const lineHeight = lines.length > 1 ? smallerFontSize * 1.2 : fontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          const startY = -totalHeight / 2;
          
          lines.forEach((line, index) => {
            tempCtx.fillText(line, 0, startY + (index + 0.5) * lineHeight);
          });
          tempCtx.restore();

          // Carregar e desenhar ícone da tampa
          const corkImg = new Image();
          let tampaSrc = '';
          switch(item.wineInfo.corkType.toLowerCase()) {
            case 'rolha': tampaSrc = '/images/icons/rolha.png'; break;
            case 'rosca': tampaSrc = '/images/icons/rosca.png'; break;
            case 'lata': tampaSrc = '/images/icons/lata.png'; break;
            default: tampaSrc = '/images/icons/rolha.png';
          }

          await new Promise((resolve, reject) => {
            corkImg.onload = resolve;
            corkImg.onerror = () => {
              console.error('Erro ao carregar ícone da tampa:', tampaSrc);
              resolve(null);
            };
            corkImg.src = tampaSrc;
          });

          if (corkImg.complete) {
            // Dimensões e posições proporcionais ao tamanho do canvas
            const corkWidth = 1520 * (405/1520); // 405px em 1520px
            const corkHeight = 1520 * (437/1520); // 437px em 1520px
            const corkX = 1520 * (1013/1520); // 1013px em 1520px
            const corkY = 1520 * (159/1520); // 159px em 1520px
            tempCtx.drawImage(corkImg, corkX, corkY, corkWidth, corkHeight);
          }

          // Carregar e desenhar bandeira
          const flagImg = new Image();
          let normalizedCountry = item.wineInfo.origin
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .replace(/^./, str => str.toUpperCase());
          
          const countryMap: { [key: string]: string } = {
            'Franca': 'França',
            'Eua': 'Eua',
          };
          
          normalizedCountry = countryMap[normalizedCountry] || normalizedCountry;
          
          await new Promise((resolve, reject) => {
            flagImg.onload = resolve;
            flagImg.onerror = () => {
              console.error('Erro ao carregar bandeira:', normalizedCountry);
              resolve(null);
            };
            flagImg.src = `/images/icons/${normalizedCountry}.png`;
          });

          if (flagImg.complete) {
            // Dimensões e posições proporcionais ao tamanho do canvas
            const flagWidth = 1520 * (575/1520); // 575px em 1520px
            const flagHeight = 1520 * (529/1520); // 529px em 1520px
            const flagX = 1520 * (928/1520); // 928px em 1520px
            const flagY = 1520 * (906/1520); // 906px em 1520px
            tempCtx.drawImage(flagImg, flagX, flagY, flagWidth, flagHeight);
          }

          // Adicionar a imagem ao ZIP
          const blob = await new Promise<Blob>((resolve, reject) => {
            tempCanvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Falha ao criar blob da imagem'));
            }, 'image/png');
          });

          // Usar o nome original do arquivo
          zip.file(item.filename, blob);
        } catch (error) {
          console.error(`Erro ao processar imagem ${item.filename}:`, error);
          toast.error(`Erro ao processar imagem ${item.filename}`);
        }
      }

      // Gerar o arquivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Criar link de download
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wine-labels.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success('Todas as imagens foram baixadas com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      toast.dismiss(toastId);
      toast.error('Erro ao baixar as imagens');
    } finally {
      setIsDownloading(false);
    }
  };

  const removeWineItem = (id: string) => {
    setWineItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item) {
        URL.revokeObjectURL(item.imageUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/batch">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Upload em Massa de Rótulos</h1>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={wineItems.length === 0 || isDownloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Todas
          </Button>
        </header>

        <div className="p-6 rounded-xl glass-panel animate-fade-up mb-8">
          <h2 className="text-xl font-medium mb-4">Upload de Imagens</h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              multiple
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">Arraste e solte suas imagens de vinho</h3>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar arquivos</p>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos suportados: JPG, PNG, GIF, WEBP
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Nome do arquivo deve seguir o formato: nome.uva.origem.sabor.tampa.png
              </p>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wineItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium truncate">
                    {item.filename}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeWineItem(item.id)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gray-50 rounded-lg mb-4">
                  <ImagePreview imageUrl={item.imageUrl} wineInfo={item.wineInfo} />
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Tipo:</strong> {item.wineInfo.type}</p>
                  <p><strong>Origem:</strong> {item.wineInfo.origin}</p>
                  <p><strong>Sabor:</strong> {item.wineInfo.taste}</p>
                  <p><strong>Tampa:</strong> {item.wineInfo.corkType}</p>
                </div>
                <Button
                  variant="secondary"
                  className="w-full mt-4 gap-2"
                  onClick={() => handleDownload(item)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Winemass;
