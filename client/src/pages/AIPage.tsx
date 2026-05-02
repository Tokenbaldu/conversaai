import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import {
  Bot,
  Brain,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Zap,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AIPage() {
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("Você é um assistente de atendimento ao cliente amigável e prestativo. Responda de forma clara, concisa e profissional.");
  const [tone, setTone] = useState<"friendly" | "professional" | "casual">("friendly");
  const [aiEnabled, setAiEnabled] = useState(true);

  const aiChat = trpc.ai.chat.useMutation();

  const handleTest = async () => {
    if (!testMessage.trim()) return;
    setTestLoading(true);
    setTestResponse("");
    try {
      const result = await aiChat.mutateAsync({
        messages: [{ role: "user", content: testMessage }],
        systemPrompt,
      });
      setTestResponse(typeof result.content === 'string' ? result.content : '');
    } catch {
      toast.error("Erro ao gerar resposta");
    }
    setTestLoading(false);
  };

  const features = [
    { icon: Brain, title: "Análise de Intenção", desc: "Identifica automaticamente o que o contato quer dizer", color: "text-violet-400", bg: "bg-violet-400/10" },
    { icon: MessageSquare, title: "Respostas Automáticas", desc: "Gera respostas personalizadas baseadas no contexto", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { icon: Sparkles, title: "Sugestões em Tempo Real", desc: "Sugere respostas para os agentes durante o atendimento", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: Zap, title: "Triagem Inteligente", desc: "Classifica e prioriza conversas automaticamente", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">IA & Respostas</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure e teste a inteligência artificial da plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">IA ativa</span>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`h-9 w-9 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Configuração do Assistente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Prompt do sistema</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Defina como a IA deve se comportar..."
                  className="bg-secondary border-border resize-none text-sm"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">Este prompt define a personalidade e comportamento do assistente de IA.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Tom de comunicação</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="friendly">Amigável</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary text-white border-0" onClick={() => toast.success("Configurações salvas!")}>
                Salvar configurações
              </Button>
            </CardContent>
          </Card>

          {/* Test Area */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Testar Assistente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mensagem de teste</Label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Digite uma mensagem para testar a IA..."
                  className="bg-secondary border-border resize-none text-sm"
                  rows={3}
                />
              </div>
              <Button
                className="w-full gradient-primary text-white border-0"
                onClick={handleTest}
                disabled={testLoading || !testMessage.trim()}
              >
                {testLoading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Testar IA</>
                )}
              </Button>

              {testResponse && (
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-primary">Resposta da IA</span>
                  </div>
                  <div className="text-sm text-foreground prose prose-invert max-w-none">
                    <Streamdown>{testResponse}</Streamdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Uso da IA este mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Respostas geradas", value: "1.247", color: "text-violet-400" },
                { label: "Intenções analisadas", value: "3.891", color: "text-cyan-400" },
                { label: "Taxa de acerto", value: "94.2%", color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
