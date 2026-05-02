import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  ExternalLink,
  Instagram,
  MessageCircle,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const channelTypes = [
  {
    type: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    description: "Conecte via WhatsApp Business API",
    fields: [
      { key: "phoneNumber", label: "Número de telefone", placeholder: "+55 11 99999-9999" },
      { key: "accessToken", label: "Access Token", placeholder: "EAAxxxx..." },
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "1234567890" },
    ],
  },
  {
    type: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    description: "Conecte via Instagram Direct Messages",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "IGxxxx..." },
      { key: "pageId", label: "Page ID", placeholder: "1234567890" },
    ],
  },
  {
    type: "messenger",
    name: "Facebook Messenger",
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "Conecte via Facebook Messenger",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "EAAxxxx..." },
      { key: "pageId", label: "Page ID", placeholder: "1234567890" },
      { key: "appSecret", label: "App Secret", placeholder: "abc123..." },
    ],
  },
];

function ConnectChannelDialog({ channelType, onSuccess }: { channelType: typeof channelTypes[0]; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const connectChannel = trpc.channels.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectChannel.mutateAsync({
        type: channelType.type as "whatsapp" | "instagram" | "messenger",
        name: name || channelType.name,
        accessToken: config.accessToken,
        accountId: config.pageId || config.phoneNumberId,
      });
      toast.success(`${channelType.name} conectado com sucesso!`);
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Erro ao conectar canal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary text-white border-0">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Conectar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <channelType.icon className={`h-5 w-5 ${channelType.color}`} />
            Conectar {channelType.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Nome da conexão</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Minha conta ${channelType.name}`} className="bg-secondary border-border" />
          </div>
          {channelType.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm text-muted-foreground">{field.label}</Label>
              <Input
                value={config[field.key] || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="bg-secondary border-border font-mono text-sm"
              />
            </div>
          ))}
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p>Precisa de ajuda para configurar? <a href="#" className="text-primary hover:underline">Ver documentação <ExternalLink className="h-3 w-3 inline" /></a></p>
          </div>
          <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={connectChannel.isPending}>
            {connectChannel.isPending ? "Conectando..." : "Conectar Canal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Channels() {
  const { data: channels = [], isLoading } = trpc.channels.list.useQuery();
  const updateChannel = trpc.channels.update.useMutation();
  const deleteChannel = trpc.channels.delete.useMutation();
  const utils = trpc.useUtils();

  const handleToggle = async (id: number, status: string) => {
    const newStatus = status === 'connected' ? 'disconnected' : 'connected';
    await updateChannel.mutateAsync({ id, status: newStatus as any });
    utils.channels.list.invalidate();
  };

  const handleDelete = async (id: number) => {
    await deleteChannel.mutateAsync({ id });
    utils.channels.list.invalidate();
    toast.success("Canal desconectado");
  };

  const connectedTypes: string[] = channels.map(c => c.type);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canais</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas conexões com plataformas de mensagens</p>
        </div>

        {/* Available Channels */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Canais disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channelTypes.map((ch) => {
              const isConnected = connectedTypes.includes(ch.type);
              return (
                <Card key={ch.type} className={`bg-card border ${ch.border} hover:border-opacity-50 transition-all`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-11 w-11 rounded-xl ${ch.bg} flex items-center justify-center`}>
                        <ch.icon className={`h-6 w-6 ${ch.color}`} />
                      </div>
                      {isConnected ? (
                        <Badge className="bg-emerald-400/15 text-emerald-400 border-0 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                          Disponível
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{ch.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{ch.description}</p>
                    {!isConnected && (
                      <ConnectChannelDialog channelType={ch} onSuccess={() => utils.channels.list.invalidate()} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Connected Channels */}
        {channels.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Conexões ativas</h2>
            <div className="space-y-3">
              {channels.map((channel) => {
                const chType = channelTypes.find(c => c.type === channel.type);
                if (!chType) return null;
                return (
                  <Card key={channel.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl ${chType.bg} flex items-center justify-center flex-shrink-0`}>
                          <chType.icon className={`h-5 w-5 ${chType.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{channel.name}</h3>
                            <Badge className={`text-xs border-0 ${channel.status === 'connected' ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                              {channel.status === 'connected' ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{chType.name} · Conectado em {new Date(channel.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={channel.status === 'connected'} onCheckedChange={() => handleToggle(channel.id, channel.status)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(channel.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
