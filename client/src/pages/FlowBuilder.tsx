import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  getBezierPath,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Clock,
  GitBranch,
  MessageSquare,
  MousePointerClick,
  Play,
  Plus,
  Save,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

// ─── Custom Node Components ───────────────────────────────────────────────────

function StartNode({ data, selected }: NodeProps) {
  return (
    <div className={cn("px-4 py-3 rounded-xl border-2 bg-emerald-500/10 border-emerald-500/50 min-w-[160px]", selected && "border-emerald-400 glow-sm")}>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Play className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm font-semibold text-emerald-400">Início</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !border-2 !border-background !w-3 !h-3" />
    </div>
  );
}

function MessageNode({ data, selected }: NodeProps) {
  return (
    <div className={cn("px-4 py-3 rounded-xl border bg-card min-w-[200px] max-w-[260px]", selected ? "border-primary glow-sm" : "border-border")}>
      <Handle type="target" position={Position.Top} className="!bg-primary !border-2 !border-background !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <MessageSquare className="h-3 w-3 text-violet-400" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mensagem</span>
      </div>
      <p className="text-sm text-foreground line-clamp-3">{(data as any).content || "Clique para editar..."}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-2 !border-background !w-3 !h-3" />
    </div>
  );
}

function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className={cn("px-4 py-3 rounded-xl border bg-card min-w-[180px]", selected ? "border-amber-400 glow-sm" : "border-border")}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !border-2 !border-background !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <GitBranch className="h-3 w-3 text-amber-400" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condição</span>
      </div>
      <p className="text-sm text-foreground">{(data as any).condition || "Se..."}</p>
      <div className="flex gap-2 mt-2">
        <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%" }} className="!bg-emerald-400 !border-2 !border-background !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%" }} className="!bg-rose-400 !border-2 !border-background !w-3 !h-3" />
      </div>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs text-emerald-400">Sim</span>
        <span className="text-xs text-rose-400">Não</span>
      </div>
    </div>
  );
}

function DelayNode({ data, selected }: NodeProps) {
  return (
    <div className={cn("px-4 py-3 rounded-xl border bg-card min-w-[160px]", selected ? "border-cyan-400 glow-sm" : "border-border")}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !border-2 !border-background !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Clock className="h-3 w-3 text-cyan-400" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delay</span>
      </div>
      <p className="text-sm text-foreground">{(data as any).delay || 5} {(data as any).unit || "minutos"}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !border-2 !border-background !w-3 !h-3" />
    </div>
  );
}

function ActionNode({ data, selected }: NodeProps) {
  return (
    <div className={cn("px-4 py-3 rounded-xl border bg-card min-w-[180px]", selected ? "border-rose-400 glow-sm" : "border-border")}>
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !border-2 !border-background !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Zap className="h-3 w-3 text-rose-400" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ação</span>
      </div>
      <p className="text-sm text-foreground">{(data as any).label || "Executar ação"}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-rose-400 !border-2 !border-background !w-3 !h-3" />
    </div>
  );
}

