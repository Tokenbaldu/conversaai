import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, QrCode, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppIntegration() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<"pending" | "scanning" | "connected">("pending");

  const startIntegrationMutation = trpc.whatsapp.startIntegration.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setQrCode(data.qrCode);
      setIntegrationStatus("scanning");
      toast.success("QR code gerado! Escaneie com seu WhatsApp");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar QR code");
    },
  });

  const checkStatusQuery = trpc.whatsapp.checkStatus.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId && integrationStatus === "scanning",
      refetchInterval: 2000, // Check every 2 seconds
    }
  );

  const { data: integrations } = trpc.whatsapp.getIntegrations.useQuery();

  const disconnectMutation = trpc.whatsapp.disconnect.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp desconectado com sucesso");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao desconectar");
    },
  });

  // Monitor status changes
  useEffect(() => {
    if (checkStatusQuery.data?.status === "active") {
      setIntegrationStatus("connected");
      toast.success("WhatsApp conectado com sucesso!");
      setTimeout(() => {
        setLocation("/dashboard/channels");
      }, 2000);
    }
  }, [checkStatusQuery.data?.status, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

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

        {/* Active Integrations */}
        {integrations && integrations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Suas Contas WhatsApp</CardTitle>
              <CardDescription>Gerenciar contas conectadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{integration.phoneNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {integration.status}
                        </p>
                      </div>
                    </div>
                    {integration.status === "active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          disconnectMutation.mutate({ integrationId: integration.id })
                        }
                        disabled={disconnectMutation.isPending}
                      >
                        Desconectar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                onClick={() => startIntegrationMutation.mutate()}
                disabled={startIntegrationMutation.isPending}
                size="lg"
                className="w-full"
              >
                {startIntegrationMutation.isPending ? (
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
                    {qrCode && (
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="text-center">
                  {integrationStatus === "scanning" && (
                    <div className="space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        Aguardando confirmação...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Abra WhatsApp em seu celular e escaneie o código acima
                      </p>
                    </div>
                  )}
                  {integrationStatus === "connected" && (
                    <div className="space-y-2">
                      <CheckCircle className="w-6 h-6 mx-auto text-green-500" />
                      <p className="text-sm font-medium text-green-600">
                        Conectado com sucesso!
                      </p>
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSessionId(null);
                    setQrCode(null);
                    setIntegrationStatus("pending");
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
