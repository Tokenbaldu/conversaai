import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, QrCode, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppIntegration() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = async () => {
    try {
      setIsGenerating(true);
      // Generate a simple session ID
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      toast.success("QR code gerado! Escaneie com seu WhatsApp");
    } catch (error) {
      toast.error("Erro ao gerar QR code");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard/channels")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Integração WhatsApp</h1>
        </div>

        {/* QR Code Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Conectar Nova Conta
            </CardTitle>
            <CardDescription>
              Escaneie o código QR com seu WhatsApp para conectar uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sessionId ? (
              <Button
                onClick={handleGenerateQR}
                disabled={isGenerating}
                size="lg"
                className="w-full gradient-primary text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <QrCode className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm font-medium">QR Code</p>
                        <p className="text-xs opacity-75 mt-1">{sessionId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="text-center">
                  <div className="space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    <p className="text-sm text-muted-foreground">
                      Aguardando confirmação...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Abra WhatsApp em seu celular e escaneie o código acima
                    </p>
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSessionId(null);
                  }}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Como Conectar</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Clique em "Gerar QR Code"</li>
              <li>Abra WhatsApp em seu celular</li>
              <li>Vá para Configurações → Dispositivos Conectados</li>
              <li>Toque em "Conectar um Dispositivo"</li>
              <li>Escaneie o código QR exibido aqui</li>
              <li>Aguarde a confirmação</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
