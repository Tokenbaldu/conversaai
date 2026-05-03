import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Copy, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminOAuth() {
  const [showSecret, setShowSecret] = useState<Record<number, boolean>>({});
  const [newAppName, setNewAppName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Query para listar aplicações OAuth
  const { data: apps = [], isLoading, refetch } = trpc.oauth.list.useQuery();

  // Mutation para criar aplicação
  const createApp = trpc.oauth.create.useMutation({
    onSuccess: () => {
      toast.success("Aplicação OAuth criada com sucesso!");
      setNewAppName("");
      setIsCreating(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar aplicação");
    },
  });

  // Mutation para deletar aplicação
  const deleteApp = trpc.oauth.delete.useMutation({
    onSuccess: () => {
      toast.success("Aplicação deletada com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar aplicação");
    },
  });

  const handleCreateApp = async () => {
    if (!newAppName.trim()) {
      toast.error("Digite um nome para a aplicação");
      return;
    }
    await createApp.mutateAsync({
      name: newAppName,
      redirectUris: ["https://seu-wordpress.com/wp-admin/admin.php?page=conversaia-cloud"],
      scopes: ["openid", "profile", "email"],
    });
  };

  const handleDeleteApp = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta aplicação?")) {
      await deleteApp.mutateAsync({ id });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const toggleShowSecret = (id: number) => {
    setShowSecret((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de OAuth</h1>
          <p className="text-muted-foreground mt-2">
            Crie e gerencie aplicações OAuth para integração com serviços externos
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Aplicação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Aplicação OAuth</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova aplicação OAuth
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-name">Nome da Aplicação</Label>
                <Input
                  id="app-name"
                  placeholder="Ex: WordPress Integration"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleCreateApp}
                disabled={createApp.isPending}
                className="w-full"
              >
                {createApp.isPending ? "Criando..." : "Criar Aplicação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As credenciais OAuth são usadas para autenticar aplicações externas. Guarde o Client Secret com segurança!
        </AlertDescription>
      </Alert>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && apps.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma aplicação OAuth criada ainda</p>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Aplicação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Apps List */}
      <div className="grid gap-4">
        {apps.map((app: any) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{app.name}</CardTitle>
                  <CardDescription>
                    Criada em {new Date(app.createdAt).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteApp(app.id)}
                  disabled={deleteApp.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client ID */}
              <div>
                <Label className="text-sm font-medium">Client ID</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 bg-muted p-2 rounded text-sm font-mono break-all">
                    {app.clientId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(app.clientId, "Client ID")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Client Secret */}
              <div>
                <Label className="text-sm font-medium">Client Secret</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 bg-muted p-2 rounded text-sm font-mono break-all">
                    {showSecret[app.id] ? app.clientSecret : "•".repeat(32)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShowSecret(app.id)}
                  >
                    {showSecret[app.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(app.clientSecret, "Client Secret")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Redirect URIs */}
              <div>
                <Label className="text-sm font-medium">Redirect URIs</Label>
                <div className="mt-2 space-y-2">
                  {app.redirectUris.map((uri: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded text-sm font-mono break-all">
                        {uri}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(uri, "URI")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scopes */}
              <div>
                <Label className="text-sm font-medium">Escopos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {app.scopes.map((scope: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.isActive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {app.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Como usar no Plugin WordPress
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
          <p>1. Copie o Client ID e Client Secret da aplicação acima</p>
          <p>2. Vá para seu WordPress: ConversaIA Cloud → Configurações</p>
          <p>3. Preencha os campos com as credenciais copiadas</p>
          <p>4. Clique em "Testar Conexão" para validar</p>
          <p>5. Salve as configurações e pronto!</p>
        </CardContent>
      </Card>
    </div>
  );
}
