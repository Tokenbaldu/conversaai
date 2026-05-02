import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bot,
  CheckCheck,
  Image,
  Instagram,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Pause,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
  ArrowLeft
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const channelIcons: Record<string, any> = {
  whatsapp: { icon: MessageCircle, color: "text-emerald-400" },
  instagram: { icon: Instagram, color: "text-pink-400" },
  messenger: { icon: MessageSquare, color: "text-blue-400" },
  web: { icon: MessageSquare, color: "text-muted-foreground" },
};

const statusLabels: Record<string, { label: string; class: string }> = {
  open: { label: "Aberta", class: "bg-emerald-400/15 text-emerald-400" },
  resolved: { label: "Resolvida", class: "bg-muted text-muted-foreground" },
  pending: { label: "Pendente", class: "bg-amber-400/15 text-amber-400" },
  bot: { label: "Bot", class: "bg-violet-400/15 text-violet-400" },
};

function AISuggestion({ history, onUse }: { history: Array<{ role: "user" | "assistant"; content: string }>; onUse: (s: string) => void }) {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestReply = trpc.ai.suggestReply.useMutation();

  const getSuggestion = async () => {
    if (history.length === 0) return;
    setLoading(true);
    try {
      const result = await suggestReply.mutateAsync({ conversationHistory: history, tone: "friendly" });
      setSuggestion(typeof result.suggestion === 'string' ? result.suggestion : '');
    } catch {
      toast.error("Erro ao gerar sugestão");
    }
    setLoading(false);
  };

  if (!suggestion && !loading) {
    return (
      <button onClick={getSuggestion} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
        <Sparkles className="h-3.5 w-3.5" />
        Sugerir resposta com IA
      </button>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
        <Sparkles className="h-3.5 w-3.5" />
        Sugestão da IA
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Gerando sugestão...
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground">{suggestion}</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gradient-primary text-white border-0" onClick={() => { onUse(suggestion); setSuggestion(""); }}>
              Usar esta resposta
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={getSuggestion}>
              <RefreshCw className="h-3 w-3 mr-1" /> Gerar outra
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSuggestion("")}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Inbox() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [showAI, setShowAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convsLoading } = trpc.conversations.list.useQuery({ status: statusFilter || undefined });
  const { data: selectedConv } = trpc.conversations.get.useQuery({ id: selectedConvId! }, { enabled: !!selectedConvId });
  const { data: messages = [], refetch: refetchMessages } = trpc.conversations.messages.useQuery(
    { conversationId: selectedConvId! },
    { enabled: !!selectedConvId, refetchInterval: 3000 }
  );

  const sendMessage = trpc.conversations.sendMessage.useMutation();
  const updateStatus = trpc.conversations.updateStatus.useMutation();
  const toggleAutomation = trpc.conversations.toggleAutomation.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedConvId) return;
    await sendMessage.mutateAsync({ conversationId: selectedConvId, content: message });
    setMessage("");
    refetchMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStatusChange = async (status: "open" | "resolved" | "pending" | "bot") => {
    if (!selectedConvId) return;
    await updateStatus.mutateAsync({ id: selectedConvId, status });
    utils.conversations.list.invalidate();
    utils.conversations.get.invalidate({ id: selectedConvId });
  };

  const handleToggleAutomation = async () => {
    if (!selectedConvId || !selectedConv) return;
    await toggleAutomation.mutateAsync({ id: selectedConvId, paused: !(selectedConv as any).automationPaused });
    utils.conversations.get.invalidate({ id: selectedConvId });
    toast.success((selectedConv as any).automationPaused ? "Automação retomada" : "Automação pausada");
  };

  const aiHistory = messages
    .slice(-10)
    .reverse()
    .map((m) => ({ role: m.direction === "inbound" ? "user" as const : "assistant" as const, content: m.content || "" }));

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Conversation List */}
        <div className="w-72 border-r border-border flex flex-col flex-shrink-0 bg-sidebar">
          <div className="p-3 border-b border-border space-y-2">
            <h2 className="font-semibold text-sm text-foreground">Inbox</h2>
            <div className="flex gap-1">
              {["open", "pending", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn("flex-1 text-xs py-1 rounded-md transition-colors", statusFilter === s ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent")}
                >
                  {s === "open" ? "Abertas" : s === "pending" ? "Pendentes" : "Resolvidas"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-sidebar-accent rounded-lg animate-pulse" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground">Nenhuma conversa</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const ch = channelIcons[conv.channel] || channelIcons.web;
                const contact = (conv as any).contact;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn("w-full p-3 text-left hover:bg-sidebar-accent transition-colors border-b border-border/50", selectedConvId === conv.id && "bg-sidebar-accent")}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {contact?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{contact?.name || "Desconhecido"}</span>
                          <ch.icon className={`h-3.5 w-3.5 ${ch.color} flex-shrink-0`} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConvId && selectedConv ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {(selectedConv as any).contact?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{(selectedConv as any).contact?.name || "Desconhecido"}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border-0 ${statusLabels[selectedConv.status]?.class || ""}`}>
                      {statusLabels[selectedConv.status]?.label || selectedConv.status}
                    </Badge>
                    {(selectedConv as any).automationPaused && (
                      <Badge className="text-xs border-0 bg-amber-400/15 text-amber-400">Bot pausado</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleAutomation}>
                      {(selectedConv as any).automationPaused ? <Play className="h-4 w-4 text-emerald-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{(selectedConv as any).automationPaused ? "Retomar automação" : "Pausar automação"}</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleStatusChange("resolved")}>
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Resolver
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                </div>
              ) : (
                [...messages].reverse().map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
                    {msg.direction === "inbound" && (
                      <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className={cn("max-w-[70%] px-3 py-2 rounded-2xl text-sm", msg.direction === "outbound" ? "gradient-primary text-white rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm")}>
                      {msg.mediaUrl && <img src={msg.mediaUrl} alt="media" className="rounded-lg mb-2 max-w-full" />}
                      <p>{msg.content}</p>
                      <p className={cn("text-xs mt-1", msg.direction === "outbound" ? "text-white/60" : "text-muted-foreground")}>
                        {new Date(msg.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {msg.direction === "outbound" && (
                      <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Suggestion */}
            {showAI && (
              <div className="px-4 pb-2">
                <AISuggestion history={aiHistory} onUse={(s) => { setMessage(s); setShowAI(false); }} />
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-secondary rounded-xl border border-border overflow-hidden">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite uma mensagem..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                  />
                  <div className="flex items-center gap-1 px-3 pb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1" onClick={() => setShowAI(!showAI)}>
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Sugestão com IA</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1" onClick={() => toast.info("Upload de mídia disponível em breve")}>
                          <Paperclip className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Anexar arquivo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1" onClick={() => toast.info("Upload de imagem disponível em breve")}>
                          <Image className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Enviar imagem</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessage.isPending}
                  className="h-10 w-10 p-0 gradient-primary text-white border-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground text-sm">Escolha uma conversa na lista para começar a atender</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
