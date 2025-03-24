
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
  image_url?: string;        // Cabeçalho para URL da imagem
  
  // Manter os cabeçalhos antigos para retrocompatibilidade
  nome?: string;
  classificacao?: string;
  uva?: string;
  pais?: string;
  tampa?: string;
  
  [key: string]: string | undefined; // Permitir outras colunas
}

// Lista de cabeçalhos que queremos processar (novos e antigos)
const REQUIRED_HEADERS = {
  // Novos cabeçalhos
  'label_name': 'label_name',
  'grape_variety': 'grape_variety', 
  'origin': 'origin',
  'taste': 'taste',
  'closure_type': 'closure_type',
  'image_url': 'image_url',
  
  // Cabeçalhos legados para retrocompatibilidade
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
  'closure type': 'tampa',
  'imagem': 'image_url',
  'image': 'image_url'
};

/**
 * Normaliza um texto para comparação (remove acentos, espaços extras, etc.)
 */
const normalizeText = (text: string): string => {
  return text.trim()
    .toLowerCase()
    .replace(/"/g, '') // Remove aspas
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Validate and clean an image URL
 */
const validateImageUrl = (url: string | undefined): string | null => {
  if (!url || url.trim() === '') return null;
  
  // Remove quotes that might have been incorrectly parsed from CSV
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
  // Check if it's just a number (probably mistaken for a URL)
  if (/^\d+$/.test(cleanUrl)) {
    console.log(`Invalid image URL detected (just numbers): ${cleanUrl}`);
    return null;
  }
  
  // Log para diagnóstico
  console.log(`Processando URL da imagem: ${cleanUrl}`);
  
  // Try to ensure URL has protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // If it looks like a domain (contains dots, no spaces), add https
    if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
      cleanUrl = `https://${cleanUrl}`;
      console.log(`URL corrigida com protocolo: ${cleanUrl}`);
    } else {
      console.log(`URL sem formato válido: ${cleanUrl}`);
      return null;
    }
  }
  
  // Validate that it's a proper URL
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch (error) {
    console.log(`Erro de análise da URL: ${cleanUrl}`);
    return null;
  }
};

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
        
        // Verifica se o arquivo está vazio
        if (!csvText.trim()) {
          reject(new Error('O arquivo CSV está vazio'));
          return;
        }
        
        // Divide o CSV em linhas, lidando com diferentes terminadores de linha
        const rows = csvText.split(/\r\n|\n|\r/).filter(row => row.trim());
        
        if (rows.length <= 0) {
          reject(new Error('Arquivo CSV vazio ou inválido'));
          return;
        }
        
        // Analisa cabeçalhos (primeira linha)
        const headerRow = rows[0];
        if (!headerRow || !headerRow.includes(',')) {
          reject(new Error('Formato CSV inválido: não foram encontrados cabeçalhos separados por vírgula na primeira linha'));
          return;
        }
        
        const headers = headerRow.split(',').map(header => normalizeText(header));
        
        console.log('Cabeçalhos CSV detectados:', headers);
        
        // Mapeia os cabeçalhos do CSV para os nomes de campo que usamos
        const columnMap: { [index: number]: string } = {};
        let foundAtLeastOneRequiredHeader = false;
        
        headers.forEach((header, index) => {
          // Ignora cabeçalhos vazios
          if (!header.trim()) return;
          
          // Verifica se é um cabeçalho que conhecemos
          const matchedHeader = Object.keys(REQUIRED_HEADERS).find(
            knownHeader => normalizeText(knownHeader) === header
          );
          
          if (matchedHeader) {
            columnMap[index] = REQUIRED_HEADERS[matchedHeader];
            foundAtLeastOneRequiredHeader = true;
            console.log(`Cabeçalho encontrado: ${header} (${matchedHeader}) na coluna ${index}`);
          } else {
            console.log(`Ignorando cabeçalho desconhecido: ${header} na coluna ${index}`);
          }
        });
        
        if (!foundAtLeastOneRequiredHeader) {
          console.error('Nenhum dos cabeçalhos necessários foi encontrado');
          const headersList = Object.keys(REQUIRED_HEADERS)
            .filter(h => ['label_name', 'nome', 'grape_variety', 'uva', 'origin', 'pais', 'taste', 'classificacao', 'closure_type', 'tampa', 'image_url'].includes(h))
            .join(', ');
            
          reject(new Error(`Nenhum cabeçalho reconhecido encontrado no CSV. O arquivo deve ter pelo menos um destes cabeçalhos: ${headersList}`));
          return;
        }
        
        // Mapeia linhas CSV para objetos, ignorando colunas que não nos interessam
        const data: CsvWineRow[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue; // Pula linhas vazias
          
          // Divide a linha em valores, respeitando aspas (implementação simplificada)
          const values = row.split(',').map(val => val.trim());
          
          // Só processa a linha se tiver valores suficientes
          if (values.length < 1) {
            continue;
          }
          
          const rowData: CsvWineRow = {};
          
          // Só adiciona campos que temos interesse
          Object.entries(columnMap).forEach(([columnIndex, fieldName]) => {
            const index = parseInt(columnIndex);
            if (index < values.length) {
              // Add special handling for image URL fields
              if (fieldName === 'image_url') {
                rowData[fieldName] = validateImageUrl(values[index]);
              } else {
                rowData[fieldName] = values[index];
              }
            }
          });
          
          // Verifica se tem pelo menos um dado válido
          if (Object.keys(rowData).length > 0) {
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
  // Verifica se pelo menos type ou origin têm valores válidos (menos rigoroso agora)
  return Boolean(
    (wineInfo.type && wineInfo.type.length > 0) || 
    (wineInfo.origin && wineInfo.origin.length > 0)
  );
};

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
    const validLabels = rows
      .map(row => {
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
          isValid: validateWineInfo(wineInfo) 
        };
      })
      .filter(item => item.isValid)
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
