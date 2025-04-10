import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Wine } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-2 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Wine Label Generator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight animate-fade-up">
            Create Professional Wine Labels
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
            Upload your wine bottle image and add product information for your PIM system
          </p>
        </header>

        <div className="max-w-md mx-auto animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Link to="/winemass">
            <Card className="h-full hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="h-5 w-5" />
                  Winemass
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse a página Winemass para gerenciar seus rótulos de vinho
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '500ms' }}>
          <p>Wine Label Generator &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
