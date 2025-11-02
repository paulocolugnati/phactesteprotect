import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  Shield,
  Key,
  AlertTriangle,
  Clock,
  HelpCircle,
  LogOut,
  User,
  CreditCard,
  Coins,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

const menuSections = [
  {
    label: "PRINCIPAL",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
    ]
  },
  {
    label: "SERVIÇOS DE PROTEÇÃO",
    items: [
      { title: "Criptografia", url: "/dashboard/encryption", icon: Shield },
      { title: "Gerenciamento de Keys", url: "/dashboard/keys", icon: Key },
      { title: "Análise de Vulnerabilidade", url: "/dashboard/analysis", icon: AlertTriangle },
    ]
  },
  {
    label: "LOGS E AJUDA",
    items: [
      { title: "Histórico", url: "/dashboard/history", icon: Clock },
      { title: "Ajuda", url: "/dashboard/help", icon: HelpCircle },
    ]
  },
  {
    label: "CONFIGURAÇÕES",
    items: [
      { title: "Perfil", url: "/dashboard/profile", icon: User },
      { title: "Faturamento", url: "/dashboard/billing", icon: CreditCard },
    ]
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const collapsed = state === "collapsed";

  // Fetch user profile for credits
  const { data: profile } = useQuery({
    queryKey: ["profile-sidebar", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // @ts-ignore
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="glass border-r border-primary/10 backdrop-blur-lg">
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className={collapsed ? "text-center text-xs" : "text-xs"}>
              {!collapsed && section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-bold ${
                            isActive
                              ? "bg-primary/20 text-primary backdrop-blur-sm border border-primary/20"
                              : "text-[#DDDDDD] hover:text-primary hover:bg-primary/10 hover:backdrop-blur-sm"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-bold">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Logout button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-destructive/10 text-destructive w-full font-bold"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-bold">Sair</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Plan and Credits */}
      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-primary/10">
          <Card className="glass-card border-primary/20 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">PLANO ATUAL</span>
                <span className="text-xs font-bold text-primary uppercase">
                  {profile?.plan_status || "TRIAL"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Créditos Restantes
                </span>
                <span className="text-sm font-bold text-primary">
                  {profile?.credits_balance || 0}
                </span>
              </div>
            </div>
          </Card>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
