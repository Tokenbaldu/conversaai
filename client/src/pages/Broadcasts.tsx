import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Radio,
  Send,
  Trash2,
  Users,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  draft: { label: "Rascunho", class: "bg-muted text-muted-foreground", icon: Clock },
  scheduled: { label: "Agendado", class: "bg-cyan-400/15 text-cyan-400", icon: Calendar },
  sending: { label: "Enviando", class: "bg-amber-400/15 text-amber-400", icon: Play },
  sent: { label: "Enviado", class: "bg-emerald-400/15 text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Falhou", class: "bg-destructive/15 text-destructive", icon: Radio },
};

function BroadcastForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram" | "messenger" | "all">("all");
  const [scheduledAt, setScheduledAt] = useState("");
  const createBroadcast = trpc.broadcasts.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBroadcast.mutateAsync({
        name,
        message,
        channel,
        scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : undefined,
      });
      toast.success("Broadcast criado!");
      onSuccess();
    } catch {
      toast.error("Erro ao criar broadcast");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Nome *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Promoção de Natal" className="bg-secondary border-border" required />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Mensagem *</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Digite a mensagem que será enviada..." className="bg-secondary border-border resize-none" rows={4} required />
        <p className="text-xs text-muted-foreground">Use {"{nome}"} para personalizar com o nome do contato.</p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Canal</Label>
        <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="messenger">Messenger</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Agendar para (opcional)</Label>
        <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="bg-secondary border-border" />
      </div>
      <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={createBroadcast.isPending}>
        {createBroadcast.isPending ? "Criando..." : "Criar Broadcast"}
      </Button>
    </form>
  );
}

export default function Broadcasts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: broadcasts = [], isLoading } = trpc.broadcasts.list.useQuery();
  const sendBroadcast = trpc.broadcasts.send.useMutation();
  const deleteBroadcast = trpc.broadcasts.delete.useMutation();
  const utils = trpc.useUtils();

  const handleSend = async (id: number) => {
    await sendBroadcast.mutateAsync({ id });
    utils.broadcasts.list.invalidate();
    toast.success("Broadcast iniciado!");
  };

  const handleDelete = async (id: number) => {
    await deleteBroadcast.mutateAsync({ id });
    utils.broadcasts.list.invalidate();
    toast.success("Broadcast excluído");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Broadcasts</h1>
            <p className="text-muted-foreground text-sm mt-1">Envie mensagens em massa para seus contatos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0 glow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Broadcast</DialogTitle>
              </DialogHeader>
              <BroadcastForm onSuccess={() => { setDialogOpen(false); utils.broadcasts.list.invalidate(); }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: broadcasts.length, icon: Radio, color: "text-violet-400", bg: "bg-violet-400/10" },
            { label: "Enviados", value: broadcasts.filter(b => b.status === "sent").length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Agendados", value: broadcasts.filter(b => b.status === "scheduled").length, icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-400/10" },
            { label: "Rascunhos", value: broadcasts.filter(b => b.status === "draft").length, icon: Clock, color: "text-muted-foreground", bg: "bg-secondary" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Card key={i} className="h-24 bg-card border-border animate-pulse" />)}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum broadcast criado</h3>
            <p className="text-muted-foreground mb-6">Crie broadcasts para enviar mensagens em massa para seus contatos.</p>
            <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-white border-0">
              <Plus className="h-4 w-4 mr-2" /> Criar broadcast
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((bc) => {
              const sc = statusConfig[bc.status] || statusConfig.draft;
              const StatusIcon = sc.icon;
              return (
                <Card key={bc.id} className="bg-card border-border hover:border-primary/20 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                        <Radio className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{bc.name}</h3>
                          <Badge className={`text-xs border-0 ${sc.class}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {sc.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{bc.message}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{bc.channel === "all" ? "Todos os canais" : bc.channel}</span>
                          {bc.scheduledAt && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(bc.scheduledAt).toLocaleString("pt-BR")}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span>{new Date(bc.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(bc.status === "draft" || bc.status === "scheduled") && (
                          <Button size="sm" variant="outline" className="border-border h-8" onClick={() => handleSend(bc.id)} disabled={sendBroadcast.isPending}>
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Enviar
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(bc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
