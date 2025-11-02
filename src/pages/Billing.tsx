import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Coins, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Billing() {
  const { user } = useAuth();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
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

  // Fetch credit transactions
  const { data: transactions } = useQuery({
    queryKey: ["credit-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // @ts-ignore
      const { data } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const planFeatures = {
    trial: {
      name: "Trial",
      price: "Grátis",
      features: [
        "10 créditos iniciais",
        "Criptografia Padrão (4 créditos)",
        "Análise de Vulnerabilidade (2 créditos)",
        "Máximo 1 chave de licença",
        "Suporte por email",
      ],
    },
    pro: {
      name: "Pro",
      price: "R$ 99,90/mês",
      features: [
        "50 créditos mensais",
        "Todas as criptografias disponíveis",
        "Análise de Vulnerabilidade ilimitada",
        "Chaves de licença ilimitadas",
        "Suporte prioritário",
        "Relatórios avançados",
      ],
    },
  };

  const currentPlan = profile?.plan_status || "trial";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Faturamento e Créditos</h1>
              <p className="text-muted-foreground">
                Gerencie seu plano e acompanhe o uso de créditos
              </p>
            </div>

            {/* Current Plan Card */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Plano Atual
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Seu plano {planFeatures[currentPlan as keyof typeof planFeatures].name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2 border-primary">
                    {currentPlan.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Coins className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Créditos Restantes</p>
                      <p className="text-3xl font-bold text-primary">{profile?.credits_balance || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Créditos Usados</p>
                    <p className="text-xl font-semibold">{10 - (profile?.credits_balance || 0)}</p>
                  </div>
                </div>

                {currentPlan === "trial" && (
                  <div className="p-4 glass rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-yellow-500 mb-3">
                      ⚠️ Você está no plano Trial com créditos limitados. Faça upgrade para o plano Pro para recursos ilimitados.
                    </p>
                    <Button variant="default" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Fazer Upgrade para Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(planFeatures).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`glass-card ${
                    currentPlan === key ? "border-primary" : "border-primary/10"
                  }`}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-primary">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {currentPlan !== key && (
                      <Button variant="outline" className="w-full" disabled={key === "trial"}>
                        {key === "trial" ? "Plano Atual" : "Selecionar Plano"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction History */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Histórico de Transações
                </CardTitle>
                <CardDescription>
                  Acompanhe o uso dos seus créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 glass rounded-lg border border-primary/10"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {transaction.operation_type === "encryption" && "Criptografia de Script"}
                            {transaction.operation_type === "analysis" && "Análise de Vulnerabilidade"}
                            {transaction.operation_type === "refund" && "Reembolso de Créditos"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(transaction.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.transaction_type === "debit" ? "text-red-500" : "text-green-500"
                          }`}>
                            {transaction.transaction_type === "debit" ? "-" : "+"}{transaction.amount}
                          </p>
                          <p className="text-xs text-muted-foreground">créditos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma transação registrada ainda
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
