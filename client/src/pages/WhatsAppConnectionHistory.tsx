import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Phone, AlertCircle, CheckCircle, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";

export default function WhatsAppConnectionHistory() {
  const [, setLocation] = useLocation();
  const { data: history = [] } = trpc.whatsapp.getConnectionHistory.useQuery({});

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "disconnected":
        return <LogOut className="w-4 h-4 text-amber-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "scanned":
        return <Phone className="w-4 h-4 text-blue-500" />;
      case "expired":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      connected: "Conectado",
      disconnected: "Desconectado",
      failed: "Falha na conexão",
      scanned: "QR Code escaneado",
      expired: "Sessão expirada",
    };
    return labels[eventType] || eventType;
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "connected":
        return "bg-emerald-50 border-emerald-200";
      case "disconnected":
        return "bg-amber-50 border-amber-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "scanned":
        return "bg-blue-50 border-blue-200";
      case "expired":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard/channels")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Histórico de Conexões</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe todas as tentativas de conexão e desconexão do WhatsApp
            </p>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Eventos Recentes
            </CardTitle>
            <CardDescription>
              {history.length === 0
                ? "Nenhum evento registrado"
                : `${history.length} evento(s) encontrado(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum histórico de conexão disponível
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((event) => (
                  <div
                    key={event.id}
                    className={`border rounded-lg p-4 flex items-start gap-4 ${getEventColor(
                      event.eventType
                    )}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.eventType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getEventLabel(event.eventType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      {event.phoneNumber && (
                        <p className="text-sm text-foreground">
                          Telefone: <span className="font-mono">{event.phoneNumber}</span>
                        </p>
                      )}

                      {event.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">
                          Erro: {event.errorMessage}
                        </p>
                      )}


                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conexões Bem-sucedidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.filter((e) => e.eventType === "connected").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Desconexões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.filter((e) => e.eventType === "disconnected").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.filter((e) => e.eventType === "failed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sessões Expiradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.filter((e) => e.eventType === "expired").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
