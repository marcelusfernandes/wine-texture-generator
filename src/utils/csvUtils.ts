/**
 * Utility functions for handling CSV files
 */

import { WineInfo } from "@/components/TextInputs";

// Define the structure of a row in the CSV file
export interface CsvWineRow {
  label_name?: string;       // New header: label_name
  grape_variety?: string;    // New header: grape_variety
  origin?: string;           // New header: origin
  taste?: string;            // New header: taste
  closure_type?: string;     // New header: closure_type
  
  // Keep the old headers for backward compatibility
  nome?: string;
  classificacao?: string;
  uva?: string;
  pais?: string;
  tampa?: string;
  
  [key: string]: string | undefined; // Allow for other columns
}

/**
 * Parse a CSV file and return the data as an array of objects
 * @param file The CSV file to parse
 * @returns Promise with array of objects representing CSV rows
 */
export const parseCsvFile = (file: File): Promise<CsvWineRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const csvText = event.target.result as string;
      const rows = csvText.split('\n');
      
      // Parse headers (first row)
      const headers = rows[0].split(',').map(header => 
        header.trim().toLowerCase()
          .replace(/"/g, '') // Remove quotes
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      );
      
      // Map normalized header names to our expected fields
      const headerMap: { [key: string]: string } = {
        // New header mappings
        'label_name': 'label_name',
        'grape_variety': 'grape_variety',
        'origin': 'origin',
        'taste': 'taste',
        'closure_type': 'closure_type',
        
        // Legacy header mappings (kept for compatibility)
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
      
      console.log('CSV Headers:', headers);
      
      // Map CSV rows to objects
      const data: CsvWineRow[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows
        
        const values = rows[i].split(',').map(val => val.trim().replace(/"/g, ''));
        const rowData: CsvWineRow = {};
        
        headers.forEach((header, index) => {
          const mappedHeader = headerMap[header];
          if (mappedHeader && index < values.length) {
            rowData[mappedHeader] = values[index];
          }
        });
        
        console.log('Parsed row:', rowData);
        data.push(rowData);
      }
      
      resolve(data);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Convert CSV row data to WineInfo object
 * @param rowData The CSV row data
 * @returns WineInfo object with mapped values
 */
export const mapCsvRowToWineInfo = (rowData: CsvWineRow): WineInfo => {
  return {
    // Check for new headers first, then fall back to legacy headers
    type: rowData.grape_variety || rowData.uva || 'Unknown',
    origin: rowData.origin || rowData.pais || 'Other',
    taste: rowData.taste || rowData.classificacao || 'Dry',
    corkType: rowData.closure_type || rowData.tampa || 'Cork'
  };
};

/**
 * Process a CSV file and convert it to an array of wine labels
 * @param file The CSV file to process
 * @returns Promise with processed wine label data
 */
export const processCsvFile = async (file: File): Promise<{
  name: string;
  wineInfo: WineInfo;
}[]> => {
  try {
    const rows = await parseCsvFile(file);
    
    return rows.map(row => ({
      // Check for new label_name header first, then fall back to nome
      name: row.label_name || row.nome || 'Unnamed Wine',
      wineInfo: mapCsvRowToWineInfo(row)
    }));
  } catch (error) {
    console.error('Error processing CSV file:', error);
    throw error;
  }
};