function ButtonNode({ data, selected }: NodeProps) {
  const buttons: string[] = (data as any).buttons || ["Opção 1", "Opção 2"];
  return (
    <div className={cn("px-4 py-3 rounded-xl border bg-card min-w-[200px]", selected ? "border-blue-400 glow-sm" : "border-border")}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !border-2 !border-background !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <MousePointerClick className="h-3 w-3 text-blue-400" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Botões</span>
      </div>
      <div className="space-y-1">
        {buttons.map((btn, i) => (
          <div key={i} className="text-xs px-2 py-1 rounded-md border border-border text-foreground">{btn}</div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !border-2 !border-background !w-3 !h-3" />
    </div>
  );
}

const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  conditionNode: ConditionNode,
  delayNode: DelayNode,
  actionNode: ActionNode,
  buttonNode: ButtonNode,
};

// ─── Node Palette ─────────────────────────────────────────────────────────────
const nodeTemplates = [
  { type: "messageNode", label: "Mensagem", icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-400/10" },
  { type: "conditionNode", label: "Condição", icon: GitBranch, color: "text-amber-400", bg: "bg-amber-400/10" },
  { type: "delayNode", label: "Delay", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { type: "actionNode", label: "Ação", icon: Zap, color: "text-rose-400", bg: "bg-rose-400/10" },
  { type: "buttonNode", label: "Botões", icon: MousePointerClick, color: "text-blue-400", bg: "bg-blue-400/10" },
];

// ─── Property Panel ───────────────────────────────────────────────────────────
function PropertyPanel({ node, onUpdate, onDelete }: { node: Node | null; onUpdate: (id: string, data: any) => void; onDelete: (id: string) => void }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Settings className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">Selecione um nó para editar suas propriedades</p>
      </div>
    );
  }

  const data = node.data as any;

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Propriedades</h3>
        {node.type !== "startNode" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      {node.type === "messageNode" && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Conteúdo da mensagem</Label>
          <Textarea
            value={data.content || ""}
            onChange={(e) => onUpdate(node.id, { ...data, content: e.target.value })}
            placeholder="Digite a mensagem..."
            className="bg-secondary border-border text-sm min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">Use {"{nome}"} para personalizar com o nome do contato.</p>
        </div>
      )}

      {node.type === "conditionNode" && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Condição</Label>
          <Select value={data.condition || "contains"} onValueChange={(v) => onUpdate(node.id, { ...data, condition: v })}>
            <SelectTrigger className="bg-secondary border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="equals">Igual a</SelectItem>
              <SelectItem value="starts_with">Começa com</SelectItem>
              <SelectItem value="greater_than">Maior que</SelectItem>
              <SelectItem value="has_tag">Tem tag</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs text-muted-foreground">Valor</Label>
          <Input
            value={data.value || ""}
            onChange={(e) => onUpdate(node.id, { ...data, value: e.target.value })}
            placeholder="Valor para comparar..."
            className="bg-secondary border-border text-sm"
          />
        </div>
      )}

      {node.type === "delayNode" && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Tempo de espera</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={data.delay || 5}
              onChange={(e) => onUpdate(node.id, { ...data, delay: parseInt(e.target.value) })}
              className="bg-secondary border-border text-sm w-24"
            />
            <Select value={data.unit || "minutes"} onValueChange={(v) => onUpdate(node.id, { ...data, unit: v })}>
              <SelectTrigger className="bg-secondary border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="seconds">Segundos</SelectItem>
                <SelectItem value="minutes">Minutos</SelectItem>
                <SelectItem value="hours">Horas</SelectItem>
                <SelectItem value="days">Dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {node.type === "actionNode" && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Tipo de ação</Label>
          <Select value={data.action || "add_tag"} onValueChange={(v) => onUpdate(node.id, { ...data, action: v })}>
            <SelectTrigger className="bg-secondary border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="add_tag">Adicionar tag</SelectItem>
              <SelectItem value="remove_tag">Remover tag</SelectItem>
              <SelectItem value="save_field">Salvar campo</SelectItem>
              <SelectItem value="notify_team">Notificar equipe</SelectItem>
              <SelectItem value="webhook">Chamar webhook</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs text-muted-foreground">Parâmetro</Label>
          <Input
            value={data.param || ""}
            onChange={(e) => onUpdate(node.id, { ...data, param: e.target.value })}
            placeholder="Ex: lead_quente"
            className="bg-secondary border-border text-sm"
          />
        </div>
      )}

      {node.type === "buttonNode" && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Botões (um por linha)</Label>
          <Textarea
            value={(data.buttons || []).join("\n")}
            onChange={(e) => onUpdate(node.id, { ...data, buttons: e.target.value.split("\n").filter(Boolean) })}
            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            className="bg-secondary border-border text-sm min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">Máximo de 3 botões recomendado.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Flow Builder Page ───────────────────────────────────────────────────
export default function FlowBuilderPage() {
  const params = useParams<{ id: string }>();
  const flowId = params.id ? parseInt(params.id) : null;
  const isNew = !flowId;

  const [flowName, setFlowName] = useState("Novo Fluxo");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    { id: "start", type: "startNode", position: { x: 300, y: 80 }, data: { label: "Início" } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [triggerType, setTriggerType] = useState<string>("manual");

  const { data: flow } = trpc.flows.get.useQuery({ id: flowId! }, { enabled: !!flowId });
  const createFlow = trpc.flows.create.useMutation();
  const updateFlow = trpc.flows.update.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (flow) {
      setFlowName(flow.name);
      if (flow.nodes) setNodes(flow.nodes as Node[]);
      if (flow.edges) setEdges(flow.edges as Edge[]);
      if (flow.triggerType) setTriggerType(flow.triggerType);
    }
  }, [flow]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "oklch(0.62 0.22 280)", strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  const addNode = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const defaultData: Record<string, any> = {
      messageNode: { content: "Digite sua mensagem aqui..." },
      conditionNode: { condition: "contains", value: "" },
      delayNode: { delay: 5, unit: "minutes" },
      actionNode: { action: "add_tag", param: "", label: "Adicionar tag" },
      buttonNode: { buttons: ["Opção 1", "Opção 2"] },
    };
    const newNode: Node = {
      id,
      type,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: defaultData[type] || {},
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = (id: string, data: any) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
    if (selectedNode?.id === id) setSelectedNode((prev) => prev ? { ...prev, data } : null);
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const result = await createFlow.mutateAsync({
          name: flowName,
          triggerType: triggerType as any,
        });
        await updateFlow.mutateAsync({ id: result.id, nodes, edges });
        toast.success("Fluxo criado com sucesso!");
        window.history.replaceState({}, "", `/flows/${result.id}`);
      } else {
        await updateFlow.mutateAsync({ id: flowId!, name: flowName, nodes, edges, triggerType: triggerType as any });
        toast.success("Fluxo salvo!");
      }
      utils.flows.list.invalidate();
    } catch (e) {
      toast.error("Erro ao salvar fluxo");
    }
    setSaving(false);
  };

  const handleActivate = async () => {
    if (!flowId) { await handleSave(); return; }
    await updateFlow.mutateAsync({ id: flowId, status: "active" });
    toast.success("Fluxo ativado!");
    utils.flows.list.invalidate();
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <Link href="/flows">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="h-8 w-48 bg-secondary border-border text-sm font-medium"
          />
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger className="h-8 w-36 bg-secondary border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="keyword">Palavra-chave</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="schedule">Agendado</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Badge className={cn("text-xs border-0", flow?.status === "active" ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground")}>
            {flow?.status === "active" ? "Ativo" : "Rascunho"}
          </Badge>
          <Button variant="outline" size="sm" className="h-8 border-border" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button size="sm" className="h-8 gradient-primary text-white border-0" onClick={handleActivate}>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Ativar
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Node palette */}
          <div className="w-52 border-r border-border bg-sidebar flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Elementos</p>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto">
              {nodeTemplates.map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => addNode(tmpl.type)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors group text-left"
                >
                  <div className={`h-7 w-7 rounded-lg ${tmpl.bg} flex items-center justify-center flex-shrink-0`}>
                    <tmpl.icon className={`h-3.5 w-3.5 ${tmpl.color}`} />
                  </div>
                  <span className="text-sm text-sidebar-foreground group-hover:text-foreground">{tmpl.label}</span>
                  <Plus className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="mt-auto p-3 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground mb-2">Dicas</p>
                <p>• Arraste elementos para o canvas</p>
                <p>• Conecte nós pelas alças</p>
                <p>• Clique para editar</p>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              fitView
              style={{ background: "oklch(0.08 0.01 260)" }}
              defaultEdgeOptions={{
                style: { stroke: "oklch(0.62 0.22 280)", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.62 0.22 280)" },
              }}
            >
              <Background color="oklch(0.2 0.015 260)" gap={20} size={1} />
              <Controls className="!bg-card !border-border" />
              <MiniMap
                style={{ background: "oklch(0.09 0.012 260)", border: "1px solid oklch(0.2 0.015 260)" }}
                nodeColor="oklch(0.62 0.22 280)"
              />
            </ReactFlow>
          </div>

          {/* Right panel - Properties */}
          <div className="w-64 border-l border-border bg-sidebar flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Propriedades</p>
            </div>
            <PropertyPanel node={selectedNode} onUpdate={updateNodeData} onDelete={deleteNode} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
