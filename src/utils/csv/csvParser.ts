
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
        
        const headers = headerRow.split(',').map(header => normalizeText(header));
        
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
          const headersList = Object.keys(REQUIRED_HEADERS)
            .filter(h => ['label_name', 'nome', 'grape_variety', 'uva', 'origin', 'pais', 'taste', 'classificacao', 'closure_type', 'tampa', 'image_url', 'imagem'].includes(h))
            .join(', ');
            
          reject(new Error(`Nenhum cabeçalho reconhecido encontrado no CSV. O arquivo deve ter pelo menos um destes cabeçalhos: ${headersList}`));
          return;
        }
        
        // Mapeia linhas CSV para objetos, ignorando colunas que não nos interessam
        const data: CsvWineRow[] = [];
        
        console.log('[CSV Parser] Mapeamento de colunas definido:', columnMap);
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue; // Pula linhas vazias
          
          // Divide a linha em valores, respeitando aspas (implementação simplificada)
          const values = row.split(',').map(val => val.trim());
          
          console.log(`[CSV Parser] Linha ${i}: ${row}`);
          
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
              
              // Log especial para URLs de imagem
              if ((fieldName === 'image_url' || fieldName === 'imagem') && value) {
                console.log(`[CSV Parser] Linha ${i}: encontrada coluna "${fieldName}" com valor: "${value}"`);
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
          
          // Verifique especificamente pelos campos de imagem
          const withImageUrl = data.filter(row => row.image_url || row.imagem).length;
          console.log(`[CSV Parser] Linhas com URLs de imagem: ${withImageUrl} de ${data.length}`);
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

