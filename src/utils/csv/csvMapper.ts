
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
    
    // Processa a URL da imagem
    let imageUrl = null;
    
    // Verificação detalhada dos campos image_url e imagem
    console.log(`[CSV Mapper] Verificando campo 'image_url': ${row.image_url !== undefined ? `"${row.image_url}"` : "undefined"}`);
    console.log(`[CSV Mapper] Verificando campo 'imagem': ${row.imagem !== undefined ? `"${row.imagem}"` : "undefined"}`);
    
    if (row.image_url) {
      console.log(`[CSV Mapper] Encontrada URL no CSV para "${name}": "${row.image_url}"`);
      imageUrl = validateImageUrl(row.image_url);
    } else if (row.imagem) {
      console.log(`[CSV Mapper] Encontrada URL alternativa no CSV para "${name}": "${row.imagem}"`);
      imageUrl = validateImageUrl(row.imagem);
    } else {
      console.log(`[CSV Mapper] Nenhuma URL encontrada para "${name}" no CSV`);
    }
    
    // Log para depuração
    if (imageUrl) {
      console.log(`[CSV Mapper] URL validada para "${name}": ${imageUrl}`);
    } else {
      console.log(`[CSV Mapper] Sem URL válida para "${name}"`);
    }
    
    return { 
      name, 
      wineInfo, 
      imageUrl, 
      isValid: true  // Será filtrado depois
    };
  });
};

