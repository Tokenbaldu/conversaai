import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Globe,
  Lock,
  Mail,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newContactNotif, setNewContactNotif] = useState(true);
  const [planNotif, setPlanNotif] = useState(true);
  const [automationNotif, setAutomationNotif] = useState(false);

  const { data: currentPlan } = trpc.plans.current.useQuery();

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "U";

  const handleSaveNotifications = () => {
    toast.success("Preferências de notificação salvas!");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas preferências e conta</p>
        </div>

        {/* Profile */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg gradient-primary text-white">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{user?.name || "Usuário"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs border-0 ${user?.role === "admin" ? "bg-amber-400/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                    {user?.role === "admin" ? "Administrador" : "Usuário"}
                  </Badge>
                  {currentPlan?.plan && (
                    <Badge className="text-xs border-0 bg-violet-400/15 text-violet-400">
                      Plano {currentPlan.plan.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Nome</Label>
                <Input defaultValue={user?.name || ""} className="bg-secondary border-border" placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <Input defaultValue={user?.email || ""} className="bg-secondary border-border" placeholder="seu@email.com" type="email" />
              </div>
            </div>
            <Button className="gradient-primary text-white border-0" onClick={() => toast.success("Perfil atualizado!")}>
              Salvar alterações
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure quais notificações você deseja receber por e-mail.</p>
            <div className="space-y-3">
              {[
                { label: "Notificações por e-mail", desc: "Receba alertas importantes por e-mail", state: emailNotifications, setState: setEmailNotifications },
                { label: "Novos cadastros", desc: "Quando um novo usuário se cadastrar na plataforma", state: newContactNotif, setState: setNewContactNotif },
                { label: "Planos contratados", desc: "Quando um plano for assinado ou renovado", state: planNotif, setState: setPlanNotif },
                { label: "Marcos de automação", desc: "Quando automações atingirem marcos importantes", state: automationNotif, setState: setAutomationNotif },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{notif.label}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                  </div>
                  <Switch checked={notif.state} onCheckedChange={notif.setState} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="border-border" onClick={handleSaveNotifications}>
              Salvar preferências
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Autenticação via Manus OAuth</p>
                  <p className="text-xs text-muted-foreground">Sua conta está protegida com OAuth seguro</p>
                </div>
              </div>
              <Badge className="bg-emerald-400/15 text-emerald-400 border-0 text-xs">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Plano atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Plano {currentPlan.plan?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.userPlan?.expiresAt
                      ? `Expira em ${new Date(currentPlan.userPlan.expiresAt).toLocaleDateString("pt-BR")}`
                      : "Plano ativo sem data de expiração"}
                  </p>
                </div>
                <Button variant="outline" className="border-border" onClick={() => window.location.href = "/plans"}>
                  Gerenciar plano
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Nenhum plano ativo</p>
                <Button className="gradient-primary text-white border-0" onClick={() => window.location.href = "/plans"}>
                  Ver planos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
