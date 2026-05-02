import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [siteSettings, setSiteSettings] = useState({
    siteName: "",
    maintenanceMode: false,
    emailNotifications: true,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Plataforma</h1>
          <p className="text-gray-500">Gerencie as configurações gerais e segurança do site</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
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
