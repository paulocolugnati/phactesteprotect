import { Shield, User, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // @ts-ignore - Types will be regenerated after migration
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
    <header className="sticky top-0 z-50 glass border-b border-primary/10 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-primary/10" />
          
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-glow" />
            <span className="text-xl font-bold hidden sm:block">
              <span className="text-primary">Phac</span>Protect
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">
                  {profile?.company_name || "Usuário"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass border-primary/10">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  <p className="text-xs text-primary capitalize">{profile?.plan_status || 'trial'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
