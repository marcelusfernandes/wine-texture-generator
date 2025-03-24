
/**
 * Utilidades para manipulação de arquivos CSV
 */

import { WineInfo } from "@/components/TextInputs";

// Define a estrutura de uma linha no arquivo CSV
export interface CsvWineRow {
  label_name?: string;       // Cabeçalho novo: label_name
  grape_variety?: string;    // Cabeçalho novo: grape_variety
  origin?: string;           // Cabeçalho novo: origin
  taste?: string;            // Cabeçalho novo: taste
  closure_type?: string;     // Cabeçalho novo: closure_type
  
  // Manter os cabeçalhos antigos para retrocompatibilidade
  nome?: string;
  classificacao?: string;
  uva?: string;
  pais?: string;
  tampa?: string;
  
  [key: string]: string | undefined; // Permitir outras colunas
}

/**
 * Analisa um arquivo CSV e retorna os dados como um array de objetos
 * @param file O arquivo CSV a ser analisado
 * @returns Promise com array de objetos representando linhas do CSV
 */
export const parseCsvFile = (file: File): Promise<CsvWineRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Falha ao ler o arquivo'));
          return;
        }
        
        const csvText = event.target.result as string;
        const rows = csvText.split('\n');
        
        if (rows.length <= 1) {
          reject(new Error('Arquivo CSV vazio ou inválido'));
          return;
        }
        
        // Analisa cabeçalhos (primeira linha)
        const headers = rows[0].split(',').map(header => 
          header.trim().toLowerCase()
            .replace(/"/g, '') // Remove aspas
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        );
        
        if (headers.length === 0) {
          reject(new Error('Cabeçalhos CSV não encontrados'));
          return;
        }
        
        console.log('Cabeçalhos CSV detectados:', headers);
        
        // Mapeia nomes de cabeçalhos normalizados para nossos campos esperados
        const headerMap: { [key: string]: string } = {
          // Mapeamentos de cabeçalhos novos
          'label_name': 'label_name',
          'grape_variety': 'grape_variety', 
          'origin': 'origin',
          'taste': 'taste',
          'closure_type': 'closure_type',
          
          // Mapeamentos de cabeçalhos legados (mantidos para compatibilidade)
          'nome': 'nome',
          'name': 'nome',
          'nome(tipo + uva + marca)': 'nome',
          'nome (tipo + uva + marca)': 'nome',
          'classificacao': 'classificacao',
          'classificação': 'classificacao',
          'sweetness': 'classificacao',
          'uva': 'uva',
          'grape': 'uva',
          'grape variety': 'uva',
          'pais': 'pais',
          'país': 'pais',
          'country': 'pais',
          'tampa': 'tampa',
          'closure': 'tampa',
          'closure type': 'tampa'
        };
        
        // Verifica se pelo menos um cabeçalho necessário foi encontrado
        const foundHeaders = headers.filter(h => headerMap[h]);
        if (foundHeaders.length === 0) {
          reject(new Error('Nenhum cabeçalho reconhecido encontrado no CSV'));
          return;
        }
        
        // Mapeia linhas CSV para objetos
        const data: CsvWineRow[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue; // Pula linhas vazias
          
          // Divide a linha em valores, respeitando aspas
          const values = row.split(',').map(val => val.trim().replace(/"/g, ''));
          
          if (values.length < Math.max(1, foundHeaders.length - 2)) {
            console.warn(`Linha ${i} ignorada: dados insuficientes`, values);
            continue;
          }
          
          const rowData: CsvWineRow = {};
          
          headers.forEach((header, index) => {
            const mappedHeader = headerMap[header];
            if (mappedHeader && index < values.length) {
              rowData[mappedHeader] = values[index];
            }
          });
          
          // Verifica se tem pelo menos um dado válido
          if (Object.keys(rowData).length > 0) {
            console.log(`Linha ${i} processada:`, rowData);
            data.push(rowData);
          }
        }
        
        console.log(`Total de ${data.length} linhas válidas processadas`);
        resolve(data);
      } catch (error) {
        console.error('Erro ao processar CSV:', error);
        reject(new Error(`Falha ao processar o arquivo CSV: ${error instanceof Error ? error.message : 'erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo'));
    };
    
    reader.readAsText(file);
  });
};

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
 * Valida os dados de vinho para garantir que são utilizáveis
 * @param wineInfo Informações do vinho a serem validadas
 * @returns Booleano indicando se os dados são válidos
 */
export const validateWineInfo = (wineInfo: WineInfo): boolean => {
  // Verifica se pelo menos type e origin têm valores válidos
  return Boolean(
    wineInfo.type && 
    wineInfo.type.length > 0 && 
    wineInfo.type !== 'Desconhecido' &&
    wineInfo.origin && 
    wineInfo.origin.length > 0 &&
    wineInfo.origin !== 'Outra'
  );
};

/**
 * Processa um arquivo CSV e o converte em um array de rótulos de vinho
 * @param file O arquivo CSV a ser processado
 * @returns Promise com dados de rótulos de vinho processados
 */
export const processCsvFile = async (file: File): Promise<{
  name: string;
  wineInfo: WineInfo;
}[]> => {
  try {
    const rows = await parseCsvFile(file);
    
    if (rows.length === 0) {
      throw new Error('Nenhum dado válido encontrado no CSV');
    }
    
    // Mapeia e valida as linhas
    const validLabels = rows
      .map(row => {
        const wineInfo = mapCsvRowToWineInfo(row);
        const name = row.label_name || row.nome || 'Vinho sem nome';
        
        return { name, wineInfo, isValid: validateWineInfo(wineInfo) };
      })
      .filter(item => item.isValid)
      .map(({name, wineInfo}) => ({name, wineInfo}));
    
    console.log(`${validLabels.length} de ${rows.length} rótulos são válidos`);
    
    if (validLabels.length === 0) {
      throw new Error('Nenhum rótulo válido encontrado nos dados');
    }
    
    return validLabels;
  } catch (error) {
    console.error('Erro processando arquivo CSV:', error);
    throw error;
  }
};
