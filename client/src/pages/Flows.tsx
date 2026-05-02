import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  Copy,
  GitBranch,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Zap,
  ArrowLeft
} from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Ativo", class: "bg-emerald-400/15 text-emerald-400" },
  draft: { label: "Rascunho", class: "bg-muted text-muted-foreground" },
  paused: { label: "Pausado", class: "bg-amber-400/15 text-amber-400" },
  archived: { label: "Arquivado", class: "bg-secondary text-muted-foreground" },
};

const triggerLabels: Record<string, string> = {
  manual: "Manual",
  keyword: "Palavra-chave",
  event: "Evento",
  schedule: "Agendado",
  webhook: "Webhook",
};

export default function Flows() {
  const goBack = useGoBack();
  const [search, setSearch] = useState("");
  const { data: flows = [], isLoading } = trpc.flows.list.useQuery();
  const updateFlow = trpc.flows.update.useMutation();
  const deleteFlow = trpc.flows.delete.useMutation();
  const duplicateFlow = trpc.flows.duplicate.useMutation();
  const utils = trpc.useUtils();

  const filtered = flows.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleToggleStatus = async (id: number, status: string) => {
    const newStatus = status === "active" ? "paused" : "active";
    await updateFlow.mutateAsync({ id, status: newStatus as any });
    utils.flows.list.invalidate();
    toast.success(newStatus === "active" ? "Fluxo ativado!" : "Fluxo pausado");
  };

  const handleDelete = async (id: number) => {
    await deleteFlow.mutateAsync({ id });
    utils.flows.list.invalidate();
    toast.success("Fluxo excluído");
  };

  const handleDuplicate = async (id: number) => {
    await duplicateFlow.mutateAsync({ id });
    utils.flows.list.invalidate();
    toast.success("Fluxo duplicado!");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxos</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus fluxos de automação</p>
          </div>
          <Link href="/flows/new">
            <Button className="gradient-primary text-white border-0 glow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fluxo
            </Button>
          </Link>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fluxos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-40 bg-card border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum fluxo encontrado</h3>
            <p className="text-muted-foreground mb-6">Crie seu primeiro fluxo de automação para começar.</p>
            <Link href="/flows/new">
              <Button className="gradient-primary text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro fluxo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((flow) => {
              const sc = statusConfig[flow.status as keyof typeof statusConfig] || statusConfig.draft;
              return (
                <Card key={flow.id} className="bg-card border-border hover:border-primary/30 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-400/10 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border-0 ${sc.class}`}>{sc.label}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => handleToggleStatus(flow.id, flow.status)}>
                              {flow.status === "active" ? <><Pause className="h-4 w-4 mr-2" /> Pausar</> : <><Play className="h-4 w-4 mr-2" /> Ativar</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(flow.id)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(flow.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Link href={`/flows/${flow.id}`}>
                      <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors cursor-pointer">{flow.name}</h3>
                    </Link>
                    {flow.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{flow.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        {triggerLabels[flow.triggerType || "manual"] || "Manual"}
                      </div>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(flow.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
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
