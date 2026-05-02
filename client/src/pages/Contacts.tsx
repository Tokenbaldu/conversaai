import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Filter,
  Instagram,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  Users,
  ArrowLeft
} from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useState } from "react";
import { toast } from "sonner";

const channelIcons: Record<string, any> = {
  whatsapp: { icon: MessageCircle, color: "text-emerald-400", label: "WhatsApp" },
  instagram: { icon: Instagram, color: "text-pink-400", label: "Instagram" },
  messenger: { icon: MessageSquare, color: "text-blue-400", label: "Messenger" },
  web: { icon: MessageSquare, color: "text-muted-foreground", label: "Web" },
};

function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram" | "messenger" | "web">("web");
  const [notes, setNotes] = useState("");
  const createContact = trpc.contacts.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact.mutateAsync({ name, email, phone, channel, notes });
      toast.success("Contato criado com sucesso!");
      onSuccess();
    } catch {
      toast.error("Erro ao criar contato");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Nome *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="bg-secondary border-border" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Telefone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" className="bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Canal</Label>
        <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="messenger">Messenger</SelectItem>
            <SelectItem value="web">Web</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Notas</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre o contato..." className="bg-secondary border-border resize-none" rows={3} />
      </div>
      <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={createContact.isPending}>
        {createContact.isPending ? "Criando..." : "Criar Contato"}
      </Button>
    </form>
  );
}

function TagManager() {
  const { data: tags = [] } = trpc.contacts.listTags.useQuery();
  const createTag = trpc.contacts.createTag.useMutation();
  const deleteTag = trpc.contacts.deleteTag.useMutation();
  const utils = trpc.useUtils();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"];

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    await createTag.mutateAsync({ name: newTagName, color: newTagColor });
    utils.contacts.listTags.invalidate();
    setNewTagName("");
    toast.success("Tag criada!");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Nome da tag" className="bg-secondary border-border text-sm" />
        <div className="flex gap-1">
          {colors.map((c) => (
            <button key={c} onClick={() => setNewTagColor(c)} className="h-7 w-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: newTagColor === c ? "white" : "transparent" }} />
          ))}
        </div>
        <Button size="sm" onClick={handleCreate} className="gradient-primary text-white border-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${tag.color}20`, color: tag.color }}>
            <span>{tag.name}</span>
            <button onClick={async () => { await deleteTag.mutateAsync({ id: tag.id }); utils.contacts.listTags.invalidate(); }} className="hover:opacity-70">×</button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma tag criada ainda.</p>}
      </div>
    </div>
  );
}

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.contacts.list.useQuery({
    search: search || undefined,
    status: statusFilter as any || undefined,
    page,
    limit: 20,
  });

  const deleteContact = trpc.contacts.delete.useMutation();
  const utils = trpc.useUtils();

  const contacts = data?.items || [];
  const total = data?.total || 0;

  const handleDelete = async (id: number) => {
    await deleteContact.mutateAsync({ id });
    utils.contacts.list.invalidate();
    toast.success("Contato excluído");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
            <p className="text-muted-foreground text-sm mt-1">{total.toLocaleString()} contatos no total</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle>Gerenciar Tags</DialogTitle>
                </DialogHeader>
                <TagManager />
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white border-0 glow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Contato
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Contato</DialogTitle>
                </DialogHeader>
                <ContactForm onSuccess={() => { setDialogOpen(false); utils.contacts.list.invalidate(); }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar contatos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="blocked">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Criado em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-8 bg-secondary rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <p className="text-muted-foreground">Nenhum contato encontrado</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                    const ch = channelIcons[contact.channel || "web"] || channelIcons.web;
                    return (
                      <tr key={contact.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.email || contact.phone || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ch.icon className={`h-4 w-4 ${ch.color}`} />
                            <span className="text-sm text-muted-foreground">{ch.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(contact as any).tags?.slice(0, 3).map((tag: any) => (
                              <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${tag.color}20`, color: tag.color }}>
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs border-0 ${contact.status === "active" ? "bg-emerald-400/15 text-emerald-400" : contact.status === "blocked" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                            {contact.status === "active" ? "Ativo" : contact.status === "blocked" ? "Bloqueado" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Mostrando {Math.min(page * 20, total)} de {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-border">Anterior</Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="border-border">Próximo</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
