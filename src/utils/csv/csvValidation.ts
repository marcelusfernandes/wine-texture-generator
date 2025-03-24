
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
 * Simplificado: Retorna a URL como string, sem validações
 */
export const validateImageUrl = (url: string | undefined): string | null => {
  console.log(`[URL Validation] Recebido: ${url}`);
  
  if (!url || url.trim() === '') {
    console.log(`[URL Validation] URL vazia ou indefinida`);
    return null;
  }
  
  // Remove quotes that might have been incorrectly parsed from CSV
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
  console.log(`[URL Validation] URL após limpeza: "${cleanUrl}"`);
  
  // Retorna a URL sem validações
  return cleanUrl;
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
