
import { WineInfo } from "@/components/TextInputs";
import { CsvWineRow } from "./csvTypes";

/**
 * Converte dados de linha CSV para objeto WineInfo
 * @param rowData Os dados da linha CSV
 * @returns Objeto WineInfo com valores mapeados
 */
export const mapCsvRowToWineInfo = (rowData: CsvWineRow): WineInfo => {
  return {
    type: rowData.grape_variety || 'Desconhecido',
    origin: rowData.origin || 'Outra',
    taste: rowData.taste || 'Seco',
    corkType: rowData.closure_type || 'Rolha',
    imageUrl: rowData.image_url || null
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
    const wineInfo = mapCsvRowToWineInfo(row);
    
    // Usa o nome do label ou gera um nome padrão
    const name = row.label_name || `Vinho ${Math.floor(Math.random() * 1000)}`;
    
    console.log(`[CSV Mapper] Processando linha ${index + 1}: "${name}"`);
    
    // Utilizamos diretamente o imageUrl do wineInfo
    const imageUrl = wineInfo.imageUrl;
    
    return { 
      name, 
      wineInfo, 
      imageUrl, 
      isValid: true
    };
  });
};
