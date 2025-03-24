
import React from 'react';

const BatchEditDescription: React.FC = () => {
  return (
    <div className="mb-6">
      <p className="text-muted-foreground">
        Gerencie múltiplos rótulos de vinho de uma vez. Adicione, edite, duplique ou remova rótulos da sua coleção.
        Você também pode importar rótulos de um arquivo CSV usando o formato indicado.
      </p>
      <div className="mt-3 p-3 bg-muted/30 rounded-md text-xs">
        <p className="font-medium mb-1">Formato CSV esperado:</p>
        <p>Cabeçalhos necessários: <code>label_name</code>, <code>grape_variety</code>, <code>origin</code>, <code>taste</code>, <code>closure_type</code></p>
        <p className="mt-1">O sistema irá ignorar quaisquer outros cabeçalhos no arquivo.</p>
        <p className="mt-1">Os cabeçalhos antigos também são suportados para retrocompatibilidade.</p>
      </div>
    </div>
  );
};

export default BatchEditDescription;
