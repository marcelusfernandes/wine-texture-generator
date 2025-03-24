
import { WineInfo } from "@/components/TextInputs";

/**
 * Normalizes a text for comparison (remove acentos, espaços extras, etc.)
 */
export const normalizeText = (text: string): string => {
  return text.trim()
    .toLowerCase()
    .replace(/"/g, '') // Remove aspas
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Validate and clean an image URL
 */
export const validateImageUrl = (url: string | undefined): string | null => {
  if (!url || url.trim() === '') return null;
  
  // Remove quotes that might have been incorrectly parsed from CSV
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
  // Check if it's just a number (probably mistaken for a URL)
  if (/^\d+$/.test(cleanUrl)) {
    console.log(`Invalid image URL detected (just numbers): ${cleanUrl}`);
    return null;
  }
  
  // Log para diagnóstico
  console.log(`Processando URL da imagem: ${cleanUrl}`);
  
  // Try to ensure URL has protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // If it looks like a domain (contains dots, no spaces), add https
    if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
      cleanUrl = `https://${cleanUrl}`;
      console.log(`URL corrigida com protocolo: ${cleanUrl}`);
    } else {
      console.log(`URL sem formato válido: ${cleanUrl}`);
      return null;
    }
  }
  
  // Validate that it's a proper URL
  try {
    new URL(cleanUrl);
    console.log(`URL válida encontrada: ${cleanUrl}`);
    return cleanUrl;
  } catch (error) {
    console.log(`Erro de análise da URL: ${cleanUrl}`);
    return null;
  }
};

/**
 * Valida os dados de vinho para garantir que são utilizáveis
 * @param wineInfo Informações do vinho a serem validadas
 * @returns Booleano indicando se os dados são válidos
 */
export const validateWineInfo = (wineInfo: WineInfo): boolean => {
  // Verifica se pelo menos type ou origin têm valores válidos (menos rigoroso agora)
  return Boolean(
    (wineInfo.type && wineInfo.type.length > 0) || 
    (wineInfo.origin && wineInfo.origin.length > 0)
  );
};
