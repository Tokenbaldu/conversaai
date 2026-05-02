import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Copy,
  GitBranch,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useGoBack } from "@/hooks/useGoBack";
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
    toast.success("Fluxo duplicado");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fluxos de Automação</h1>
              <p className="text-muted-foreground text-sm mt-1">Gerencie seus fluxos de automação</p>
            </div>
          </div>
          <Link href="/flows/new">
            <Button className="gradient-primary text-white border-0 glow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fluxo
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fluxos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {/* Flows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Carregando fluxos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhum fluxo encontrado</p>
              <Link href="/flows/new">
                <Button size="sm" variant="ghost" className="mt-2 text-primary hover:text-primary text-xs">
                  Criar primeiro fluxo
                </Button>
              </Link>
            </div>
          ) : (
            filtered.map((flow: any) => (
              <Card key={flow.id} className="bg-card border-border hover:border-primary/20 transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-violet-400/10 flex items-center justify-center flex-shrink-0">
                        <GitBranch className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{flow.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {triggerLabels[flow.trigger] || flow.trigger}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(flow.id, flow.status)}>
                          {flow.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(flow.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(flow.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-xs border-0 ${
                        statusConfig[flow.status as keyof typeof statusConfig]?.class ||
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusConfig[flow.status as keyof typeof statusConfig]?.label || flow.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{flow.nodeCount || 0} nós</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
