
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
  console.log(`[CSV Mapper] Iniciando mapeamento de ${rows.length} linhas para rótulos de vinho`);
  
  return rows.map((row, index) => {
    const wineInfo = mapCsvRowToWineInfo(row);
    
    // Usa o nome do label se disponível, senão usa nome antigo, ou gera um nome padrão
    const name = row.label_name || row.nome || `Vinho ${Math.floor(Math.random() * 1000)}`;
    
    console.log(`[CSV Mapper] Processando linha ${index + 1}: "${name}"`);
    console.log(`[CSV Mapper] Dados da linha:`, row);
    
    // Log dos valores de image_url e imagem para diagnóstico
    console.log(`[CSV Mapper] Valor de image_url: ${String(row.image_url)}`);
    console.log(`[CSV Mapper] Valor de imagem: ${String(row.imagem)}`);
    
    // Processa a URL da imagem sem validações complexas
    let imageUrl = null;
    
    if (row.image_url) {
      console.log(`[CSV Mapper] Encontrado valor em image_url para "${name}": "${row.image_url}"`);
      imageUrl = validateImageUrl(row.image_url);
    } else if (row.imagem) {
      console.log(`[CSV Mapper] Encontrado valor em imagem para "${name}": "${row.imagem}"`);
      imageUrl = validateImageUrl(row.imagem);
    } else {
      console.log(`[CSV Mapper] Nenhum valor de URL encontrado para "${name}"`);
    }
    
    console.log(`[CSV Mapper] URL final para "${name}": ${imageUrl}`);
    
    return { 
      name, 
      wineInfo, 
      imageUrl, 
      isValid: true
    };
  });
};
