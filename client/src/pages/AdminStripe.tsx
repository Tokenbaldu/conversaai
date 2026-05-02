import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminStripe() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const goBack = useGoBack();
  const [formData, setFormData] = useState({
    secretKey: "",
    publishableKey: "",
    webhookSecret: "",
  });

  const { data: settings, isLoading, refetch } = trpc.admin.getStripeSettings.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const updateMutation = trpc.admin.updateStripeSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações do Stripe atualizadas");
      setFormData({ secretKey: "", publishableKey: "", webhookSecret: "" });
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuração do Stripe</h1>
          <p className="text-gray-500">Gerencie as chaves e configurações de pagamento</p>
        </div>

        {/* Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chave Secreta</span>
                <Badge variant={settings?.secretKeyConfigured ? "default" : "secondary"}>
                  {settings?.secretKeyConfigured ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configurada
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Não configurada
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chave Publicável</span>
                <Badge variant={settings?.publishableKeyConfigured ? "default" : "secondary"}>
                  {settings?.publishableKeyConfigured ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configurada
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Não configurada
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook Secret</span>
                <Badge variant={settings?.webhookSecretConfigured ? "default" : "secondary"}>
                  {settings?.webhookSecretConfigured ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configurada
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Não configurada
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert */}
        {!settings?.allConfigured && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Nem todas as configurações do Stripe estão completas. Preencha os campos abaixo para ativar o sistema de pagamento.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Chaves do Stripe</CardTitle>
            <CardDescription>
              Obtenha suas chaves em <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">dashboard.stripe.com</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="secretKey">Chave Secreta (sk_...)</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="sk_test_..."
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a chave atual</p>
              </div>

              <div>
                <Label htmlFor="publishableKey">Chave Publicável (pk_...)</Label>
                <Input
                  id="publishableKey"
                  type="text"
                  placeholder="pk_test_..."
                  value={formData.publishableKey}
                  onChange={(e) => setFormData({ ...formData, publishableKey: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a chave atual</p>
              </div>

              <div>
                <Label htmlFor="webhookSecret">Webhook Secret (whsec_...)</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder="whsec_..."
                  value={formData.webhookSecret}
                  onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a chave atual</p>
              </div>

              <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Atualizar Configurações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-gray-600">
            <p>• As chaves são armazenadas de forma segura como variáveis de ambiente</p>
            <p>• Nunca compartilhe sua chave secreta com ninguém</p>
            <p>• Use chaves de teste para desenvolvimento e chaves de produção para o ambiente live</p>
            <p>• Configure o webhook para receber notificações de pagamentos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
