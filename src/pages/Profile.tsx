import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Lock, AlertCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCompanyName(profile.company_name || "");
    }
  }, [profile]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, companyName }: { name: string; companyName: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      
      // @ts-ignore
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          company_name: companyName,
          nome_alteracao_usada: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil Atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
        variant: "destructive",
      });
    },
  });

  // Mutation to change password
  const changePasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      if (!user?.email) throw new Error("Email não encontrado");

      // Verify old password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) throw new Error("Senha antiga incorreta");

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Senha Alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao alterar senha",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    if (!name.trim() || !companyName.trim()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({ name, companyName });
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Senha Fraca",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      toast({
        title: "Senha Fraca",
        description: "A nova senha deve conter pelo menos 1 caractere especial.",
        variant: "destructive",
      });
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast({
        title: "Senha Fraca",
        description: "A nova senha deve conter pelo menos 1 número.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas Não Coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const canEditName = !profile?.nome_alteracao_usada;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <DashboardHeader />
          
          <main className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Perfil do Usuário
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais e segurança da conta
              </p>
            </div>

            {/* Profile Information */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  {canEditName 
                    ? "Atualize suas informações (permitido apenas 1 vez)" 
                    : "Limite de alteração de nome/empresa atingido (1 vez)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!canEditName || updateProfileMutation.isPending}
                      placeholder="Seu nome"
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da Empresa/Servidor</Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={!canEditName || updateProfileMutation.isPending}
                      placeholder="Nome da empresa"
                      className="glass"
                    />
                  </div>
                </div>

                {!canEditName && (
                  <div className="p-3 glass rounded-lg border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-500">
                      Limite de alteração atingido. Você só pode alterar seu nome e empresa 1 vez por questões de segurança.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSaveProfile}
                  disabled={!canEditName || updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Building className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar Informações"}
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Altere sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old-password">Senha Antiga</Label>
                    <Input
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      placeholder="Digite sua senha antiga"
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      placeholder="Digite sua nova senha"
                      className="glass"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, 1 número e 1 caractere especial
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      placeholder="Confirme sua nova senha"
                      className="glass"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="glass-card border-primary/10">
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano Atual:</span>
                  <span className="font-medium uppercase">{profile?.plan_status || "TRIAL"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Créditos Restantes:</span>
                  <span className="font-medium text-primary">{profile?.credits_balance || 0}</span>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
