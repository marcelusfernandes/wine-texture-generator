import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Layers, Upload, Wine } from 'lucide-react';

const Home = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link to="/edit/new">
        <Card className="h-full hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Rótulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Crie um novo rótulo de vinho do zero
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/batch">
        <Card className="h-full hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Edição em Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edite múltiplos rótulos de uma vez
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/upload">
        <Card className="h-full hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload em Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Faça upload de múltiplos rótulos
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/wineupload">
        <Card className="h-full hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" />
              Upload de Rótulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Faça upload de rótulos com informações no nome do arquivo
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default Home; 