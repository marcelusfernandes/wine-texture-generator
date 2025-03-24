
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
export const REQUIRED_HEADERS = {
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
