import { NavLink } from "react-router-dom";
import {
  Home,
  Shield,
  Key,
  AlertTriangle,
  Clock,
  HelpCircle,
  LogOut,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Criptografia", url: "/dashboard/encryption", icon: Shield },
  { title: "Gerenciamento de Chaves", url: "/dashboard/keys", icon: Key },
  { title: "Análise de Vulnerabilidade", url: "/dashboard/analysis", icon: AlertTriangle },
  { title: "Histórico", url: "/dashboard/history", icon: Clock },
  { title: "Ajuda", url: "/dashboard/help", icon: HelpCircle },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="glass border-r border-primary/10 backdrop-blur-lg">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "text-center" : ""}>
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
              
              {/* Logout button */}
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
    </Sidebar>
  );
}
