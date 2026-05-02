import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  GitBranch,
  MessageSquare,
  Radio,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { day: "Seg", messages: 120, leads: 18 },
  { day: "Ter", messages: 185, leads: 24 },
  { day: "Qua", messages: 150, leads: 20 },
  { day: "Qui", messages: 210, leads: 32 },
  { day: "Sex", messages: 280, leads: 41 },
  { day: "Sáb", messages: 190, leads: 28 },
  { day: "Dom", messages: 140, leads: 19 },
];

const quickActions = [
  { label: "Novo Fluxo", href: "/flows/new", icon: GitBranch, color: "text-violet-400" },
  { label: "Novo Broadcast", href: "/broadcasts/new", icon: Radio, color: "text-amber-400" },
  { label: "Ver Inbox", href: "/inbox", icon: MessageSquare, color: "text-cyan-400" },
  { label: "Adicionar Contato", href: "/contacts/new", icon: Users, color: "text-emerald-400" },
];

export default function Dashboard() {
  const goBack = useGoBack();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  const statCards = [
    {
      title: "Total de Contatos",
      value: stats?.totalContacts ?? 0,
      change: "+12%",
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      title: "Mensagens Enviadas",
      value: stats?.totalMessages ?? 0,
      change: "+8%",
      icon: MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      title: "Fluxos Ativos",
      value: stats?.activeFlows ?? 0,
      change: "+3",
      icon: GitBranch,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Automações",
      value: stats?.totalAutomations ?? 0,
      change: "+5",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

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
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Visão geral da sua plataforma de automação
              </p>
            </div>
          </div>
          <Link href="/flows/new">
            <Button className="gradient-primary text-white border-0 glow-sm">
              <GitBranch className="h-4 w-4 mr-2" />
              Novo Fluxo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="bg-card border-border hover:border-primary/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">{stat.change} esta semana</span>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  Atividade dos últimos 7 dias
                </CardTitle>
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Esta semana
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.62 0.22 280)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.62 0.22 280)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.015 260)" />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.11 0.012 260)",
                      border: "1px solid oklch(0.2 0.015 260)",
                      borderRadius: "8px",
                      color: "oklch(0.96 0.005 260)",
                    }}
                  />
                  <Area type="monotone" dataKey="messages" stroke="oklch(0.62 0.22 280)" fill="url(#colorMessages)" strokeWidth={2} name="Mensagens" />
                  <Area type="monotone" dataKey="leads" stroke="oklch(0.7 0.18 200)" fill="url(#colorLeads)" strokeWidth={2} name="Leads" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Flows */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Fluxos recentes</CardTitle>
                <Link href="/flows">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-7 px-2 text-xs">
                    Ver todos <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recentFlows && stats.recentFlows.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentFlows.map((flow: any) => (
                    <div key={flow.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-violet-400/10 flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{flow.name}</p>
                        <p className="text-xs text-muted-foreground">{flow.status}</p>
                      </div>
                      <Badge
                        className={`text-xs border-0 ${
                          flow.status === "active"
                            ? "bg-emerald-400/15 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {flow.status === "active" ? "Ativo" : flow.status === "draft" ? "Rascunho" : flow.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum fluxo criado ainda</p>
                  <Link href="/flows/new">
                    <Button size="sm" variant="ghost" className="mt-2 text-primary hover:text-primary text-xs">
                      Criar primeiro fluxo
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Contatos recentes</CardTitle>
                <Link href="/contacts">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-7 px-2 text-xs">
                    Ver todos <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recentContacts && stats.recentContacts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentContacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.channel || "web"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum contato ainda</p>
                  <Link href="/contacts/new">
                    <Button size="sm" variant="ghost" className="mt-2 text-primary hover:text-primary text-xs">
                      Adicionar contato
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
