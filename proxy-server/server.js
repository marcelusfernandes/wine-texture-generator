const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
const exec = require('child_process').exec;

// Middleware para processar JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configurar CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:5173', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));

// Middleware para adicionar cabeçalhos CORS a todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
  
  // Permitir compartilhamento de credenciais
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Função para aplicar edições à imagem baseadas no tipo de vinho
async function applyWineEditToImage(buffer, options) {
  try {
    let image = sharp(buffer);
    
    // 1. Obter metadados da imagem
    const metadata = await image.metadata();
    
    // 2. Preparar os textos e elementos para o rótulo
    const wineName = options.wineName || 'Vinho';
    const wineType = options.wineType || 'GRAPE VARIETY';
    const wineOrigin = options.wineOrigin || 'COUNTRY';
    const wineTaste = options.wineTaste || 'SWEET';
    const corkType = options.corkType || 'CLOSURE';

    // Redimensionar a imagem para 1080x1080 para padronizar o layout
    const targetSize = 1080;
    
    // Calcular a dimensão para o redimensionamento preservando a proporção
    let resizeOptions = {};
    if (metadata.width >= metadata.height) {
      // Imagem mais larga que alta
      resizeOptions = {
        height: targetSize,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention
      };
    } else {
      // Imagem mais alta que larga
      resizeOptions = {
        width: targetSize,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention
      };
    }
    
    // Redimensionar a imagem
    image = image.resize(resizeOptions);
    
    // Adicionar padding para garantir saída quadrada 1080x1080
    image = image.extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }).resize(targetSize, targetSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } });
    
    // Tamanho final fixo
    const width = targetSize;
    const height = targetSize;
    
    // Log detalhado das informações sendo aplicadas à imagem
    console.log('-------------------------------------------');
    console.log('🍷 APLICANDO LAYOUT NA IMAGEM EXPORTADA:');
    console.log('-------------------------------------------');
    console.log(`🖼️ Dimensões originais: ${metadata.width}x${metadata.height}px`);
    console.log(`🖼️ Dimensões padronizadas: ${width}x${height}px`);
    console.log(`🔤 Dados Aplicados:`);
    console.log(`   • Nome do vinho: ${wineName} (não exibido no layout)`);
    console.log(`   • Tipo de vinho: ${wineType}`);
    console.log(`   • País de origem: ${wineOrigin}`);
    console.log(`   • Sabor: ${wineTaste}`);
    console.log(`   • Tipo de rolha: ${corkType}`);
    console.log(`   • Variedade de uva: ${wineType}`);
    console.log('-------------------------------------------');
    console.log(`🎨 Layout aplicado: Barras laterais + blocos de informação`);
    console.log('-------------------------------------------');
    
    // 3. Criar o overlay SVG com o layout exato do rótulo seguindo a referência visual
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;900&display=swap');
            
            .sweet-text { 
              fill: white; 
              font-size: 110px;
              font-family: 'Nunito Sans', sans-serif; 
              font-weight: 900;
              text-anchor: middle;
              text-transform: uppercase;
              line-height: 80px;
              word-wrap: break-word;
            }
            .grape-text { 
              fill: white; 
              font-size: 62px;
              font-family: 'Nunito Sans', sans-serif; 
              font-weight: 900;
              text-anchor: middle;
              text-transform: uppercase;
              line-height: 64px;
              word-wrap: break-word;
            }
            .info-text { 
              fill: #3F0E09; 
              font-size: 56px;
              font-family: 'Nunito Sans', sans-serif; 
              font-weight: 900;
              text-anchor: middle;
              text-transform: uppercase;
              line-height: 64px;
              word-wrap: break-word;
            }
          </style>
        </defs>
        
        <!-- Bloco esquerdo superior - cor vinho para sweet -->
        <rect 
          x="104" 
          y="0" 
          width="240" 
          height="587" 
          fill="#890045" 
        />
        
        <!-- Bloco esquerdo inferior - cor cinza para grape variety -->
        <rect 
          x="129" 
          y="587" 
          width="190" 
          height="492" 
          fill="#666666" 
        />
        
        <!-- Blocos brancos de fundo -->
        <rect 
          x="729" 
          y="375" 
          width="268" 
          height="134" 
          fill="white" 
        />
        
        <rect 
          x="678" 
          y="932" 
          width="378" 
          height="134" 
          fill="white" 
        />
        
        <!-- Country - Posição Inferior Direita -->
        <g transform="translate(660, 708)">
          <!-- Quadrado cinza para Country -->
          <rect 
            x="${412/2 - 209/2}" 
            y="0" 
            width="209" 
            height="210" 
            fill="#D9D9D9" 
          />
          
          <!-- Texto Country -->
          <text 
            x="${412/2}" 
            y="${210 + 72/2}" 
            class="info-text"
            text-anchor="middle"
          >${wineOrigin}</text>
        </g>
        
        <!-- Closure Type - Posição Superior Direita -->
        <g transform="translate(700, 151)">        
          <!-- Imagem de lacre -->
        </g>
        
        <!-- Texto SWEET vertical no bloco vinho -->
        <g transform="translate(${104 + 240/2}, ${587/2})">
          <text 
            transform="rotate(-90)"
            class="sweet-text"
            text-anchor="middle"
            dominant-baseline="middle"
          >${wineTaste}</text>
        </g>
        
        <!-- Texto GRAPE VARIETY vertical no bloco cinza -->
        <g transform="translate(${129 + 190/2}, ${587 + 492/2})">
          <text 
            transform="rotate(-90)"
            class="grape-text"
            text-anchor="middle"
            dominant-baseline="middle"
          >${options.grape_variety || wineType}</text>
        </g>
      </svg>
    `;
    
    // 4. Compor a imagem com o overlay SVG
    const svgBuffer = Buffer.from(svgOverlay);
    image = image.composite([
      { input: svgBuffer, gravity: 'center' }
    ]);
    
    // Carregar a imagem lacre.png
    const lacreImage = await sharp(path.join(__dirname, 'public', 'images', 'lacre.png'))
      .resize(100, 100)
      .toBuffer();

    // Compor a imagem lacre.png na imagem final
    image = image.composite([
      { input: lacreImage, left: 336 / 2 - 50, top: 210 + 10 }
    ]);

    // Retornar a imagem processada como buffer PNG
    return await image.png().toBuffer();
  } catch (error) {
    console.error('[Image Processing] Error:', error);
    throw error;
  }
}

// Endpoint para proxy de imagens
app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Verificar se é uma URL blob
  if (imageUrl.startsWith('blob:')) {
    return res.status(400).json({ 
      error: 'Blob URLs are not supported. Please convert the image to base64 before sending.',
      details: 'Blob URLs are temporary and only accessible within the browser context.'
    });
  }
  
  // Verificar se é um download forçado e/ou edição
  const isDownload = req.query.download === 'true';
  const isEdit = req.query.edit === 'true';
  const customFilename = req.query.filename || '';
  
  // Opções de edição
  const editOptions = {
    wineType: req.query.wineType || '',
    wineOrigin: req.query.wineOrigin || '',
    wineTaste: req.query.wineTaste || '',
    wineName: req.query.wineName || '',
    corkType: req.query.corkType || '',
    grape_variety: req.query.grape_variety || 'GRAPE VARIETY'
  };
  
  console.log(`[Proxy] Fetching image from: ${imageUrl} (download: ${isDownload}, edit: ${isEdit})`);
  if (isEdit) {
    console.log(`[Proxy] Edit options:`, editOptions);
    console.log(`[Proxy] Filename: ${customFilename}`);
  }
  
  try {
    // Configurar cabeçalhos para evitar problemas de referrer
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Referer': 'https://www.google.com/',
      'sec-fetch-dest': 'image',
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'cross-site'
    };
    
    // Tente obter a origem da URL para usar como referrer
    try {
      const urlObj = new URL(imageUrl);
      headers.Referer = urlObj.origin;
      headers.Origin = urlObj.origin;
      // Adicionar o hostname como um header adicional
      headers['X-Forwarded-Host'] = urlObj.hostname;
    } catch (e) {
      console.log('Could not parse URL origin:', e.message);
    }
    
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      headers,
      timeout: 15000, // Aumentado para 15 segundos
      maxRedirects: 5,
      validateStatus: () => true // Aceitar qualquer código de status
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (response.status >= 400) {
      console.log(`[Proxy] Error fetching image. Status: ${response.status}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch image. Status: ${response.status}` 
      });
    }
    
    // Obter o tipo de conteúdo da resposta ou inferir pelo URL
    let contentType = response.headers['content-type'];
    if (!contentType || contentType === 'application/octet-stream') {
      // Tenta inferir pelo URL
      if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (imageUrl.endsWith('.png')) {
        contentType = 'image/png';
      } else if (imageUrl.endsWith('.gif')) {
        contentType = 'image/gif';
      } else if (imageUrl.endsWith('.webp')) {
        contentType = 'image/webp';
      } else {
        contentType = 'image/jpeg'; // Fallback para JPEG
      }
    }
    
    // Se a edição está ativada, processar a imagem antes de enviar
    let imageData = response.data;
    if (isEdit) {
      try {
        console.log(`[Proxy] Applying edits to image`);
        imageData = await applyWineEditToImage(imageData, editOptions);
        contentType = 'image/png'; // A saída após edição é sempre PNG
      } catch (editError) {
        console.error(`[Proxy] Error applying edits:`, editError);
        // Se falhar a edição, continuamos com a imagem original
      }
    }
    
    // Definir cabeçalhos da resposta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    
    // Adicionar cabeçalho para download, alterando o comportamento com base no parâmetro download
    let filename;
    if (customFilename) {
      filename = customFilename;
    } else {
      filename = imageUrl.split('/').pop().split('?')[0] || 'image.png';
    }
    
    // Se foi solicitado download, force o Content-Disposition para 'attachment'
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      console.log(`[Proxy] Downloading image as ${filename}`);
    } else {
      // Caso contrário, defina como 'inline' para visualização normal
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }
    
    // Enviar a imagem
    console.log(`[Proxy] Success. Sending image as ${contentType}${isEdit ? ' (edited)' : ''}`);
    res.send(imageData);
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    res.status(500).json({ 
      error: 'Error fetching or processing the image',
      details: error.message
    });
  }
});

// Endpoint para download de todas as imagens
app.post('/download-all', async (req, res) => {
  console.log('[Download All] Received request with body');
  
  const images = req.body.images;
  
  if (!images || !Array.isArray(images)) {
    console.error('[Download All] Invalid request body:', req.body);
    return res.status(400).json({ error: 'Images parameter is required and must be an array' });
  }
  
  try {
    console.log(`[Download All] Processing ${images.length} images`);
    
    // Criar diretório de downloads se não existir
    const downloadsDir = path.join(__dirname, 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    const downloadPromises = images.map(async (image, index) => {
      console.log(`[Download All] Processing image ${index + 1}: ${image.filename}`);
      
      // Extrair os dados base64 da URL
      const base64Data = image.data.split(',')[1];
      const imageData = Buffer.from(base64Data, 'base64');
      
      const filepath = path.join(downloadsDir, image.filename);
      fs.writeFileSync(filepath, imageData);
      console.log(`[Download All] Saved image ${index + 1} to ${filepath}`);
      return image.filename;
    });
    
    const downloadedFiles = await Promise.all(downloadPromises);
    console.log('[Download All] Successfully downloaded all images');
    res.json({ success: true, files: downloadedFiles });
  } catch (error) {
    console.error('[Download All] Error:', error);
    res.status(500).json({ 
      error: 'Failed to download images',
      details: error.message
    });
  }
});

// Rota de status para verificar se o servidor está funcionando
app.get('/status', (req, res) => {
  res.json({ status: 'Proxy server is running' });
});

// Rota básica para verificar
app.get('/', (req, res) => {
  res.send(`
    <h1>Wine Image Proxy</h1>
    <p>CORS Proxy server is running. Use /proxy?url=IMAGE_URL to proxy images.</p>
    <p>Example: <a href="/proxy?url=https://example.com/image.jpg">/proxy?url=https://example.com/image.jpg</a></p>
    <p>For direct download: <a href="/proxy?download=true&url=https://example.com/image.jpg">/proxy?download=true&url=https://example.com/image.jpg</a></p>
    <p>For edited download: <a href="/proxy?download=true&edit=true&wineType=tinto&url=https://example.com/image.jpg">/proxy?download=true&edit=true&wineType=tinto&url=https://example.com/image.jpg</a></p>
  `);
});

// Configurar a porta (por padrão 3000, mas pode ser alterada via variável de ambiente)
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Access proxy at: http://localhost:${PORT}/proxy?url=YOUR_IMAGE_URL`);
  console.log(`Check status at: http://localhost:${PORT}/status`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying to close the existing process...`);
    exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
      if (err) {
        console.error('Failed to find process using port:', err);
        return;
      }
      const processId = stdout.trim().split(/\s+/).pop();
      if (processId) {
        exec(`taskkill /PID ${processId} /F`, (err) => {
          if (err) {
            console.error('Failed to kill process:', err);
          } else {
            console.log(`Process ${processId} killed. Restarting server...`);
            server.listen(PORT);
          }
        });
      }
    });
  } else {
    console.error('Server error:', error);
  }
});
