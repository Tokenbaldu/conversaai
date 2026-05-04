import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  GitBranch,
  Inbox,
  MessageSquare,
  Radio,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: GitBranch,
    title: "Flow Builder Visual",
    description: "Crie fluxos de automação complexos com drag-and-drop intuitivo. Conecte nós de mensagem, condição, delay e ação.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Bot,
    title: "IA Avançada",
    description: "Respostas automáticas inteligentes com GPT. Análise de intenção, sugestões em tempo real e personalidade configurável.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Users,
    title: "CRM Integrado",
    description: "Gerencie contatos com tags, segmentação avançada, campos customizados e histórico completo de interações.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Radio,
    title: "Broadcast",
    description: "Dispare mensagens em massa para segmentos específicos. Agende campanhas e acompanhe métricas em tempo real.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Inbox,
    title: "Chat ao Vivo",
    description: "Inbox unificado para atendimento humano. Assuma conversas, pause automações e colabore com sua equipe.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Dashboards completos com métricas de engajamento, taxa de conversão e performance de cada fluxo.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
];

const channels = [
  { name: "WhatsApp", logo: "/manus-storage/whatsapp-logo-final_11d086d5.png" },
  { name: "Instagram", logo: "/manus-storage/instagram-logo_52b32d52.png" },
  { name: "Messenger", logo: "/manus-storage/messenger-logo_654588e8.png" },
];

const plans = [
  {
    name: "Starter",
    price: "R$ 10",
    period: "/mês (1º mês)",
    description: "Teste a plataforma por 30 dias",
    features: ["500 contatos", "3 fluxos ativos", "2 broadcasts/mês", "1 canal conectado", "Suporte por email", "Após 30 dias, upgrade obrigatório para Pro"],
    cta: "Começar por R$ 10",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    priceAnnual: "R$ 920",
    periodAnnual: "/ano",
    description: "Para negócios em crescimento",
    features: ["10.000 contatos", "50 fluxos ativos", "100 broadcasts/mês", "5 canais conectados", "IA avançada ativa", "Suporte prioritário"],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    name: "Agency",
    price: "R$ 120",
    period: "/mês",
    priceAnnual: "R$ 900",
    periodAnnual: "/ano",
    description: "Para agências e grandes times",
    features: ["100.000 contatos", "500 fluxos ativos", "1.000 broadcasts/mês", "20 canais conectados", "IA avançada ativa", "White label", "Multi-contas", "Suporte dedicado"],
    cta: "Falar com vendas",
    highlight: false,
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center glow-sm">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">ConversaIA.Cloud</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#channels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Canais</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="gradient-primary text-white border-0 glow-sm">
                  Acessar Dashboard
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button size="sm" className="gradient-primary text-white border-0 glow-sm">
                    Começar grátis
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <Badge className="mb-6 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Plataforma de Automação com IA
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Automatize suas vendas com{" "}
            <span className="gradient-text">inteligência artificial</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Crie fluxos de automação multicanal, gerencie contatos e converta leads automaticamente via WhatsApp, Instagram e Messenger — tudo em uma única plataforma.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="gradient-primary text-white border-0 glow-primary px-8 h-12 text-base font-semibold">
                Começar gratuitamente
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border text-foreground hover:bg-secondary">
                Ver funcionalidades
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "10M+", label: "Mensagens enviadas" },
              { value: "50K+", label: "Leads capturados" },
              { value: "98%", label: "Taxa de entrega" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section id="channels" className="py-16 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest font-medium">
            Conecte seus canais favoritos
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center gap-3 px-6 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
              >
                <img src={ch.logo} alt={ch.name} className="h-8 w-8 object-contain" />
                <span className="font-semibold text-foreground">{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              Funcionalidades
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para{" "}
              <span className="gradient-text">escalar suas vendas</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma plataforma completa com todas as ferramentas para automatizar sua comunicação e converter mais clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:glow-sm group"
              >
                <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              Planos
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Preços <span className="gradient-text">transparentes</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece gratuitamente e escale conforme seu negócio cresce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 border transition-all duration-300 relative overflow-hidden ${
                  plan.highlight
                    ? "border-primary/50 glow-primary bg-card"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />
                )}
                {plan.highlight && (
                  <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30 text-xs">
                    Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  {plan.priceAnnual && (
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-sm text-muted-foreground">ou</span>
                      <span className="text-2xl font-bold text-foreground">{plan.priceAnnual}</span>
                      <span className="text-muted-foreground text-sm">{plan.periodAnnual}</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={getLoginUrl()}>
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "gradient-primary text-white border-0 glow-sm"
                        : "border-border hover:bg-secondary"
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <Card className="relative p-12 border-primary/20 bg-card/80">
              <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Pronto para automatizar suas vendas?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Junte-se a milhares de empresas que já usam o ConversaIA.Cloud para crescer.
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="gradient-primary text-white border-0 glow-primary px-10 h-12 text-base font-semibold">
                  Começar agora — é grátis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">ConversaIA.Cloud</span>
          </div>
          <p className="text-sm text-muted-foreground">
             © 2025 ConversaIA.Cloud. Plataforma de automação conversacional com IA.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Dados protegidos e seguros
          </div>
        </div>
      </footer>
    </div>
  );
}
