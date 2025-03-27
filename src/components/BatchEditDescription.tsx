
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileQuestion } from "lucide-react";

const BatchEditDescription: React.FC = () => {
  return (
    <div className="mb-6">
      <p className="text-muted-foreground">
        Gerencie múltiplos rótulos de vinho de uma vez. Adicione, edite, duplique ou remova rótulos da sua coleção.
        Você também pode importar rótulos de um arquivo CSV usando o formato indicado abaixo.
      </p>
      
      <Alert className="mt-4">
        <FileQuestion className="h-4 w-4" />
        <AlertTitle>Colunas consideradas:</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
            <li><code>label_name</code> ou <code>nome</code> - Nome do rótulo</li>
            <li><code>grape_variety</code> ou <code>uva</code> - Tipo de uva</li>
            <li><code>origin</code> ou <code>pais</code> - Origem do vinho</li>
            <li><code>taste</code> ou <code>classificacao</code> - Sabor do vinho</li>
            <li><code>closure_type</code> ou <code>tampa</code> - Tipo de tampa</li>
            <li><code>image_url</code> ou <code>imagem</code> - URL da imagem do rótulo (opcional)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BatchEditDescription;
