import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface MetricsData {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalLeads: number;
  avgDeliveryRate: number;
  conversionRate: number;
  messagesTrend: Array<{ date: string; count: number }>;
  channelDistribution: Array<{ name: string; value: number }>;
  topCountries: Array<{ country: string; users: number }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function PublicMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from API
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/public/metrics");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Não foi possível carregar as métricas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Métricas da Plataforma
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o crescimento em tempo real do ConversaIA.Cloud
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Usuários Totais</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-green-500 mt-2">
              {metrics.activeUsers} ativos
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Mensagens Enviadas
            </p>
            <p className="text-3xl font-bold text-foreground">
              {(metrics.totalMessages / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-green-500 mt-2">+12% este mês</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Leads Capturados</p>
            <p className="text-3xl font-bold text-foreground">
              {(metrics.totalLeads / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-green-500 mt-2">+8% este mês</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Taxa de Entrega</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.avgDeliveryRate}%
            </p>
            <p className="text-xs text-green-500 mt-2">Excelente</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.conversionRate}%
            </p>
            <p className="text-xs text-green-500 mt-2">+2% este mês</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Messages Trend */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Tendência de Mensagens
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.messagesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  dot={false}
                  name="Mensagens"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Distribuição por Canal
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.channelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Principais Países
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.topCountries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="country" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                }}
              />
              <Bar dataKey="users" fill="#3b82f6" name="Usuários" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Dados atualizados em tempo real • Última atualização: {new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>
    </div>
  );
}
