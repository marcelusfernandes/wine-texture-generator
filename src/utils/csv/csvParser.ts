
import { CsvWineRow, REQUIRED_HEADERS } from "./csvTypes";
import { normalizeText } from "./csvValidation";

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
        
        console.log(`[CSV Parser] Arquivo contém ${rows.length} linhas`);
        console.log(`[CSV Parser] Primeira linha: ${rows[0]}`);
        
        // Analisa cabeçalhos (primeira linha)
        const headerRow = rows[0];
        if (!headerRow || !headerRow.includes(',')) {
          reject(new Error('Formato CSV inválido: não foram encontrados cabeçalhos separados por vírgula na primeira linha'));
          return;
        }
        
        // Parsing correto dos cabeçalhos, tratando aspas e separadores
        const headers = parseCSVRow(headerRow).map(header => normalizeText(header));
        
        console.log('[CSV Parser] Cabeçalhos CSV detectados:', headers);
        
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
            console.log(`[CSV Parser] Cabeçalho encontrado: ${header} (${matchedHeader}) na coluna ${index} -> mapeia para ${REQUIRED_HEADERS[matchedHeader]}`);
          } else {
            console.log(`[CSV Parser] Ignorando cabeçalho desconhecido: ${header} na coluna ${index}`);
          }
        });
        
        if (!foundAtLeastOneRequiredHeader) {
          console.error('[CSV Parser] Nenhum dos cabeçalhos necessários foi encontrado');
          const headersList = Object.keys(REQUIRED_HEADERS).join(', ');
            
          reject(new Error(`Nenhum cabeçalho reconhecido encontrado no CSV. O arquivo deve ter pelo menos um destes cabeçalhos: ${headersList}`));
          return;
        }
        
        // Mapeia linhas CSV para objetos, com tratamento adequado para campos com vírgulas
        const data: CsvWineRow[] = [];
        
        console.log('[CSV Parser] Mapeamento de colunas definido:', columnMap);
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue; // Pula linhas vazias
          
          // Divide a linha respeitando campos entre aspas que podem conter vírgulas
          const values = parseCSVRow(row);
          
          console.log(`[CSV Parser] Linha ${i}: ${row}`);
          console.log(`[CSV Parser] Valores extraídos: ${JSON.stringify(values)}`);
          
          // Só processa a linha se tiver valores suficientes
          if (values.length < 1) {
            continue;
          }
          
          const rowData: CsvWineRow = {};
          
          // Só adiciona campos que temos interesse
          Object.entries(columnMap).forEach(([columnIndex, fieldName]) => {
            const index = parseInt(columnIndex);
            if (index < values.length) {
              const value = values[index];
              rowData[fieldName] = value;
              
              // Log especial para URLs de imagem e info_base
              if (fieldName === 'image_url' && value) {
                console.log(`[CSV Parser] Linha ${i}: encontrada coluna "image_url" com valor: "${value}"`);
              }
              
              if (fieldName === 'info_base' && value) {
                console.log(`[CSV Parser] Linha ${i}: encontrada coluna "info_base" com valor: "${value}"`);
              }
            }
          });
          
          // Verifica se tem pelo menos um dado válido
          if (Object.keys(rowData).length > 0) {
            console.log(`[CSV Parser] Dados extraídos da linha ${i}:`, rowData);
            data.push(rowData);
          }
        }
        
        console.log(`[CSV Parser] Total de ${data.length} linhas válidas processadas`);
        
        // Log de uma amostra dos dados extraídos
        if (data.length > 0) {
          console.log('[CSV Parser] Exemplo da primeira linha processada:', data[0]);
          
          // Verifique especificamente pelos campos de imagem e info_base
          const withImageUrl = data.filter(row => row.image_url).length;
          const withInfoBase = data.filter(row => row.info_base).length;
          console.log(`[CSV Parser] Linhas com URLs de imagem: ${withImageUrl} de ${data.length}`);
          console.log(`[CSV Parser] Linhas com info_base: ${withInfoBase} de ${data.length}`);
        }
        
        resolve(data);
      } catch (error) {
        console.error('[CSV Parser] Erro ao processar CSV:', error);
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
 * Parse uma linha CSV, respeitando campos entre aspas que podem conter vírgulas
 * @param line A linha CSV a ser analisada
 * @returns Array de valores, respeitando campos entre aspas
 */
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Se encontrarmos aspas duplas consecutivas dentro de um campo com aspas, é um escape
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Pula o próximo caractere (as aspas de escape)
      } else {
        // Caso contrário, alternar o estado "dentro de aspas"
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Se encontrarmos uma vírgula e não estivermos dentro de aspas, é um delimitador
      result.push(current.trim());
      current = '';
    } else {
      // Qualquer outro caractere, adiciona ao valor atual
      current += char;
    }
  }
  
  // Adiciona o último valor
  result.push(current.trim());
  
  return result;
}
