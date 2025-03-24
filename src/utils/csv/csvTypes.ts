
// Define a estrutura de uma linha no arquivo CSV
export interface CsvWineRow {
  label_name?: string;       // Nome do rótulo
  grape_variety?: string;    // Tipo de uva
  origin?: string;           // Origem
  taste?: string;            // Sabor
  closure_type?: string;     // Tipo de tampa
  image_url?: string;        // URL da imagem
  
  [key: string]: string | undefined; // Permitir outras colunas
}

// Lista de cabeçalhos que queremos processar
export const REQUIRED_HEADERS = {
  'label_name': 'label_name',
  'grape_variety': 'grape_variety', 
  'origin': 'origin',
  'taste': 'taste',
  'closure_type': 'closure_type',
  'image_url': 'image_url'
};
