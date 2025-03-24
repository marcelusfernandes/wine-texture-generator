
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
    const rows = await parseCsvFile(file);
    
    if (rows.length === 0) {
      throw new Error('Nenhum dado válido encontrado no CSV');
    }
    
    // Mapeia e valida as linhas
    const mappedLabels = mapCsvRowsToWineLabels(rows);
    
    const validLabels = mappedLabels
      .filter(item => validateWineInfo(item.wineInfo))
      .map(({name, wineInfo, imageUrl}) => {
        // Log final para confirmar os dados processados
        console.log(`Rótulo final: ${name}, URL: ${imageUrl}`);
        
        return {
          name,
          wineInfo,
          imageUrl
        };
      });
    
    console.log(`${validLabels.length} de ${rows.length} rótulos são válidos`);
    
    if (validLabels.length === 0) {
      throw new Error('Nenhum rótulo válido encontrado nos dados. Verifique se o seu CSV contém as informações necessárias.');
    }
    
    return validLabels;
  } catch (error) {
    console.error('Erro processando arquivo CSV:', error);
    throw error;
  }
};
