
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
  console.log(`[URL Validation] Validando URL: ${url}`);
  
  if (!url || url.trim() === '') {
    console.log(`[URL Validation] URL vazia ou indefinida`);
    return null;
  }
  
  // Remove quotes that might have been incorrectly parsed from CSV
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
  console.log(`[URL Validation] URL após remover aspas: "${cleanUrl}"`);
  
  // Check if it's just a number (probably mistaken for a URL)
  if (/^\d+$/.test(cleanUrl)) {
    console.log(`[URL Validation] URL inválida (apenas números): "${cleanUrl}"`);
    return null;
  }
  
  // Try to ensure URL has protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // If it looks like a domain (contains dots, no spaces), add https
    if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
      console.log(`[URL Validation] Adicionando protocolo https:// à URL: "${cleanUrl}"`);
      cleanUrl = `https://${cleanUrl}`;
    } else {
      console.log(`[URL Validation] URL sem formato válido e não parece ser um domínio: "${cleanUrl}"`);
      return null;
    }
  }
  
  // Validate that it's a proper URL
  try {
    new URL(cleanUrl);
    console.log(`[URL Validation] URL válida após processamento: "${cleanUrl}"`);
    return cleanUrl;
  } catch (error) {
    console.log(`[URL Validation] Erro ao analisar URL: "${cleanUrl}"`, error);
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
  const isValid = Boolean(
    (wineInfo.type && wineInfo.type.length > 0) || 
    (wineInfo.origin && wineInfo.origin.length > 0)
  );
  
  console.log(`[Wine Validation] Validando dados de vinho: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`, wineInfo);
  
  return isValid;
};

