import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Calendar,
  GitBranch,
  Heart,
  MessageSquare,
  ShoppingCart,
  Star,
  ThumbsUp,
  UserPlus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const categoryIcons: Record<string, any> = {
  welcome: { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10", label: "Boas-vindas" },
  leads: { icon: UserPlus, color: "text-violet-400", bg: "bg-violet-400/10", label: "Captação de Leads" },
  support: { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-400/10", label: "Suporte" },
  sales: { icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-400/10", label: "Vendas" },
  scheduling: { icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Agendamento" },
  feedback: { icon: ThumbsUp, color: "text-blue-400", bg: "bg-blue-400/10", label: "Feedback" },
};

const categories = ["all", "welcome", "leads", "support", "sales", "scheduling", "feedback"];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [, navigate] = useLocation();
  const { data: templates = [], isLoading } = trpc.templates.list.useQuery({ category: selectedCategory === "all" ? undefined : selectedCategory });
  const useTemplate = trpc.templates.useTemplate.useMutation();
  const utils = trpc.useUtils();

  const handleUse = async (templateId: number, name: string) => {
    try {
      const result = await useTemplate.mutateAsync({ templateId, name });
      utils.flows.list.invalidate();
      toast.success("Template aplicado! Redirecionando para o editor...");
      setTimeout(() => navigate(`/flows/${result.id}`), 1000);
    } catch {
      toast.error("Erro ao usar template");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">Comece rapidamente com fluxos prontos para uso</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const catInfo = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {catInfo && <catInfo.icon className="h-3.5 w-3.5" />}
                {cat === "all" ? "Todos" : catInfo?.label || cat}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Card key={i} className="h-48 bg-card border-border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const cat = categoryIcons[template.category || "welcome"] || categoryIcons.welcome;
              return (
                <Card key={template.id} className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden">
                  {/* Preview Header */}
                  <div className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute h-8 bg-primary/30 rounded-lg" style={{ width: `${60 + i * 20}%`, top: `${20 + i * 25}%`, left: "10%" }} />
                      ))}
                    </div>
                    <div className={`h-12 w-12 rounded-xl ${cat.bg} flex items-center justify-center relative z-10`}>
                      <cat.icon className={`h-6 w-6 ${cat.color}`} />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <Badge className={`text-xs border-0 mt-1 ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        {(template.nodes as any[])?.length || 0} nós
                      </div>
                      <Button
                        size="sm"
                        className="h-7 text-xs gradient-primary text-white border-0"
                        onClick={() => handleUse(template.id, template.name)}
                        disabled={useTemplate.isPending}
                      >
                        Usar template
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
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
