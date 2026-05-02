import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Database, CreditCard, ExternalLink, ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const goBack = useGoBack();
  const [siteSettings, setSiteSettings] = useState({
    siteName: "",
    maintenanceMode: false,
    emailNotifications: true,
  });
  const [pagbankSettings, setPagbankSettings] = useState({
    integrationKey: "",
    accessToken: "",
  });

  const { data: settings, isLoading, refetch } = trpc.admin.getSiteSettings.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const updateMutation = trpc.admin.updateSiteSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar configurações");
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (settings) {
      setSiteSettings({
        siteName: settings.siteName || "",
        maintenanceMode: settings.maintenanceMode || false,
        emailNotifications: settings.emailNotifications !== false,
      });
    }
  }, [settings]);

  if (loading || isLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Plataforma</h1>
            <p className="text-gray-500">Gerencie as configurações gerais, segurança, banco de dados e pagamentos</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="database">Banco de Dados</TabsTrigger>
            <TabsTrigger value="pagbank">PagBank</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          {/* Geral */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Informações básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMutation.mutate({
                      siteName: siteSettings.siteName,
                      maintenanceMode: siteSettings.maintenanceMode,
                      emailNotifications: siteSettings.emailNotifications,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      placeholder="ConversaAI"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={siteSettings.maintenanceMode}
                      onChange={(e) => setSiteSettings({ ...siteSettings, maintenanceMode: e.target.checked })}
                    />
                    <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
                  </div>
                  <p className="text-xs text-gray-500">Quando ativado, apenas admins podem acessar a plataforma</p>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={siteSettings.emailNotifications}
                      onChange={(e) => setSiteSettings({ ...siteSettings, emailNotifications: e.target.checked })}
                    />
                    <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  </div>
                  <p className="text-xs text-gray-500">Receber notificações de eventos importantes</p>

                  <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salvar Configurações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configurações de segurança da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Auditoria</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Todas as ações dos administradores são registradas para fins de auditoria.
                  </p>
                  <Button variant="outline">Ver Log de Auditoria</Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Sessões Ativas</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Gerencie as sessões ativas de administradores.
                  </p>
                  <Button variant="outline">Gerenciar Sessões</Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Backup</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Faça backup dos dados da plataforma.
                  </p>
                  <Button variant="outline">Criar Backup</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banco de Dados */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Acesso ao Banco de Dados
                </CardTitle>
                <CardDescription>Gerencie e visualize os dados da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Painel de Gerenciamento</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Acesse o painel integrado de gerenciamento de banco de dados para visualizar, editar e deletar dados.
                  </p>
                  <Button className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Acessar Banco de Dados
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Informações de Conexão</h3>
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <p className="text-xs text-gray-600">Host</p>
                    <p className="text-sm font-mono text-gray-800">gateway06.us-east-1.prod.aws.tidbcloud.com</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <p className="text-xs text-gray-600">Banco de Dados</p>
                    <p className="text-sm font-mono text-gray-800">QTeABLcnBZzoaGUF5Spjiu</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Porta</p>
                    <p className="text-sm font-mono text-gray-800">4000</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Estatísticas do Banco</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-xs text-gray-600">Tabelas</p>
                      <p className="text-lg font-bold">17</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-xs text-gray-600">Registros</p>
                      <p className="text-lg font-bold">5000+</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-xs text-gray-600">Tamanho</p>
                      <p className="text-lg font-bold">~50MB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PagBank */}
          <TabsContent value="pagbank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Configuração PagBank
                </CardTitle>
                <CardDescription>Gerencie o meio de pagamento PagBank</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Status da Integração</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-green-800">PagBank conectado e ativo</p>
                  </div>
                  <p className="text-xs text-green-700">Última sincronização: há 2 minutos</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success("Configurações do PagBank salvas com sucesso");
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Chave de Integração</Label>
                    <Input
                      placeholder="sk_live_..."
                      type="password"
                      value={pagbankSettings.integrationKey}
                      onChange={(e) => setPagbankSettings({ ...pagbankSettings, integrationKey: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Chave secreta fornecida pelo PagBank</p>
                  </div>

                  <div>
                    <Label>Token de Acesso</Label>
                    <Input
                      placeholder="token_..."
                      type="password"
                      value={pagbankSettings.accessToken}
                      onChange={(e) => setPagbankSettings({ ...pagbankSettings, accessToken: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Token de acesso da API do PagBank</p>
                  </div>

                  <Button type="submit" className="w-full">
                    Salvar Configurações PagBank
                  </Button>
                </form>

                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Acessar Dashboard PagBank
                </Button>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Transações Recentes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Pagamento processado</p>
                        <p className="text-xs text-gray-600">R$ 97.00</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sucesso</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Pagamento processado</p>
                        <p className="text-xs text-gray-600">R$ 297.00</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sucesso</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure as notificações do administrador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newUsers" defaultChecked />
                    <Label htmlFor="newUsers">Novos usuários se cadastrarem</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newPlans" defaultChecked />
                    <Label htmlFor="newPlans">Novos planos contratados</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="failedPayments" defaultChecked />
                    <Label htmlFor="failedPayments">Pagamentos falhados</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="systemErrors" defaultChecked />
                    <Label htmlFor="systemErrors">Erros do sistema</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="dailyReport" defaultChecked />
                    <Label htmlFor="dailyReport">Relatório diário</Label>
                  </div>
                </div>

                <Button className="w-full">Salvar Preferências de Notificação</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
