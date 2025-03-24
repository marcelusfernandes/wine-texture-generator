
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
 * Esta função foi mantida para compatibilidade com o código existente,
 * mas não está mais sendo usada diretamente
 */
export const validateImageUrl = (url: string | undefined): string | null => {
  if (!url || url.trim() === '') {
    return null;
  }
  
  // Remove quotes that might have been incorrectly parsed from CSV
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
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
  
  return isValid;
};
