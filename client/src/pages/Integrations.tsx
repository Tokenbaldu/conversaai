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
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const { data: channels = [], isLoading } = trpc.channels.list.useQuery();
  const createChannel = trpc.channels.create.useMutation();
  const deleteChannel = trpc.channels.delete.useMutation();
  const utils = trpc.useUtils();
  const [showAuthModal, setShowAuthModal] = useState<string | undefined>(undefined);
  const [authData, setAuthData] = useState<Record<string, string>>({});

  // Criar um mapa de canais por tipo, mantendo apenas o primeiro de cada tipo
  const connectedChannels: Record<string, Channel> = {};
  channels.forEach((ch: Channel) => {
    if (!connectedChannels[ch.type]) {
      connectedChannels[ch.type] = ch;
    }
  });
  
  // Também criar um mapa por ID para referência rápida
  const channelsById: Record<number, Channel> = {};
  channels.forEach((ch: Channel) => {
    channelsById[ch.id] = ch;
  });

  const handleConnect = async (channelId: string) => {
    try {
      const channelType = channelId as "whatsapp" | "instagram" | "messenger";
      const integration = integrations.find((i) => i.id === channelId);

      await createChannel.mutateAsync({
        type: channelType,
        name: integration?.name || channelId,
        accessToken: authData[`${channelId}_token`],
        accountId: authData[`${channelId}_account`],
      });

      utils.channels.list.invalidate();
      toast.success(`${integration?.name} conectado com sucesso!`);
      setShowAuthModal(undefined);
      setAuthData({});
    } catch (error) {
      toast.error("Erro ao conectar canal");
    }
  };

  const handleDisconnect = async (channelId: number) => {
    try {
      if (!channelId || typeof channelId !== 'number') {
        throw new Error(`ID invalido: ${channelId}`);
      }
      const result = await deleteChannel.mutateAsync({ id: channelId });
      await utils.channels.list.invalidate();
      toast.success("Canal desconectado com sucesso!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Erro ao desconectar:', msg);
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
                          Desconectar
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
                          onClick={() => setShowAuthModal(integration.id)}
                          disabled={createChannel.isPending}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Conectar
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

        {/* Auth Modal */}
        {showAuthModal !== undefined && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-card border-border w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  Conectar {showAuthModal ? integrations.find((i) => i.id === showAuthModal)?.name : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Access Token</label>
                  <input
                    type="password"
                    placeholder="Cole seu access token aqui"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground"
                    value={authData[`${showAuthModal}_token`] || ""}
                    onChange={(e) =>
                      setAuthData({
                        ...authData,
                        [`${showAuthModal}_token`]: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ID da Conta</label>
                  <input
                    type="text"
                    placeholder="ID da conta ou número de telefone"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground"
                    value={authData[`${showAuthModal}_account`] || ""}
                    onChange={(e) =>
                      setAuthData({
                        ...authData,
                        [`${showAuthModal}_account`]: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="bg-blue-400/5 border border-blue-400/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-medium mb-1">Como obter as credenciais?</p>
                  <p className="text-xs text-muted-foreground">
                    Visite a{" "}
                    <a
                      href={integrations.find((i) => i.id === showAuthModal)?.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      documentação oficial
                    </a>{" "}
                    para obter seu access token.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-border flex-1"
                    onClick={() => {
                      setShowAuthModal(undefined);
                      setAuthData({});
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="gradient-primary text-white border-0 flex-1"
                    onClick={() => handleConnect(showAuthModal)}
                    disabled={
                      !authData[`${showAuthModal}_token`] ||
                      !authData[`${showAuthModal}_account`] ||
                      createChannel.isPending
                    }
                  >
                    Conectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
