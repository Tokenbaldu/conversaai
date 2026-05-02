import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  MessageSquare,
  Radio,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const navItems = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/flows", icon: GitBranch, label: "Flow Builder" },
      { href: "/automations", icon: Zap, label: "Automações" },
      { href: "/broadcasts", icon: Radio, label: "Broadcast" },
    ],
  },
  {
    group: "Comunicação",
    items: [
      { href: "/inbox", icon: Inbox, label: "Chat ao Vivo", badge: "3" },
      { href: "/contacts", icon: Users, label: "Contatos" },
    ],
  },
  {
    group: "Inteligência",
    items: [
      { href: "/ai", icon: Bot, label: "IA & Respostas" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    group: "Configurações",
    items: [
      { href: "/integrations", icon: Zap, label: "Integrações", badge: "3" },
      { href: "/templates", icon: LayoutTemplate, label: "Templates" },
      { href: "/channels", icon: MessageSquare, label: "Canais" },
      { href: "/plans", icon: CreditCard, label: "Planos" },
      { href: "/settings", icon: Settings, label: "Configurações" },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full gradient-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex-shrink-0 h-8 w-8 rounded-lg gradient-primary flex items-center justify-center glow-sm">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground font-['Plus_Jakarta_Sans']">
                ConversaAI
              </span>
              <span className="text-xs text-muted-foreground">Marketing Platform</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((group) => (
            <div key={group.group} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                            collapsed && "justify-center"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "flex-shrink-0 h-4 w-4 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <Badge
                                  variant="default"
                                  className="h-5 px-1.5 text-xs gradient-primary text-white border-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                          {isActive && (
                            <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full" />
                          )}
                        </div>
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-popover border-border">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-xs gradient-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">
              {navItems
                .flatMap((g) => g.items)
                .find(
                  (i) =>
                    location === i.href ||
                    (i.href !== "/dashboard" && location.startsWith(i.href))
                )?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs gradient-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
