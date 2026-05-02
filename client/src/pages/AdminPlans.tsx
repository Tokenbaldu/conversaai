import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPlans() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    name: "",
    priceMonthly: 0,
    priceAnnual: 0,
    maxContacts: 100,
    maxFlows: 3,
    maxBroadcasts: 1,
    maxChannels: 1,
    aiEnabled: false,
  });

  const { data: plans, isLoading, refetch } = trpc.admin.listPlans.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const updatePlanMutation = trpc.admin.updatePlan.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso");
      setEditingPlan(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar plano");
    },
  });

  const createPlanMutation = trpc.admin.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso");
      setCreatingPlan(false);
      setNewPlanData({
        name: "",
        priceMonthly: 0,
        priceAnnual: 0,
        maxContacts: 100,
        maxFlows: 3,
        maxBroadcasts: 1,
        maxChannels: 1,
        aiEnabled: false,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar plano");
    },
  });

  const deletePlanMutation = trpc.admin.deletePlan.useMutation({
    onSuccess: () => {
      toast.success("Plano deletado com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar plano");
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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Planos</h1>
          <p className="text-gray-500">Crie, edite e configure os planos de assinatura</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Planos de Assinatura</CardTitle>
                <CardDescription>Total: {plans?.length || 0} planos</CardDescription>
              </div>
              <Dialog open={creatingPlan} onOpenChange={setCreatingPlan}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Plano</DialogTitle>
                    <DialogDescription>Adicione um novo plano de assinatura</DialogDescription>
                  </DialogHeader>
                  <CreatePlanForm
                    data={newPlanData}
                    onChange={setNewPlanData}
                    onSubmit={() => {
                      createPlanMutation.mutate({
                        name: newPlanData.name,
                        priceMonthly: Math.round(newPlanData.priceMonthly * 100),
                        priceAnnual: Math.round(newPlanData.priceAnnual * 100),
                        maxContacts: newPlanData.maxContacts,
                        maxFlows: newPlanData.maxFlows,
                        maxBroadcasts: newPlanData.maxBroadcasts,
                        maxChannels: newPlanData.maxChannels,
                        aiEnabled: newPlanData.aiEnabled,
                      });
                    }}
                    isLoading={createPlanMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço Mensal</TableHead>
                    <TableHead>Preço Anual</TableHead>
                    <TableHead>Max Contatos</TableHead>
                    <TableHead>Max Fluxos</TableHead>
                    <TableHead>IA Habilitada</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!plans || plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum plano encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>R$ {(plan.priceMonthly / 100).toFixed(2)}</TableCell>
                        <TableCell>R$ {(plan.priceAnnual / 100).toFixed(2)}</TableCell>
                        <TableCell>{plan.maxContacts}</TableCell>
                        <TableCell>{plan.maxFlows}</TableCell>
                        <TableCell>{plan.aiEnabled ? "Sim" : "Não"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editingPlan?.id === plan.id} onOpenChange={(open) => !open && setEditingPlan(null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Plano: {plan.name}</DialogTitle>
                                  <DialogDescription>Atualize os detalhes do plano</DialogDescription>
                                </DialogHeader>
                                <EditPlanForm
                                  plan={editingPlan || plan}
                                  onSubmit={(data: any) => {
                                    updatePlanMutation.mutate({
                                      planId: plan.id,
                                      ...data,
                                    });
                                  }}
                                  isLoading={updatePlanMutation.isPending}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja deletar este plano?")) {
                                  deletePlanMutation.mutate({ planId: plan.id });
                                }
                              }}
                              disabled={deletePlanMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreatePlanForm({ data, onChange, onSubmit, isLoading }: any) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!data.name.trim()) {
          toast.error("Nome do plano é obrigatório");
          return;
        }
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <Label>Nome do Plano</Label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Ex: Premium"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preço Mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.priceMonthly}
            onChange={(e) => onChange({ ...data, priceMonthly: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label>Preço Anual (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.priceAnnual}
            onChange={(e) => onChange({ ...data, priceAnnual: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Contatos</Label>
          <Input
            type="number"
            value={data.maxContacts}
            onChange={(e) => onChange({ ...data, maxContacts: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Fluxos</Label>
          <Input
            type="number"
            value={data.maxFlows}
            onChange={(e) => onChange({ ...data, maxFlows: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Broadcasts</Label>
          <Input
            type="number"
            value={data.maxBroadcasts}
            onChange={(e) => onChange({ ...data, maxBroadcasts: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Canais</Label>
          <Input
            type="number"
            value={data.maxChannels}
            onChange={(e) => onChange({ ...data, maxChannels: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="aiEnabled"
          checked={data.aiEnabled}
          onChange={(e) => onChange({ ...data, aiEnabled: e.target.checked })}
        />
        <Label htmlFor="aiEnabled">IA Habilitada</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Criar Plano
      </Button>
    </form>
  );
}

function EditPlanForm({ plan, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    priceMonthly: plan.priceMonthly / 100,
    priceAnnual: plan.priceAnnual / 100,
    maxContacts: plan.maxContacts,
    maxFlows: plan.maxFlows,
    maxBroadcasts: plan.maxBroadcasts,
    maxChannels: plan.maxChannels,
    aiEnabled: plan.aiEnabled,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          priceMonthly: Math.round(formData.priceMonthly * 100),
          priceAnnual: Math.round(formData.priceAnnual * 100),
          maxContacts: formData.maxContacts,
          maxFlows: formData.maxFlows,
          maxBroadcasts: formData.maxBroadcasts,
          maxChannels: formData.maxChannels,
          aiEnabled: formData.aiEnabled,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preço Mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.priceMonthly}
            onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label>Preço Anual (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.priceAnnual}
            onChange={(e) => setFormData({ ...formData, priceAnnual: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Contatos</Label>
          <Input
            type="number"
            value={formData.maxContacts}
            onChange={(e) => setFormData({ ...formData, maxContacts: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Fluxos</Label>
          <Input
            type="number"
            value={formData.maxFlows}
            onChange={(e) => setFormData({ ...formData, maxFlows: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Broadcasts</Label>
          <Input
            type="number"
            value={formData.maxBroadcasts}
            onChange={(e) => setFormData({ ...formData, maxBroadcasts: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Canais</Label>
          <Input
            type="number"
            value={formData.maxChannels}
            onChange={(e) => setFormData({ ...formData, maxChannels: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="aiEnabled"
          checked={formData.aiEnabled}
          onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
        />
        <Label htmlFor="aiEnabled">IA Habilitada</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Salvar Alterações
      </Button>
    </form>
  );
}
