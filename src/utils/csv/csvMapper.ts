
import { WineInfo } from "@/components/TextInputs";
import { CsvWineRow } from "./csvTypes";

/**
 * Converte dados de linha CSV para objeto WineInfo
 * @param rowData Os dados da linha CSV
 * @returns Objeto WineInfo com valores mapeados
 */
export const mapCsvRowToWineInfo = (rowData: CsvWineRow): WineInfo => {
  // Log detalhado para depuração do campo info_base
  if (rowData.info_base) {
    console.log(`[CSV Mapper] info_base original: "${rowData.info_base}" (${rowData.info_base.length} caracteres)`);
  }
  
  // Verificamos se o info_base contém uma URL
  const urlRegex = /https?:\/\/[^\s]+/;
  let imageUrl = rowData.image_url || null;
  let info_base = rowData.info_base || '';
  
  // Se o info_base contém uma URL e não temos image_url, use-a como imageUrl
  if (!imageUrl && info_base && urlRegex.test(info_base)) {
    imageUrl = info_base;
    console.log(`[CSV Mapper] URL detectada em info_base, usando como imageUrl: "${imageUrl}"`);
  }
  
  return {
    type: rowData.grape_variety || 'Desconhecido',
    origin: rowData.origin || 'Outra',
    taste: rowData.taste || 'Seco',
    corkType: rowData.closure_type || 'Rolha',
    info_base: info_base,
    imageUrl: imageUrl
  };
};

/**
 * Processa e mapeia rows do CSV para o formato utilizado pela aplicação
 */
export const mapCsvRowsToWineLabels = (rows: CsvWineRow[]): {
  name: string;
  imageUrl: string | null;
  wineInfo: WineInfo;
  isValid: boolean;
}[] => {
  console.log(`[CSV Mapper] Iniciando mapeamento de ${rows.length} linhas para rótulos de vinho`);
  
  return rows.map((row, index) => {
    // Log dos dados brutos para depuração
    console.log(`[CSV Mapper] Dados da linha ${index + 1}:`, row);
    
    const wineInfo = mapCsvRowToWineInfo(row);
    
    // Usa o nome do label ou gera um nome padrão
    const name = row.label_name || `Vinho ${Math.floor(Math.random() * 1000)}`;
    
    console.log(`[CSV Mapper] Processando linha ${index + 1}: "${name}"`);
    console.log(`[CSV Mapper] info_base mapeado: "${wineInfo.info_base}" (${wineInfo.info_base?.length || 0} caracteres)`);
    console.log(`[CSV Mapper] imageUrl definido: ${wineInfo.imageUrl || 'null'}`);
    
    // Utilizamos a imageUrl do wineInfo
    const imageUrl = wineInfo.imageUrl;
    
    return { 
      name, 
      wineInfo, 
      imageUrl, 
      isValid: true
    };
  });
};
