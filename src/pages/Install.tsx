import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>¡App instalada!</CardTitle>
            <CardDescription>
              EV Logger ya está instalada en tu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'}>
              Abrir App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Instalar EV Logger</CardTitle>
          <CardDescription>
            Instala la app en tu móvil para un acceso rápido y uso offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Instalar App
            </Button>
          ) : isIOS ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Para instalar en iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Toca el botón <Share className="inline h-4 w-4" /> Compartir</li>
                <li>Desplázate y selecciona "Añadir a pantalla de inicio"</li>
                <li>Toca "Añadir" para confirmar</li>
              </ol>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              <p>Abre esta página en tu navegador móvil para instalar la app.</p>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Beneficios:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Acceso rápido desde la pantalla de inicio</li>
              <li>✓ Funciona sin conexión</li>
              <li>✓ Experiencia de app nativa</li>
              <li>✓ Sin necesidad de tiendas de apps</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
