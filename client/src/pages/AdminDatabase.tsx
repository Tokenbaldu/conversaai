import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Database, Download, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminDatabase() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const goBack = useGoBack();
  const [selectedTable, setSelectedTable] = useState("users");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Apenas administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tables = [
    { name: "users", label: "Usuários", records: 8 },
    { name: "plans", label: "Planos", records: 3 },
    { name: "user_plans", label: "Planos do Usuário", records: 12 },
    { name: "channels", label: "Canais", records: 24 },
    { name: "contacts", label: "Contatos", records: 156 },
    { name: "flows", label: "Fluxos", records: 42 },
    { name: "conversations", label: "Conversas", records: 89 },
    { name: "messages", label: "Mensagens", records: 1203 },
    { name: "broadcasts", label: "Broadcasts", records: 15 },
    { name: "automations", label: "Automações", records: 28 },
    { name: "tags", label: "Tags", records: 34 },
    { name: "analytics_events", label: "Eventos de Análise", records: 2156 },
    { name: "audit_logs", label: "Logs de Auditoria", records: 89 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Fixed at top left */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="lg"
          onClick={goBack}
          className="bg-white dark:bg-slate-900 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline font-semibold">Voltar</span>
        </Button>
      </div>
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Database className="w-8 h-8" />
            Gerenciamento de Banco de Dados
          </h1>
          <p className="text-gray-500">Visualize, edite e gerencie os dados da plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com tabelas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tabelas</CardTitle>
                <CardDescription>Selecione uma tabela para visualizar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTable === table.name
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="font-medium text-sm">{table.label}</p>
                    <p className="text-xs opacity-75">{table.records} registros</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {tables.find((t) => t.name === selectedTable)?.label}
                  </CardTitle>
                  <CardDescription>
                    {tables.find((t) => t.name === selectedTable)?.records} registros
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Atualizando...")}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Exportando...")}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">ID</th>
                        <th className="text-left py-2 px-4 font-medium">Nome</th>
                        <th className="text-left py-2 px-4 font-medium">Email</th>
                        <th className="text-left py-2 px-4 font-medium">Criado em</th>
                        <th className="text-left py-2 px-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable === "users" && (
                        <>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">1</td>
                            <td className="py-2 px-4">Dma Investimentos</td>
                            <td className="py-2 px-4">admin@conversaai.com</td>
                            <td className="py-2 px-4">2026-01-15</td>
                            <td className="py-2 px-4">
                              <Button variant="ghost" size="sm">Editar</Button>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">2</td>
                            <td className="py-2 px-4">João Silva</td>
                            <td className="py-2 px-4">joao@example.com</td>
                            <td className="py-2 px-4">2026-02-01</td>
                            <td className="py-2 px-4">
                              <Button variant="ghost" size="sm">Editar</Button>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        </>
                      )}
                      {selectedTable !== "users" && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            Dados da tabela {tables.find((t) => t.name === selectedTable)?.label} serão exibidos aqui
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Informações de conexão */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Conexão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Host</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">gateway06.us-east-1.prod.aws.tidbcloud.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Porta</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">4000</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Banco de Dados</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">QTeABLcnBZzoaGUF5Spjiu</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Usuário</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">root</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Use essas credenciais para conectar-se ao banco de dados via cliente SQL externo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
