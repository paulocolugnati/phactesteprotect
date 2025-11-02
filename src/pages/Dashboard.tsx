import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MetricCard } from "@/components/MetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCode, AlertCircle, Coins, Lock, ArrowRight } from "lucide-react";
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
            {/* Welcome Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Bem-vindo de volta, <span className="text-primary">{profile?.name || 'User'}</span>
              </h1>
              <p className="text-muted-foreground">
                Centro de Controle da Segurança de Propriedade Intelectual
              </p>
            </div>

            {/* Main Status Card - Prioridade Máxima */}
            <Card className={`glass-card border-2 ${isNewUser ? "border-primary/50" : "border-green-500/50"} animate-fade-in`}>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle className="text-2xl">
                    STATUS DE PROTEÇÃO DA PROPRIEDADE INTELECTUAL
                  </CardTitle>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {isNewUser ? (
                          <>
                            <AlertCircle className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Nível de Risco do IP</p>
                              <p className="text-3xl font-bold text-primary">ALTO 🔴</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Shield className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Nível de Proteção do IP</p>
                              <p className="text-3xl font-bold text-green-500">
                                {Math.round((scriptsCount / (scriptsCount + 1)) * 100)}% Protegido 🟢
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <CardDescription className="text-base">
                        {isNewUser
                          ? "Seu código está vulnerável a vazamentos e engenharia reversa. Ação imediata necessária."
                          : `${scriptsCount} script${scriptsCount > 1 ? 's' : ''} sob proteção ativa com criptografia de nível empresarial.`}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 glass rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Ação Recomendada
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isNewUser
                      ? "Criptografe seus scripts imediatamente para evitar roubo de propriedade intelectual e vazamentos de lógica de negócio."
                      : "Continue monitorando suas chaves de licença ativas. Revogue chaves comprometidas imediatamente."}
                  </p>
                </div>
                
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  <Lock className="mr-2 h-5 w-5" />
                  {isNewUser ? "Proteger Minha Propriedade Intelectual Agora" : "Criptografar Novo Script"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Metrics Grid - Cards de Métricas */}
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Chaves de Licença Ativas"
                value={scriptsCount || 0}
                icon={Coins}
                description="Gestão de vendas e distribuição"
              />
              
              <MetricCard
                title="Créditos de Ofuscação"
                value="Ilimitado"
                icon={FileCode}
                description={`Plano ${profile?.plan_status || 'trial'}`}
              />
              
              <MetricCard
                title="Vulnerabilidades Descobertas"
                value={0}
                icon={Shield}
                description="Últimos 7 dias"
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
