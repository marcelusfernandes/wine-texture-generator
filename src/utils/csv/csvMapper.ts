
import { WineInfo } from "@/components/TextInputs";
import { CsvWineRow } from "./csvTypes";
import { validateImageUrl } from "./csvValidation";

/**
 * Converte dados de linha CSV para objeto WineInfo
 * @param rowData Os dados da linha CSV
 * @returns Objeto WineInfo com valores mapeados
 */
export const mapCsvRowToWineInfo = (rowData: CsvWineRow): WineInfo => {
  return {
    // Verifica primeiro os novos cabeçalhos, depois usa os legados como fallback
    type: rowData.grape_variety || rowData.uva || 'Desconhecido',
    origin: rowData.origin || rowData.pais || 'Outra',
    taste: rowData.taste || rowData.classificacao || 'Seco',
    corkType: rowData.closure_type || rowData.tampa || 'Rolha'
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
  return rows.map(row => {
    const wineInfo = mapCsvRowToWineInfo(row);
    
    // Usa o nome do label se disponível, senão usa nome antigo, ou gera um nome padrão
    const name = row.label_name || row.nome || `Vinho ${Math.floor(Math.random() * 1000)}`;
    
    // Processa a URL da imagem
    const imageUrl = row.image_url ? validateImageUrl(row.image_url) : null;
    
    // Log para depuração
    if (imageUrl) {
      console.log(`Processando imageUrl para ${name}: ${imageUrl}`);
    } else if (row.image_url) {
      console.log(`URL inválida para ${name}: ${row.image_url}`);
    }
    
    return { 
      name, 
      wineInfo, 
      imageUrl, 
      isValid: true  // Será filtrado depois
    };
  });
};
