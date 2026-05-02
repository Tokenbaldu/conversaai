import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  GitBranch,
  MessageSquare,
  Radio,
  TrendingUp,
  Users,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";

const mockWeekData = [
  { day: "Seg", messages: 120, contacts: 18, conversations: 24 },
  { day: "Ter", messages: 185, contacts: 24, conversations: 31 },
  { day: "Qua", messages: 150, contacts: 20, conversations: 28 },
  { day: "Qui", messages: 210, contacts: 32, conversations: 40 },
  { day: "Sex", messages: 280, contacts: 41, conversations: 55 },
  { day: "Sáb", messages: 190, contacts: 28, conversations: 35 },
  { day: "Dom", messages: 140, contacts: 19, conversations: 22 },
];

const mockChannelData = [
  { name: "WhatsApp", value: 52, color: "#10b981" },
  { name: "Instagram", value: 28, color: "#ec4899" },
  { name: "Messenger", value: 20, color: "#3b82f6" },
];

const mockFlowData = [
  { name: "Boas-vindas", executions: 145, conversions: 89 },
  { name: "Captura de Leads", executions: 98, conversions: 67 },
  { name: "Suporte", executions: 234, conversions: 198 },
  { name: "Carrinho", executions: 56, conversions: 23 },
  { name: "Agendamento", executions: 78, conversions: 61 },
];

export default function Analytics() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data: overview } = trpc.analytics.overview.useQuery({ period });
  const { data: flows = [] } = trpc.analytics.flowPerformance.useQuery();

  const stats = [
    { title: "Novos Contatos", value: overview?.contacts ?? 0, icon: Users, color: "text-violet-400", bg: "bg-violet-400/10", change: "+12%" },
    { title: "Mensagens", value: overview?.messages ?? 0, icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-400/10", change: "+8%" },
    { title: "Conversas", value: overview?.conversations ?? 0, icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-400/10", change: "+15%" },
    { title: "Broadcasts", value: overview?.broadcasts ?? 0, icon: Radio, color: "text-amber-400", bg: "bg-amber-400/10", change: "+3" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Métricas de performance da sua plataforma</p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">{stat.change}</span>
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Atividade da semana</CardTitle>
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  7 dias
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockWeekData}>
                  <defs>
                    <linearGradient id="gMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.62 0.22 280)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.62 0.22 280)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gContacts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.015 260)" />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.015 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
                  <Area type="monotone" dataKey="messages" stroke="oklch(0.62 0.22 280)" fill="url(#gMessages)" strokeWidth={2} name="Mensagens" />
                  <Area type="monotone" dataKey="contacts" stroke="oklch(0.7 0.18 200)" fill="url(#gContacts)" strokeWidth={2} name="Contatos" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Distribution */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Canais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={mockChannelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {mockChannelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.015 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {mockChannelData.map((ch) => (
                  <div key={ch.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: ch.color }} />
                      <span className="text-sm text-muted-foreground">{ch.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{ch.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Performance */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Performance dos Fluxos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockFlowData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.015 260)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.55 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "oklch(0.11 0.012 260)", border: "1px solid oklch(0.2 0.015 260)", borderRadius: "8px", color: "oklch(0.96 0.005 260)" }} />
                <Bar dataKey="executions" fill="oklch(0.62 0.22 280)" radius={[0, 4, 4, 0]} name="Execuções" />
                <Bar dataKey="conversions" fill="oklch(0.7 0.18 160)" radius={[0, 4, 4, 0]} name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
