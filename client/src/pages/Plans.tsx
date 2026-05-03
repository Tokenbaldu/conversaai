import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Check,
  Crown,
  Smartphone,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const planIcons: Record<string, any> = {
  Free: { icon: Zap, color: "text-muted-foreground", gradient: "from-secondary to-secondary/50" },
  Pro: { icon: Sparkles, color: "text-violet-400", gradient: "from-violet-600/20 to-violet-400/10" },
  Agency: { icon: Crown, color: "text-amber-400", gradient: "from-amber-600/20 to-amber-400/10" },
};

const planFeatures: Record<string, string[]> = {
  Free: [
    "Até 500 contatos",
    "3 fluxos ativos",
    "1 canal conectado",
    "1.000 mensagens/mês",
    "Templates básicos",
    "Analytics básico",
  ],
  Pro: [
    "Até 10.000 contatos",
    "Fluxos ilimitados",
    "3 canais conectados",
    "50.000 mensagens/mês",
    "Todos os templates",
    "Analytics avançado",
    "IA integrada",
    "Broadcasts",
    "Suporte prioritário",
  ],
  Agency: [
    "Contatos ilimitados",
    "Fluxos ilimitados",
    "Canais ilimitados",
    "Mensagens ilimitadas",
    "Todos os templates",
    "Analytics completo",
    "IA avançada",
    "Broadcasts ilimitados",
    "Multi-workspace",
    "API access",
    "Suporte dedicado",
    "White-label",
  ],
};

// Preços atualizados
const planPrices: Record<string, { monthly: number; annual: number }> = {
  Free: { monthly: 0, annual: 0 },
  Pro: { monthly: 75, annual: 750 },
  Agency: { monthly: 130, annual: 1300 },
};

export default function Plans() {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe">("stripe");
  const { data: plans = [], isLoading } = trpc.plans.list.useQuery();
  const { data: currentPlan } = trpc.plans.current.useQuery();
  const subscribePlan = trpc.plans.subscribe.useMutation();
  const createCheckout = trpc.plans.createCheckout.useMutation();
  const utils = trpc.useUtils();

  const handleUpgrade = async (planId: number, planName: string) => {
    try {
      // Se for plano Free, apenas subscribe
      if (planName === "Free") {
        await subscribePlan.mutateAsync({ planId });
        utils.plans.current.invalidate();
        toast.success("Plano Free ativado com sucesso!");
        return;
      }

      // Para planos pagos com Stripe, criar checkout
      const billingPeriod = isAnnual ? "annual" : "monthly";
      const result = await createCheckout.mutateAsync({
        planId,
        billingPeriod: billingPeriod as "monthly" | "annual",
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-3">Escolha seu plano</h1>
          <p className="text-muted-foreground">Escale sua automação de marketing com o plano ideal para o seu negócio</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto bg-secondary/30 rounded-xl p-4 border border-border">
          <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
          </span>
          {isAnnual && (
            <Badge className="bg-emerald-400/15 text-emerald-400 border-0 text-xs ml-2">
              Economize 17%
            </Badge>
          )}
        </div>

        {/* Current Plan */}
        {currentPlan && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3 max-w-md mx-auto">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Plano atual: <span className="text-primary">{currentPlan.plan?.name}</span></p>
              <p className="text-xs text-muted-foreground">
                {currentPlan.userPlan?.expiresAt ? `Expira em ${new Date(currentPlan.userPlan.expiresAt).toLocaleDateString("pt-BR")}` : "Plano ativo"}
              </p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => <Card key={i} className="h-96 bg-card border-border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const planConfig = planIcons[plan.name] || planIcons.Free;
              const features = planFeatures[plan.name] || [];
              const isCurrent = currentPlan?.plan?.id === plan.id;
              const isPro = plan.name === "Pro";
              const isAgency = plan.name === "Agency";
              const prices = planPrices[plan.name] || { monthly: 0, annual: 0 };
              const displayPrice = isAnnual ? prices.annual : prices.monthly;
              const annualSavings = isAnnual && prices.annual > 0 ? Math.round((1 - prices.annual / (prices.monthly * 12)) * 100) : 0;

              return (
                <Card
                  key={plan.id}
                  className={`bg-card border-border relative overflow-hidden transition-all ${
                    isPro ? "border-violet-400/40 shadow-lg shadow-violet-400/10" : isAgency ? "border-amber-400/30" : ""
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-violet-400" />
                  )}
                  {isPro && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-violet-400/15 text-violet-400 border-violet-400/20 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${planConfig.gradient} flex items-center justify-center mb-3`}>
                      <planConfig.icon className={`h-6 w-6 ${planConfig.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">
                        {displayPrice === 0 ? "Grátis" : `R$ ${displayPrice.toFixed(0)}`}
                      </span>
                      {displayPrice > 0 && (
                        <span className="text-muted-foreground text-sm">
                          /{isAnnual ? "ano" : "mês"}
                        </span>
                      )}
                    </div>
                    {annualSavings > 0 && (
                      <p className="text-xs text-emerald-400 mt-1">
                        Economize {annualSavings}% com plano anual
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {plan.name !== "Free" && (
                      <div className="space-y-2">
                        <Button
                          className={`w-full ${
                            isCurrent
                              ? "bg-secondary text-muted-foreground cursor-default"
                              : isPro
                              ? "gradient-primary text-white border-0 glow-sm"
                              : isAgency
                              ? "bg-amber-500/20 text-amber-400 border border-amber-400/30 hover:bg-amber-500/30"
                              : "border-border"
                          }`}
                          variant={isCurrent || (!isPro && !isAgency) ? "outline" : "default"}
                          disabled={isCurrent || subscribePlan.isPending || createCheckout.isPending}
                          onClick={() => {
                            setPaymentMethod("stripe");
                            !isCurrent && handleUpgrade(plan.id, plan.name);
                          }}
                        >
                          {isCurrent ? (
                            "Plano atual"
                          ) : createCheckout.isPending ? (
                            "Processando..."
                          ) : (
                            `Assinar com Stripe`
                          )}
                        </Button>

                      </div>
                    )}
                    {plan.name === "Free" && (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={isCurrent || subscribePlan.isPending}
                        onClick={() => !isCurrent && handleUpgrade(plan.id, plan.name)}
                      >
                        {isCurrent ? "Plano atual" : "Começar grátis"}
                      </Button>
                    )}

                    <div className="space-y-2.5">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${isPro ? "bg-violet-400/20" : isAgency ? "bg-amber-400/20" : "bg-emerald-400/20"}`}>
                            <Check className={`h-2.5 w-2.5 ${isPro ? "text-violet-400" : isAgency ? "text-amber-400" : "text-emerald-400"}`} />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">Perguntas frequentes</h2>
          {[
            { q: "Como funciona o pagamento?", a: "Usamos Stripe para processar pagamentos de forma segura. Você pode pagar com cartão de crédito ou débito." },
            { q: "Posso mudar de plano a qualquer momento?", a: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança é processada imediatamente." },
            { q: "O que acontece quando atinjo o limite do plano?", a: "Você receberá uma notificação quando estiver próximo do limite. Após atingir, as automações serão pausadas até o próximo ciclo ou upgrade." },
            { q: "Existe período de teste gratuito?", a: "O plano Free é gratuito para sempre com recursos limitados. Os planos pagos oferecem 14 dias de teste sem cartão de crédito." },
          ].map((item) => (
            <div key={item.q} className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-medium text-foreground mb-1.5">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
