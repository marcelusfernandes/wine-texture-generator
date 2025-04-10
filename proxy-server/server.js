const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
const exec = require('child_process').exec;

// Configuração básica do express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração simples do CORS - permite todas as origens
app.use(cors());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Função para aplicar edições à imagem baseadas no tipo de vinho
async function applyWineEditToImage(buffer, options) {
  try {
    let image = sharp(buffer);
    
    // 1. Obter metadados da imagem
    const metadata = await image.metadata();
    
    // Log das informações da imagem original
    console.log('-------------------------------------------');
    console.log('🍷 PROCESSANDO IMAGEM ORIGINAL:');
    console.log('-------------------------------------------');
    console.log(`🖼️ Dimensões originais: ${metadata.width}x${metadata.height}px`);
    console.log('-------------------------------------------');

    // Retornar a imagem sem modificações
    return await image.toBuffer();
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
  
  // Verificar se é um download forçado
  const isDownload = req.query.download === 'true';
  const customFilename = req.query.filename || '';
  
  console.log(`[Proxy] Fetching image from: ${imageUrl} (download: ${isDownload})`);
  
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
      headers['X-Forwarded-Host'] = urlObj.hostname;
    } catch (e) {
      console.log('Could not parse URL origin:', e.message);
    }
    
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true
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
      if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (imageUrl.endsWith('.png')) {
        contentType = 'image/png';
      } else if (imageUrl.endsWith('.gif')) {
        contentType = 'image/gif';
      } else if (imageUrl.endsWith('.webp')) {
        contentType = 'image/webp';
      } else {
        contentType = 'image/jpeg';
      }
    }
    
    // Definir cabeçalhos da resposta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Adicionar cabeçalho para download
    let filename = customFilename || imageUrl.split('/').pop().split('?')[0] || 'image.png';
    
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      console.log(`[Proxy] Downloading image as ${filename}`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }
    
    // Enviar a imagem original sem modificações
    console.log(`[Proxy] Success. Sending original image as ${contentType}`);
    res.send(response.data);
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
  console.log('[Download All] Received request');
  
  try {
    const images = req.body.images;
    
    if (!images || !Array.isArray(images)) {
      console.error('[Download All] Invalid request body:', req.body);
      return res.status(400).json({ 
        error: 'Images parameter is required and must be an array',
        received: req.body 
      });
    }

    if (images.length === 0) {
      return res.status(400).json({
        error: 'Images array cannot be empty'
      });
    }
    
    console.log(`[Download All] Processing ${images.length} images`);
    
    // Criar diretório de downloads se não existir
    const downloadsDir = path.join(__dirname, 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    const downloadPromises = images.map(async (image, index) => {
      try {
        if (!image.url) {
          throw new Error(`Missing URL for image ${index + 1}`);
        }

        // Validar URL
        try {
          new URL(image.url);
        } catch (e) {
          throw new Error(`Invalid URL for image ${index + 1}: ${image.url}`);
        }

        console.log(`[Download All] Processing image ${index + 1}: ${image.url}`);

        // Configurar cabeçalhos para evitar problemas de referrer
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.google.com/',
          'sec-fetch-dest': 'image',
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-site': 'cross-site'
        };

        // Tentar obter o referrer da URL original
        try {
          const urlObj = new URL(image.url);
          headers.Referer = urlObj.origin;
          headers.Origin = urlObj.origin;
        } catch (e) {
          console.log(`Could not parse origin for URL ${image.url}:`, e.message);
        }

        // Baixar a imagem original
        const response = await axios({
          url: image.url,
          method: 'GET',
          responseType: 'arraybuffer',
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 400
        });

        // Verificar o content-type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Invalid content type for image ${index + 1}: ${contentType}`);
        }

        // Gerar nome do arquivo baseado na URL ou usar o nome fornecido
        const filename = image.filename || image.url.split('/').pop().split('?')[0] || `image_${index + 1}.jpg`;
        const filepath = path.join(downloadsDir, filename);
        
        // Salvar a imagem original
        await fs.promises.writeFile(filepath, response.data);
        console.log(`[Download All] Saved original image ${index + 1} to ${filepath}`);
        
        return {
          filename,
          originalUrl: image.url,
          size: response.data.length,
          contentType
        };
      } catch (error) {
        console.error(`[Download All] Error processing image ${index + 1}:`, error);
        return {
          error: true,
          originalUrl: image.url,
          message: error.message
        };
      }
    });
    
    const results = await Promise.all(downloadPromises);
    const downloadedFiles = results.filter(r => !r.error);
    const errors = results.filter(r => r.error);
    
    if (downloadedFiles.length === 0) {
      throw new Error('No images were successfully processed');
    }
    
    console.log('[Download All] Successfully downloaded all images');
    res.json({ 
      success: true, 
      files: downloadedFiles,
      totalProcessed: downloadedFiles.length,
      totalFailed: errors.length,
      errors: errors
    });
  } catch (error) {
    console.error('[Download All] Error:', error);
    res.status(500).json({ 
      error: 'Failed to download images',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
