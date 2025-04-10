
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Layers, Upload, Wine } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-2 animate-fade-in">
            <Wine className="h-3.5 w-3.5" />
            <span>Wine Label Generator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight animate-fade-up">
            Create Professional Wine Labels
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
            Upload your wine bottle image and add product information for your PIM system
          </p>
        </header>

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

          <Link to="/winemass">
            <Card className="h-full hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload em Massa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload de múltiplos rótulos com informações no nome do arquivo
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
