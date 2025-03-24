
import { WineInfo } from "@/components/TextInputs";
import { parseCsvFile } from "./csvParser";
import { mapCsvRowsToWineLabels } from "./csvMapper";
import { validateWineInfo } from "./csvValidation";

/**
 * Processa um arquivo CSV e o converte em um array de rótulos de vinho
 * @param file O arquivo CSV a ser processado
 * @returns Promise com dados de rótulos de vinho processados
 */
export const processCsvFile = async (file: File): Promise<{
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
}[]> => {
  try {
    console.log(`[CSV Processor] ===== INICIANDO PROCESSAMENTO DO ARQUIVO: ${file.name} =====`);
    console.log(`[CSV Processor] Tamanho do arquivo: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`[CSV Processor] Tipo MIME: ${file.type}`);
    
    const rows = await parseCsvFile(file);
    
    if (rows.length === 0) {
      console.error(`[CSV Processor] Nenhum dado válido encontrado no CSV`);
      throw new Error('Nenhum dado válido encontrado no CSV');
    }
    
    console.log(`[CSV Processor] Foram encontradas ${rows.length} linhas válidas no CSV`);
    
    // Mapeia e valida as linhas
    console.log(`[CSV Processor] Iniciando mapeamento de ${rows.length} linhas para rótulos de vinho...`);
    const mappedLabels = mapCsvRowsToWineLabels(rows);
    
    console.log(`[CSV Processor] ${mappedLabels.length} rótulos foram mapeados do CSV`);
    
    // Contagem de URLs de imagem
    const withImageUrls = mappedLabels.filter(label => label.imageUrl !== null).length;
    console.log(`[CSV Processor] ${withImageUrls} de ${mappedLabels.length} rótulos têm URLs de imagem válidas`);
    
    // Verificação detalhada das URLs
    mappedLabels.forEach((label, index) => {
      console.log(`[CSV Processor] Rótulo #${index + 1}: "${label.name}" - URL: ${label.imageUrl || 'Sem URL válida'}`);
    });
    
    const validLabels = mappedLabels
      .filter(item => {
        const isValid = validateWineInfo(item.wineInfo);
        if (!isValid) {
          console.log(`[CSV Processor] Rótulo "${item.name}" possui informações inválidas e será filtrado`);
        }
        return isValid;
      })
      .map(({name, wineInfo, imageUrl}) => {
        // Log final para confirmar os dados processados
        console.log(`[CSV Processor] Rótulo final processado: "${name}"`);
        console.log(`[CSV Processor] -> URL da imagem: ${imageUrl || 'Sem URL'}`);
        console.log(`[CSV Processor] -> Tipo de uva: ${wineInfo.type}`);
        console.log(`[CSV Processor] -> Origem: ${wineInfo.origin}`);
        console.log(`[CSV Processor] -> Sabor: ${wineInfo.taste}`);
        console.log(`[CSV Processor] -> Tipo de tampa: ${wineInfo.corkType}`);
        
        return {
          name,
          wineInfo,
          imageUrl
        };
      });
    
    console.log(`[CSV Processor] ${validLabels.length} de ${rows.length} rótulos são válidos e serão retornados`);
    
    if (validLabels.length === 0) {
      throw new Error('Nenhum rótulo válido encontrado nos dados. Verifique se o seu CSV contém as informações necessárias.');
    }
    
    console.log(`[CSV Processor] ===== PROCESSAMENTO FINALIZADO COM SUCESSO =====`);
    return validLabels;
  } catch (error) {
    console.error('[CSV Processor] ERRO PROCESSANDO ARQUIVO CSV:', error);
    throw error;
  }
};
