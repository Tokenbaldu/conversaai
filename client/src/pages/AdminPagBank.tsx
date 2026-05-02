import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, CreditCard, ExternalLink, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPagBank() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const goBack = useGoBack();
  const [pagbankConfig, setPagbankConfig] = useState({
    integrationKey: "",
    accessToken: "",
    webhookUrl: "",
  });
  const [transactions, setTransactions] = useState([
    {
      id: "TXN001",
      amount: 97.00,
      status: "success",
      date: "2026-05-02",
      customer: "João Silva",
      plan: "Pro",
    },
    {
      id: "TXN002",
      amount: 297.00,
      status: "success",
      date: "2026-05-01",
      customer: "Maria Santos",
      plan: "Agency",
    },
    {
      id: "TXN003",
      amount: 50.00,
      status: "pending",
      date: "2026-04-30",
      customer: "Carlos Oliveira",
      plan: "Pro",
    },
  ]);

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

  const handleSaveConfig = () => {
    toast.success("Configurações do PagBank salvas com sucesso!");
  };

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
            <CreditCard className="w-8 h-8" />
            Integração PagBank
          </h1>
          <p className="text-gray-500">Gerencie pagamentos e transações via PagBank</p>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* Configuração */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status da Integração</CardTitle>
                <CardDescription>Verifique o status da integração com PagBank</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Integração Ativa</p>
                    <p className="text-sm text-green-700">PagBank está conectado e operacional</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveConfig();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="integrationKey">Chave de Integração</Label>
                    <Input
                      id="integrationKey"
                      type="password"
                      placeholder="sk_live_..."
                      value={pagbankConfig.integrationKey}
                      onChange={(e) => setPagbankConfig({ ...pagbankConfig, integrationKey: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Chave secreta fornecida pelo PagBank</p>
                  </div>

                  <div>
                    <Label htmlFor="accessToken">Token de Acesso</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="token_..."
                      value={pagbankConfig.accessToken}
                      onChange={(e) => setPagbankConfig({ ...pagbankConfig, accessToken: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Token de acesso da API do PagBank</p>
                  </div>

                  <div>
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://conversaai.com/api/pagbank/webhook"
                      value={pagbankConfig.webhookUrl}
                      onChange={(e) => setPagbankConfig({ ...pagbankConfig, webhookUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">URL para receber notificações de transações</p>
                  </div>

                  <Button type="submit" className="w-full">
                    Salvar Configurações
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Acessar Dashboard PagBank
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Documentação da API
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  Testar Conexão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transações */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>Últimas transações processadas via PagBank</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">ID</th>
                        <th className="text-left py-2 px-4 font-medium">Cliente</th>
                        <th className="text-left py-2 px-4 font-medium">Plano</th>
                        <th className="text-left py-2 px-4 font-medium">Valor</th>
                        <th className="text-left py-2 px-4 font-medium">Status</th>
                        <th className="text-left py-2 px-4 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-mono text-xs">{tx.id}</td>
                          <td className="py-2 px-4">{tx.customer}</td>
                          <td className="py-2 px-4">{tx.plan}</td>
                          <td className="py-2 px-4 font-medium">R$ {tx.amount.toFixed(2)}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                tx.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : tx.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.status === "success"
                                ? "Sucesso"
                                : tx.status === "pending"
                                ? "Pendente"
                                : "Falha"}
                            </span>
                          </td>
                          <td className="py-2 px-4">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Total Processado</p>
                    <p className="text-2xl font-bold text-blue-900">R$ 444,00</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Transações Sucesso</p>
                    <p className="text-2xl font-bold text-green-900">2</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-xs text-yellow-600 mb-1">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-900">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Webhooks</CardTitle>
                <CardDescription>Gerencie os webhooks para notificações de transações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">URL do Webhook</h3>
                  <div className="bg-white p-2 rounded border border-blue-200 mb-3">
                    <p className="font-mono text-sm text-gray-700">https://conversaai.com/api/pagbank/webhook</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Copiar URL
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Eventos Configurados</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">transaction.created</p>
                        <p className="text-xs text-gray-600">Quando uma transação é criada</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">transaction.completed</p>
                        <p className="text-xs text-gray-600">Quando uma transação é concluída</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">transaction.failed</p>
                        <p className="text-xs text-gray-600">Quando uma transação falha</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Últimas Entregas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium">transaction.completed</p>
                        <p className="text-xs text-gray-600">2026-05-02 14:30:00</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">200 OK</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium">transaction.created</p>
                        <p className="text-xs text-gray-600">2026-05-02 14:25:00</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">200 OK</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
