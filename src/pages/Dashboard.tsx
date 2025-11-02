import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MetricCard } from "@/components/MetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCode, AlertCircle, Coins, Lock, ArrowRight, Key } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch user profile
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

  // Fetch scripts count
  const { data: scriptsCount } = useQuery({
    queryKey: ["scripts-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      // @ts-ignore - Types will be regenerated after migration
      const { count } = await supabase
        .from("scripts_protected")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch activity logs
  const { data: activityLogs } = useQuery({
    queryKey: ["activity-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // @ts-ignore - Types will be regenerated after migration
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isNewUser = scriptsCount === 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            {/* Welcome Message - Glass Card */}
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    Olá, <span className="text-primary">{profile?.name || 'User'}</span>! <span className="text-green-400">Sua Propriedade Intelectual está protegida.</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Servidor/Loja: <span className="font-semibold text-foreground">{profile?.company_name || 'Empresa'}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card - Sua Proteção de IP Exige Atenção? */}
            <Card className={`glass-card border-2 ${isNewUser ? "border-primary/50" : "border-green-500/50"} animate-fade-in`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {isNewUser ? (
                    <AlertCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <Shield className="h-6 w-6 text-green-500" />
                  )}
                  Sua Proteção de IP Exige Atenção?
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {isNewUser
                    ? `Você tem ${isNewUser ? 'scripts' : '0 scripts'} não protegidos. Proteger o IP evita a pirataria e vazamentos.`
                    : `Seus ${scriptsCount} scripts estão protegidos. Continue monitorando suas chaves de licença.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/dashboard/encryption'}
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Ir para Criptografia de Scripts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Metrics Grid - Cards de Métricas */}
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Status de Proteção"
                value={isNewUser ? "0%" : `${Math.round((scriptsCount / (scriptsCount + 1)) * 100)}%`}
                icon={Shield}
                description="Média de proteção dos seus recursos"
                valueColor={isNewUser ? "text-red-500" : "text-green-500"}
              />
              
              <MetricCard
                title="Chaves de Licença"
                value={scriptsCount || 0}
                icon={Key}
                description={`Máximo de ${profile?.plan_status === 'trial' ? '1' : '∞'} chave(s) para plano ${profile?.plan_status?.toUpperCase() || 'TRIAL'}`}
                valueColor="text-primary"
              />
              
              <MetricCard
                title="Vulnerabilidade"
                value="0"
                icon={AlertCircle}
                description="Alertas críticos detectados"
                valueColor="text-green-500"
              />

              <MetricCard
                title="Uso de Créditos"
                value={`${10 - (profile?.credits_balance || 0)}`}
                icon={Coins}
                description={`Créditos gastos (Restam: ${profile?.credits_balance || 0})`}
                valueColor="text-yellow-500"
              />
            </div>

            {/* Activity Feed */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimos eventos e notificações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg glass hover:bg-primary/5 transition-colors"
                      >
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
