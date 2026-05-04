import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Check,
  ExternalLink,
  Facebook,
  Instagram,
  MessageCircle,
  Plus,
  Trash2,
  X,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Channel {
  id: number;
  userId: number;
  type: "whatsapp" | "instagram" | "messenger";
  name: string;
  status: "connected" | "disconnected" | "pending";
  accountId: string | null;
  accessToken: string | null;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const integrations = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Conecte sua conta WhatsApp Business para enviar e receber mensagens automaticamente.",
    icon: MessageCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    docs: "https://www.whatsapp.com/business/",
    features: ["Mensagens automáticas", "Respostas rápidas", "Broadcasts", "Atendimento ao cliente"],
  },
  {
    id: "instagram",
    name: "Instagram Direct Messages",
    description: "Integre o Instagram para gerenciar mensagens diretas e automações.",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    docs: "https://developers.facebook.com/docs/instagram-api",
    features: ["Mensagens diretas", "Stories", "Broadcasts", "Automações"],
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    description: "Conecte o Messenger para automações e atendimento ao cliente.",
    icon: Facebook,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    docs: "https://developers.facebook.com/docs/messenger-platform",
    features: ["Mensagens automáticas", "Chatbots", "Broadcasts", "Atendimento"],
  },
];

export default function Integrations() {
  const { data: channels = [] } = trpc.channels.list.useQuery();
  const deleteChannel = trpc.channels.delete.useMutation();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();

  const connectedChannels: Record<string, Channel> = {};
  channels.forEach((ch: Channel) => {
    if (!connectedChannels[ch.type]) {
      connectedChannels[ch.type] = ch;
    }
  });

  const handleConnect = (channelId: string) => {
    if (channelId === "whatsapp") {
      setLocation("/channels/whatsapp");
    } else if (channelId === "instagram") {
      toast.info("Redirecionando para autenticação do Instagram...");
      // TODO: Implementar fluxo de autenticação Instagram
    } else if (channelId === "messenger") {
      toast.info("Redirecionando para autenticação do Messenger...");
      // TODO: Implementar fluxo de autenticação Messenger
    }
  };

  const handleDisconnect = async (channelId: number) => {
    try {
      const channelToDelete = channels.find((ch: Channel) => ch.id === channelId);
      if (!channelToDelete) {
        throw new Error("Canal não encontrado");
      }

      const channelsOfSameType = channels.filter((ch: Channel) => ch.type === channelToDelete.type);
      for (const ch of channelsOfSameType) {
        await deleteChannel.mutateAsync({ id: ch.id });
      }

      await utils.channels.list.invalidate();
      toast.success("Canal desconectado com sucesso!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Erro ao desconectar: ${msg}`);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conecte seus canais favoritos para enviar mensagens automaticamente
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const connected = connectedChannels[integration.id];
            return (
              <Card key={integration.id} className={`bg-card border-border ${connected ? "border-emerald-400/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`h-10 w-10 rounded-lg ${integration.bg} flex items-center justify-center`}>
                      <integration.icon className={`h-5 w-5 ${integration.color}`} />
                    </div>
                    {connected && (
                      <Badge className="bg-emerald-400/15 text-emerald-400 border-0 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-foreground mb-1">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{connected ? connected.name : "Não conectado"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integrations Grid */}
        <div className="space-y-6">
          {integrations.map((integration) => {
            const connected = connectedChannels[integration.id];

            return (
              <Card key={integration.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl ${integration.bg} flex items-center justify-center`}>
                        <integration.icon className={`h-6 w-6 ${integration.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connected && (
                        <Badge className="bg-emerald-400/15 text-emerald-400 border-0">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                      {!connected && (
                        <Badge className="bg-muted text-muted-foreground border-0">
                          <X className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Funcionalidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature) => (
                        <Badge key={feature} className="bg-secondary text-muted-foreground border-0 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Connection Status */}
                  {connected && (
                    <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-3">
                      <p className="text-xs text-emerald-400 font-medium mb-1">Status da Conexão</p>
                      <p className="text-xs text-muted-foreground">
                        Conectado como: <span className="text-foreground font-medium">{connected.name}</span>
                      </p>
                      {connected.accountId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID da Conta: <span className="text-foreground font-mono text-xs">{connected.accountId}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <>
                        <Button
                          variant="outline"
                          className="border-border flex-1"
                          onClick={() => handleDisconnect(connected.id)}
                          disabled={deleteChannel.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteChannel.isPending ? "Desconectando..." : "Desconectar"}
                        </Button>
                        <Button variant="outline" className="border-border" asChild>
                          <a href={integration.docs} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="gradient-primary text-white border-0 flex-1"
                          onClick={() => handleConnect(integration.id)}
                        >
                          {integration.id === "whatsapp" ? (
                            <>
                              <QrCode className="h-4 w-4 mr-2" />
                              Conectar com QR Code
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Conectar
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="border-border" asChild>
                          <a href={integration.docs} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
