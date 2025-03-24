
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
              rowData[fieldName] = values[index];
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
