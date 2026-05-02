import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  Hash,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  UserPlus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const triggerIcons: Record<string, any> = {
  keyword: { icon: Hash, label: "Palavra-chave", color: "text-violet-400", bg: "bg-violet-400/10" },
  event: { icon: Zap, label: "Evento", color: "text-amber-400", bg: "bg-amber-400/10" },
  schedule: { icon: Calendar, label: "Agendado", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  new_contact: { icon: UserPlus, label: "Novo contato", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  tag_added: { icon: Tag, label: "Tag adicionada", color: "text-rose-400", bg: "bg-rose-400/10" },
};

function AutomationForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<"keyword" | "event" | "schedule" | "new_contact" | "tag_added">("keyword");
  const [keyword, setKeyword] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram" | "messenger" | "all">("all");
  const { data: flows = [] } = trpc.flows.list.useQuery();
  const [flowId, setFlowId] = useState<string>("");
  const createAutomation = trpc.automations.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAutomation.mutateAsync({
        name,
        triggerType,
        triggerConfig: { keyword, value: keyword },
        flowId: flowId ? parseInt(flowId) : undefined,
        channel,
      });
      toast.success("Automação criada!");
      onSuccess();
    } catch {
      toast.error("Erro ao criar automação");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Nome *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da automação" className="bg-secondary border-border" required />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Trigger</Label>
        <Select value={triggerType} onValueChange={(v) => setTriggerType(v as any)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="keyword">Palavra-chave</SelectItem>
            <SelectItem value="event">Evento</SelectItem>
            <SelectItem value="schedule">Agendado</SelectItem>
            <SelectItem value="new_contact">Novo contato</SelectItem>
            <SelectItem value="tag_added">Tag adicionada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {triggerType === "keyword" && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Palavra-chave</Label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Ex: oi, olá, preço" className="bg-secondary border-border" />
        </div>
      )}
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
        <Label className="text-sm text-muted-foreground">Fluxo associado</Label>
        <Select value={flowId} onValueChange={setFlowId}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Selecionar fluxo (opcional)" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {flows.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={createAutomation.isPending}>
        {createAutomation.isPending ? "Criando..." : "Criar Automação"}
      </Button>
    </form>
  );
}

export default function Automations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: automations = [], isLoading } = trpc.automations.list.useQuery();
  const updateAutomation = trpc.automations.update.useMutation();
  const deleteAutomation = trpc.automations.delete.useMutation();
  const utils = trpc.useUtils();

  const handleToggle = async (id: number, status: string) => {
    const newStatus = status === "active" ? "paused" : "active";
    await updateAutomation.mutateAsync({ id, status: newStatus as any });
    utils.automations.list.invalidate();
  };

  const handleDelete = async (id: number) => {
    await deleteAutomation.mutateAsync({ id });
    utils.automations.list.invalidate();
    toast.success("Automação excluída");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automações</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure triggers e sequências automáticas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0 glow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Automação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Automação</DialogTitle>
              </DialogHeader>
              <AutomationForm onSuccess={() => { setDialogOpen(false); utils.automations.list.invalidate(); }} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Card key={i} className="h-20 bg-card border-border animate-pulse" />)}
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma automação criada</h3>
            <p className="text-muted-foreground mb-6">Crie automações para responder automaticamente aos seus contatos.</p>
            <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-white border-0">
              <Plus className="h-4 w-4 mr-2" /> Criar automação
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((auto) => {
              const trig = triggerIcons[auto.triggerType] || triggerIcons.event;
              return (
                <Card key={auto.id} className="bg-card border-border hover:border-primary/20 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl ${trig.bg} flex items-center justify-center flex-shrink-0`}>
                        <trig.icon className={`h-5 w-5 ${trig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{auto.name}</h3>
                          <Badge className={`text-xs border-0 ${auto.status === "active" ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                            {auto.status === "active" ? "Ativo" : auto.status === "paused" ? "Pausado" : "Rascunho"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{trig.label}</span>
                          {(auto.triggerConfig as any)?.keyword && (
                            <span className="text-xs text-muted-foreground">• "{(auto.triggerConfig as any).keyword}"</span>
                          )}
                          <span className="text-xs text-muted-foreground">• {auto.channel === "all" ? "Todos os canais" : auto.channel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={auto.status === "active"}
                          onCheckedChange={() => handleToggle(auto.id, auto.status)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => handleDelete(auto.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
